import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    rol: {
      type: String,
      enum: ["admin", "operador"],
      default: "operador",
    },

    intentos: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usuarioSchema.statics.obtenerTodos = async function () {
  return await this.find().select("-password").lean();
};

usuarioSchema.statics.obtenerPorId = async function (id) {
  return await this.findById(id).select("-password").lean();
};

usuarioSchema.statics.buscarPorEmail = async function (email) {
  return await this.findOne({
    email: email.toLowerCase(),
  });
};

usuarioSchema.statics.crearUsuario = async function (usuario) {
  return await this.create(usuario);
};

usuarioSchema.statics.eliminarUsuario = async function (id) {
  return await this.findByIdAndDelete(id);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
