// models/Recibos.js
import mongoose from "mongoose";

const reciboSchema = new mongoose.Schema(
  {
    idRecibo: { type: Number, unique: true },
    idFacturaVenta: { type: Number }, // FK a FacturaVenta: N recibos por factura
    idCliente: Number,
    nroRecibo: String,
    monto: { type: Number, min: 0 },
    medioDePago: String,
    fechaRecibo: Date,
    fechaAcreditacion: Date,
    fechaAlta: Date,
    operador: String,
  },
  { versionKey: false }
);

reciboSchema.statics.obtenerTodos = function () {
  return this.find().sort({ idRecibo: 1 }).lean();
};

reciboSchema.statics.obtenerPorId = function (idRecibo) {
  return this.findOne({ idRecibo: Number(idRecibo) }).lean();
};

reciboSchema.statics.obtenerPorFactura = function (idFacturaVenta) {
  return this.find({ idFacturaVenta: Number(idFacturaVenta) })
    .sort({ idRecibo: 1 })
    .lean();
};

// Total ya pagado (suma de recibos) de una factura de venta.
reciboSchema.statics.totalPagadoFactura = async function (idFacturaVenta) {
  const r = await this.aggregate([
    { $match: { idFacturaVenta: Number(idFacturaVenta) } },
    { $group: { _id: null, total: { $sum: "$monto" } } },
  ]);
  return r[0]?.total || 0;
};

export default mongoose.model("Recibo", reciboSchema);
