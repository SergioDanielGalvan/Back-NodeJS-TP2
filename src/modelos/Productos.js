// modelos/Productos.js
import mongoose from "mongoose";
import DetalleVenta from "./DetalleVenta.js";
import MaestroProducto from "./MaestroProductos.js";

const productoSchema = new mongoose.Schema(
  {
    idLote: { type: Number, unique: true },
    idProducto: { type: Number, required: true },
    idFacturaCompra: { type: Number },
    idDetalleCompra: { type: Number },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    fechaIngresoStock: { type: Date },
    FechaVencimiento: { type: Date, default: "2027-01-01" },
  },
  { timestamps: true, versionKey: false },
);

// Auto-incremento de idLote para altas nuevas
productoSchema.pre("save", async function () {
  if (this.isNew && !this.idLote) {
    const ultimo = await mongoose
      .model("Producto")
      .findOne()
      .sort({ idLote: -1 });

    this.idLote = ultimo ? ultimo.idLote + 1 : 1;
  }
});

// ----- Statics CRUD -----
productoSchema.statics.obtenerTodos = function () {
  return this.find().lean();
};

productoSchema.statics.obtenerPorIdLote = function (idLote) {
  return this.findOne({ idLote }).lean();
};

productoSchema.statics.obtenerPorIdProducto = function (idProducto) {
  return this.find({ idProducto }).lean();
};

productoSchema.statics.crearProducto = function (dataProducto) {
  return this.create(dataProducto);
};

productoSchema.statics.actualizarStock = function (idLote, nuevoStock) {
  return this.findOneAndUpdate(
    { idLote },
    { stock: nuevoStock },
    { new: true },
  ).lean();
};

productoSchema.statics.actualizarPrecio = function (idLote, nuevoPrecio) {
  return this.findOneAndUpdate(
    { idLote },
    { precio: nuevoPrecio },
    { new: true },
  ).lean();
};

productoSchema.statics.eliminarPorIdLote = function (idLote) {
  return this.findOneAndDelete({ idLote });
};

const Producto = mongoose.model("Producto", productoSchema);

// ---------------------------------------------------------------------------
// Funciones de saldo / stock (contra MongoDB)
// Saldo de un lote = stock cargado - cantidades vendidas de ese lote (DetalleVenta)
// ---------------------------------------------------------------------------

// Total vendido por lote. Si se pasan idLotes, filtra; si no, suma todos.
async function ventasPorLote(idLotes = null) {
  const pipeline = [];
  if (Array.isArray(idLotes)) {
    pipeline.push({ $match: { idLote: { $in: idLotes } } });
  }
  pipeline.push({ $group: { _id: "$idLote", vendido: { $sum: "$cantidad" } } });
  const filas = await DetalleVenta.aggregate(pipeline);
  return new Map(filas.map((f) => [f._id, f.vendido]));
}

export async function getSaldoLote(idLote) {
  const lote = await Producto.findOne({ idLote }).lean();
  if (!lote) throw new Error(`Producto con idLote ${idLote} no encontrado`);
  const mapa = await ventasPorLote([idLote]);
  const totalVendidos = mapa.get(idLote) || 0;
  return { idLote, Saldo: lote.stock - totalVendidos };
}

export async function getSaldoProducto(idProducto) {
  const lotes = await Producto.find({ idProducto })
    .select("idLote stock")
    .lean();
  if (lotes.length === 0) return { idProducto, Saldo: 0 };
  const mapa = await ventasPorLote(lotes.map((l) => l.idLote));
  const saldoTotal = lotes.reduce(
    (acc, l) => acc + (l.stock - (mapa.get(l.idLote) || 0)),
    0,
  );
  return { idProducto, Saldo: saldoTotal };
}

export async function getProductosConBajoStockOptimizado() {
  const [maestro, productos, mapa] = await Promise.all([
    MaestroProducto.find().lean(),
    Producto.find().select("idLote idProducto stock").lean(),
    ventasPorLote(),
  ]);

  const saldoPorProducto = {};
  for (const lote of productos) {
    const saldoLote = lote.stock - (mapa.get(lote.idLote) || 0);
    saldoPorProducto[lote.idProducto] =
      (saldoPorProducto[lote.idProducto] || 0) + saldoLote;
  }

  return maestro
    .filter(
      (prod) =>
        (saldoPorProducto[prod.idProducto] || 0) < (prod.stockMinimo || 0),
    )
    .map((prod) => ({
      idProducto: prod.idProducto,
      nombre: prod.nombre,
      saldoActual: saldoPorProducto[prod.idProducto] || 0,
      stockMinimo: prod.stockMinimo || 0,
      diferencia:
        (prod.stockMinimo || 0) - (saldoPorProducto[prod.idProducto] || 0),
    }));
}

export async function getValorInventario(idProducto) {
  const lotes = await Producto.find({ idProducto })
    .select("idLote precio stock")
    .lean();
  if (lotes.length === 0) return 0;
  const mapa = await ventasPorLote(lotes.map((l) => l.idLote));
  return lotes.reduce(
    (acc, l) => acc + l.precio * (l.stock - (mapa.get(l.idLote) || 0)),
    0,
  );
}

// Lotes disponibles de un producto (no vencidos, con stock), ordenados FEFO.
export async function getListaLotesDisponibles(idProducto, fecha) {
  const fechaCorte = fecha ? new Date(fecha) : new Date();

  const lotes = await Producto.find({
    idProducto,
    stock: { $gt: 0 },
    FechaVencimiento: { $gt: fechaCorte },
  })
    .sort({ FechaVencimiento: 1 }) // FEFO: primero el que vence antes
    .lean();

  if (lotes.length === 0) return [];

  const maestro = await MaestroProducto.findOne({ idProducto }).lean();
  const mapa = await ventasPorLote(lotes.map((l) => l.idLote));

  return lotes.map((lote) => ({
    idLote: lote.idLote,
    idProducto: lote.idProducto,
    stock: lote.stock,
    FechaVencimiento: lote.FechaVencimiento,
    nombreProducto: maestro?.nombre || "",
    precioVenta: maestro?.precioventa || 0,
    saldo: lote.stock - (mapa.get(lote.idLote) || 0),
    cargado: 0, // cuánto se cargó de este lote en la venta actual
  }));
}

// Lotes que vencen dentro de los próximos `dias` días, con saldo disponible (FEFO).
export async function getProductosPorVencer(dias) {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + Number(dias));

  const lotes = await Producto.find({
    FechaVencimiento: { $gte: hoy, $lte: limite },
  })
    .sort({ FechaVencimiento: 1 })
    .lean();

  if (lotes.length === 0) return [];

  // Saldo por lote (stock - vendido) y nombre del producto
  const mapaVentas = await ventasPorLote(lotes.map((l) => l.idLote));
  const maestros = await MaestroProducto.find({
    idProducto: { $in: [...new Set(lotes.map((l) => l.idProducto))] },
  })
    .select("idProducto nombre")
    .lean();
  const nombre = {};
  for (const m of maestros) nombre[m.idProducto] = m.nombre;

  return lotes
    .map((l) => ({
      idLote: l.idLote,
      idProducto: l.idProducto,
      nombreProducto: nombre[l.idProducto] ?? null,
      saldo: l.stock - (mapaVentas.get(l.idLote) || 0),
      fechaVencimiento: l.FechaVencimiento,
      diasParaVencer: Math.ceil((new Date(l.FechaVencimiento) - hoy) / 86400000),
    }))
    .filter((l) => l.saldo > 0); // solo lotes con stock real
}

// Reporte de reposición: clasifica cada producto por su saldo total vs stockMinimo y puntoPedido.
export async function getReporteReposicion() {
  const [maestro, productos, mapaVentas] = await Promise.all([
    MaestroProducto.find().lean(),
    Producto.find().select("idLote idProducto stock").lean(),
    ventasPorLote(),
  ]);

  // Saldo total por producto (suma de saldos de sus lotes)
  const saldoPorProducto = {};
  for (const lote of productos) {
    const saldo = lote.stock - (mapaVentas.get(lote.idLote) || 0);
    saldoPorProducto[lote.idProducto] = (saldoPorProducto[lote.idProducto] || 0) + saldo;
  }

  const bajoStock = [];
  const reposicion = [];

  for (const p of maestro) {
    const saldo = saldoPorProducto[p.idProducto] || 0;
    const stockMinimo = p.stockMinimo || 0;
    const puntoPedido = p.puntoPedido || 0;

    const item = {
      idProducto: p.idProducto,
      nombre: p.nombre,
      saldo,
      stockMinimo,
      puntoPedido,
    };

    if (saldo < stockMinimo) {
      bajoStock.push({ ...item, faltante: stockMinimo - saldo });
    } else if (saldo <= puntoPedido) {
      reposicion.push({ ...item, sugeridoReponer: puntoPedido - saldo });
    }
  }

  return {
    bajoStock: { cantidad: bajoStock.length, items: bajoStock },
    reposicion: { cantidad: reposicion.length, items: reposicion },
  };
}

// Valor total del inventario: suma (saldo × precioventa) de todos los productos.
export async function getValorInventarioTotal() {
  const [maestro, productos, mapaVentas] = await Promise.all([
    MaestroProducto.find().lean(),
    Producto.find().select("idLote idProducto stock").lean(),
    ventasPorLote(),
  ]);

  const saldoPorProducto = {};
  for (const lote of productos) {
    const saldo = lote.stock - (mapaVentas.get(lote.idLote) || 0);
    saldoPorProducto[lote.idProducto] = (saldoPorProducto[lote.idProducto] || 0) + saldo;
  }

  let valorTotal = 0;
  const items = maestro.map((p) => {
    const saldo = saldoPorProducto[p.idProducto] || 0;
    const precio = p.precioventa || 0;
    const valor = saldo * precio;
    valorTotal += valor;
    return { idProducto: p.idProducto, nombre: p.nombre, saldo, precioVenta: precio, valor };
  });

  items.sort((a, b) => b.valor - a.valor); // los de mayor valor primero
  return { valorTotal, items };
}

export default Producto;
