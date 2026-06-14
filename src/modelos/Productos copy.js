// modelos/Productos.js
import mongoose from "mongoose";
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = './data';

const productoSchema = new mongoose.Schema(
  {
    idLote: {
      type: Number,
      unique: true,
    },
    idProducto: {
      type: Number,
      required: true,
      // Referencia lógica al campo idProducto de MaestroProducto
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    FechaVencimiento: {
      type: Date,
      default: "2027-01-01",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-increment para idLote (opcional, ver explicación)
productoSchema.pre("save", async function (next) {
  if (this.isNew && !this.idLote) {
    const lastLote = await mongoose.model("Producto").findOne().sort({ idLote: -1 });
    this.idLote = lastLote ? lastLote.idLote + 1 : 1;
  }
  next();
});

// Métodos estáticos (similares a los que tenía con JSON)
productoSchema.statics.obtenerTodos = async function () {
  return await this.find().lean();
};

productoSchema.statics.obtenerPorId = async function (id) {
  return await this.findOne({ id }).lean();
};

productoSchema.statics.obtenerPorIdProducto = async function (idProducto) {
  return await this.find({ idProducto }).lean();
};

productoSchema.statics.crearProducto = async function (dataProducto) {
  return await this.create(dataProducto);
};

productoSchema.statics.actualizarStock = async function (id, nuevoStock) {
  return await this.findOneAndUpdate(
    { idLote: id },
    { stock: nuevoStock },
    { new: true }
  ).lean();
};

productoSchema.statics.actualizarPrecio = async function (idLote, nuevoPrecio) {
  return await this.findOneAndUpdate(
    { idLote },
    { precio: nuevoPrecio },
    { new: true }
  ).lean();
};

productoSchema.statics.eliminarPorIdLote = async function (idLote) {
  return await this.findOneAndDelete({ idLote });
};

export const obtenerSaldoLote = async function ( idLote ) {
  try {
    // Primero ubico el producto por su idLote
    //const producto = await mongoose.model("Producto").findOne({ idLote }).lean();
    let saldo = 0;
    var data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const producto = productos.find(p => p.idLote === idLote);
    if (!producto) {
      throw new Error(`Producto con idLote ${idLote} no encontrado`);
    }
    saldo = producto.stock;
    var data = await fs.readFile(
      path.join(__dirname, "../data/DetalleVentas.json"),
      "utf-8",  
    );
    const detalleVentas = JSON.parse(data);
    const ventasProducto = detalleVentas.filter(dv => dv.idLote === idLote);
    const totalVendidos = ventasProducto.reduce((total, venta) => total + venta.cantidad, 0);
    saldo -= totalVendidos;

  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
  finally {
  }
  return { idLote, saldo };
};

export async function obtenerSaldo(idProducto) {
  // 1. Leer Productos.json
  const productos = JSON.parse(await fs.readFile('./data/Productos.json', 'utf8'));
  
  // 2. Filtrar lotes del producto
  const lotesDelProducto = productos.filter(p => p.idProducto === idProducto);
  
  if (lotesDelProducto.length === 0) return 0;
  
  // 3. Sumar saldo de cada lote
  let saldoTotal = 0;
  for (const lote of lotesDelProducto) {
    const saldoLote = await obtenerSaldoLote(lote.idLote);
    saldoTotal += saldoLote;
  }
  return saldoTotal;
}

export async function obtenerProductosConBajoStockOptimizado() {
  const [maestro, productos, ventas] = await Promise.all([
    fs.readFile(path.join(DATA_PATH, 'MaestroProductos.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(DATA_PATH, 'Productos.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(DATA_PATH, 'DetalleVentas.json'), 'utf8').then(JSON.parse)
  ]);

  // Calcular ventas por lote
  const ventasPorLote = {};
  for (const v of ventas) {
    ventasPorLote[v.idLote] = (ventasPorLote[v.idLote] || 0) + v.cantidad;
  }

  // Calcular saldo por producto
  const saldoPorProducto = {};
  for (const lote of productos) {
    const saldoLote = lote.stock - (ventasPorLote[lote.idLote] || 0);
    saldoPorProducto[lote.idProducto] = (saldoPorProducto[lote.idProducto] || 0) + saldoLote;
  }

  // Filtrar
  return maestro
    .filter(prod => (saldoPorProducto[prod.idProducto] || 0) < prod.stockminimo)
    .map(prod => ({
      idProducto: prod.idProducto,
      nombre: prod.nombre,
      saldoActual: saldoPorProducto[prod.idProducto] || 0,
      stockMinimo: prod.stockminimo,
      diferencia: prod.stockminimo - (saldoPorProducto[prod.idProducto] || 0)
    }));
}

// Nueva función: valor inventario por producto
async function obtenerValorInventario(idProducto) {
  const productos = JSON.parse(await fs.readFile(path.join(DATA_PATH, 'Productos.json'), 'utf8'));
  const lotesDelProducto = productos.filter(p => p.idProducto === idProducto);
  
  let valorTotal = 0;
  for (const lote of lotesDelProducto) {
    const saldo = await obtenerSaldoLote(lote.idLote);
    valorTotal += lote.precio * saldo;
  }
  return valorTotal;
}

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;
