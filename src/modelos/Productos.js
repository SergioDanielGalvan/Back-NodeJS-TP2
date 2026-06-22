// modelos/Productos.js
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la carpeta data (ajústala si es necesario)
const DATA_PATH = path.join(__dirname, "../data");

const productoSchema = new mongoose.Schema(
  {
    idLote: { type: Number, unique: true },
    idProducto: { type: Number, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    FechaVencimiento: { type: Date, default: "2027-01-01" },
  },
  { timestamps: true, versionKey: false }
);

// Auto-increment para idLote
productoSchema.pre("save", async function (next) {
  if (this.isNew && !this.idLote) {
    const lastLote = await mongoose.model("Producto").findOne().sort({ idLote: -1 });
    this.idLote = lastLote ? lastLote.idLote + 1 : 1;
  }
  next();
});

// Métodos estáticos
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

// ----- Funciones de saldo -----
export async function getSaldoLote( idLote ) {
  try {
    const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
    const productos = JSON.parse(productosData);
    const producto = productos.find( p => p.idLote === idLote );
    if (!producto) throw new Error(`Producto con idLote ${idLote} no encontrado`);

    const ventasData = await fs.readFile(path.join(DATA_PATH, "DetalleVentas.json"), "utf8");
    const detalleVentas = JSON.parse(ventasData);
    const ventasProducto = detalleVentas.filter( dv => dv.idLote === idLote );
    const totalVendidos = ventasProducto.reduce((total, venta) => total + venta.cantidad, 0);

    const saldo = producto.stock - totalVendidos;
    return { "idLote": idLote, "Saldo": saldo };
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
};

export async function getSaldoProducto( idProducto ) {
  const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
  const productos = JSON.parse(productosData);
  const lotesDelProducto = productos.filter( p => p.idProducto === idProducto );
  if (lotesDelProducto.length === 0) return 0;

  let saldoTotal = 0;
  for (const lote of lotesDelProducto) {
    const saldo = await getSaldoLote(lote.idLote);
    saldoTotal += saldo.Saldo;
  }
  return { "idProducto": idProducto, "Saldo": saldoTotal };
}

export async function getProductosConBajoStockOptimizado() {
  const [maestro, productos, ventas] = await Promise.all([
    fs.readFile(path.join(DATA_PATH, "MaestroProductos.json"), "utf8").then(JSON.parse),
    fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8").then(JSON.parse),
    fs.readFile(path.join(DATA_PATH, "DetalleVentas.json"), "utf8").then(JSON.parse),
  ]);

  const ventasPorLote = {};
  for (const v of ventas) {
    ventasPorLote[v.idLote] = (ventasPorLote[v.idLote] || 0) + v.cantidad;
  }

  const saldoPorProducto = {};
  for (const lote of productos) {
    const saldoLote = lote.stock - (ventasPorLote[lote.idLote] || 0);
    saldoPorProducto[lote.idProducto] = (saldoPorProducto[lote.idProducto] || 0) + saldoLote;
  }

  return maestro
    .filter(prod => (saldoPorProducto[prod.idProducto] || 0) < prod.stockminimo)
    .map(prod => ({
      idProducto: prod.idProducto,
      nombre: prod.nombre,
      saldoActual: saldoPorProducto[prod.idProducto] || 0,
      stockMinimo: prod.stockminimo,
      diferencia: prod.stockminimo - (saldoPorProducto[prod.idProducto] || 0),
    }));
}

export async function getValorInventario( idProducto ) {
  const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
  const productos = JSON.parse(productosData);
  const lotesDelProducto = productos.filter(p => p.idProducto === idProducto);

  let valorTotal = 0;
  for (const lote of lotesDelProducto) {
    const { saldo } = await getSaldoLote(lote.idLote);
    valorTotal += lote.precio * saldo;
  }
  return valorTotal;
}

export async function getListaLotesDisponibles( idProducto, fecha ) {
  fechaCorte = fecha ? new Date(fecha) : new Date();
  const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
  const productos = JSON.parse(productosData);
  const maestroData = await fs.readFile(path.join(DATA_PATH, "MaestroProductos.json"), "utf8");
  const maestro = JSON.parse(maestroData);
  const lotesDelProducto = productos.filter( p => p.idProducto === idProducto && p.stock > 0 && new Date( p.FechaVencimiento) > fechaCorte );

  // Ordenar por fecha de vencimiento (FEFO)
  lotesDelProducto.sort((a, b) => new Date(a.FechaVencimiento) - new Date(b.FechaVencimiento));
  lotesDelProducto= lotesDelProducto.map( lote => ({
    idLote: lote.idLote,
    idProducto: lote.idProducto,
    stock: lote.stock,
    FechaVencimiento: lote.FechaVencimiento,
    // saldo: getSaldoProducto(lote.idLote).then(s => s.Saldo),
    cargado : 0         // Campo para controlar cuánto se ha cargado de ese lote en la venta actual
  }));

  for ( let i = 0, len = lotesDelProducto.length; i < len; i++ ) {
    pos = maestro.findIndex( m => m.idProducto === lotesDelProducto[i].idProducto );
    lotesDelProducto[i].nombreProducto = maestro[pos].nombre;
    lotesDelProducto[i].precioVenta = maestro[pos].precioventa;
    lotesDelProducto[i].saldo = await getSaldoLote( lotesDelProducto[i].idLote );
  }
  return lotesDelProducto;
}

export async function grabarDescargaStock( lotesDescarga ) {
  if (!lotesDescarga || lotesDescarga.length === 0) {
    throw new Error("No se pudo descargar stocks.");
  }

  const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
  const productos = JSON.parse(productosData);

  for (const lote of lotesDescarga) {
    const { saldo } = await getSaldoLote(lote.idLote);
    // Supongo que 'cargado' es la cantidad a descontar; si es 'cantidad', cámbialo.
    const cantidadADescontar = lote.cargado || lote.cantidad; 

    if (saldo > 0 && saldo >= cantidadADescontar) {
      // Buscar el índice del producto que coincide con el idLote
      const index = productos.findIndex(p => p.idLote === lote.idLote);
      
      if (index !== -1) {
        // Actualizar el stock del producto (restar la cantidad descargada)
        productos[index].stock -= cantidadADescontar;
        // Si necesitas registrar otros campos, hazlo aquí.
      } else {
        // Opcional: manejar el caso de que no exista el lote en productos
        console.warn(`No se encontró producto con idLote ${lote.idLote}`);
      }
    }
  }

  // Guardar los cambios en el archivo
  await fs.writeFile( path.join(DATA_PATH, "Productos.json"), JSON.stringify(productos, null, 2) );
}

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;