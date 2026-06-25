// modelos/Operador.js
// Entidad de autenticación alineada al diseño relacional (reemplaza a "Usuario").
// Los nombres de campo siguen el diseño pero en camelCase (convención JS/Mongo).
import mongoose from "mongoose";

const operadorSchema = new mongoose.Schema(
  {
    idOperador: { type: Number, unique: true, required: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    alias: { type: String, trim: true, default: "" },
    claveHash: { type: String, required: true },
    estadoCuenta: {
      type: String,
      enum: ["activo", "bloqueado"],
      default: "activo",
    },
    // rol es una extensión por fuera del diseño, necesaria para las rutas privadas/admin.
    rol: { type: String, enum: ["admin", "operador"], default: "operador" },
    intentosErroneos: { type: Number, default: 0 },
    fechaBloqueo: { type: Date, default: null },
    fechaVto: { type: Date, default: null },
    fechaLogin: { type: Date, default: null },
    fechaLogout: { type: Date, default: null },
    operadorAlta: { type: String, default: "sistema" },
    fechaAlta: { type: Date, default: Date.now },
    operadorModificacion: { type: String, default: "" },
    fechaModificacion: { type: Date, default: null },
  },
  { versionKey: false }
);

operadorSchema.statics.buscarPorEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

operadorSchema.statics.obtenerTodos = function () {
  return this.find().select("-claveHash").lean();
};

operadorSchema.statics.obtenerPorId = function (id) {
  return this.findById(id).select("-claveHash").lean();
};

export default mongoose.model("Operador", operadorSchema);
