// models/DetalleVenta.js

import mongoose from "mongoose";

const detalleVentaSchema = new mongoose.Schema({
  idDetalleVenta: { type: Number, unique: true },
  idFacturaVenta: Number,
  idProducto: Number,
  idLote: Number,
  cantidad: Number,
  precioUnitario: Number,
  montototal: Number,
  unidadmedida: String,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

export default mongoose.model("DetalleVenta", detalleVentaSchema);