// models/DetalleCompra.js

import mongoose from "mongoose";

const detalleCompraSchema = new mongoose.Schema({
  idDetalleCompra: { type: Number, unique: true },
  idFacturaCompra: Number,
  idProducto: Number,
  cantidad: Number,
  unidadmedida: String,
  fechaIngresoStock: Date,
  total: Number
}, { versionKey: false });

export default mongoose.model("DetalleCompra", detalleCompraSchema);