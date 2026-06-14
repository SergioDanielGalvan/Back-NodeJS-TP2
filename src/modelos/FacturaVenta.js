// models/FacturaVenta.js

import mongoose from "mongoose";

const facturaVentaSchema = new mongoose.Schema({
  idFacturaVenta: { type: Number, unique: true },
  idCliente: Number,
  nroFactura: String,
  fechaFactura: Date,
  montoTotal: Number,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

export default mongoose.model("FacturaVenta", facturaVentaSchema);