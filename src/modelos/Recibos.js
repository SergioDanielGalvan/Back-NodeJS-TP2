// models/Recibos.js

import mongoose from "mongoose";

const reciboSchema = new mongoose.Schema({
  idRecibo: { type: Number, unique: true },
  idCliente: Number,
  nroRecibo: String,
  monto: Number,
  medioDePago: String,
  fechaRecibo: Date,
  fechaAcreditacion: Date
}, { versionKey: false });

export default mongoose.model("Recibo", reciboSchema);