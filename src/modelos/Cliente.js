// modelos/Cliente.js
import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    idCliente: { type: Number, unique: true, required: true },
    nombre: { type: String, required: true, trim: true },
    nroCUIT: { type: String, trim: true },
    situacionIVA: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    fechaAlta: { type: Date },
    fechaUltimoMovimiento: { type: Date },
    operador: { type: String, default: "sistema" },
  },
  { versionKey: false }
);

clienteSchema.statics.obtenerTodos = function () {
  return this.find().lean();
};

clienteSchema.statics.obtenerPorId = function (idCliente) {
  return this.findOne({ idCliente: Number(idCliente) }).lean();
};

export default mongoose.model("Cliente", clienteSchema);
