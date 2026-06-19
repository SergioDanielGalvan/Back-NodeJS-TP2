// models/FacturaCompra.js

import mongoose from "mongoose";

const facturaCompraSchema = new mongoose.Schema({
  idFacturaCompra: { type: Number, unique: true },
  idProveedor: Number,
  nroFactura: String,
  fechaFactura: Date,
  montoTotal: Number,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

// ----- Funciones de saldo -----


export default mongoose.model("FacturaCompra", facturaCompraSchema);