// modelos/Proveedor.js
import mongoose from "mongoose";

const proveedorSchema = new mongoose.Schema(
  {
    idProveedor: { type: Number, unique: true, required: true },
    nombre: { type: String, required: true, trim: true },
    nroCUIT: { type: String, trim: true },
    situacionIVA: { type: String, trim: true },
    contacto: { type: String, trim: true, default: "" },
    fechaAlta: { type: Date },
    fechaUltimoMovimiento: { type: Date },
    operador: { type: String, default: "sistema" },
  },
  { versionKey: false }
);

proveedorSchema.statics.obtenerTodos = function () {
  return this.find().lean();
};

proveedorSchema.statics.obtenerPorId = function (idProveedor) {
  return this.findOne({ idProveedor: Number(idProveedor) }).lean();
};

export default mongoose.model("Proveedor", proveedorSchema);
