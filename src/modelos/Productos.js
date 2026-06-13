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
    console.log("Obteniendo saldo para idLote:", idLote);
    const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
    const productos = JSON.parse(productosData);
    console.log("Productos cargados:", productos.length );
    const producto = productos.find( p => p.idLote === Number(idLote) );
    if (!producto) throw new Error(`Producto con idLote ${idLote} no encontrado`);

    const ventasData = await fs.readFile(path.join(DATA_PATH, "DetalleVentas.json"), "utf8");
    const detalleVentas = JSON.parse(ventasData);
    const ventasProducto = detalleVentas.filter(dv => dv.idLote === Number(idLote));
    const totalVendidos = ventasProducto.reduce((total, venta) => total + venta.cantidad, 0);

    const saldo = producto.stock - totalVendidos;
    return saldo;
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
};

export async function getSaldoProducto( idProducto ) {
  const productosData = await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf8");
  const productos = JSON.parse(productosData);
  const lotesDelProducto = productos.filter(p => p.idProducto === Number(idProducto));
  if (lotesDelProducto.length === 0) return 0;

  let saldoTotal = 0;
  for (const lote of lotesDelProducto) {
    const saldo = await getSaldoLote(lote.idLote);
    saldoTotal += saldo;
  }
  return saldoTotal;
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

export async function getValorInventario(idProducto) {
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

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;