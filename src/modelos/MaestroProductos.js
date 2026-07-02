// modelos/MaestroProductos.js
import mongoose from "mongoose";

const maestroProductoSchema = new mongoose.Schema(
  {
    idProducto: {
      type: Number,
      unique: true,
      required: true,
    },

    EAN: {
      type: String,
      unique: true,
      required: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    categorias: {
      type: [String],
      default: [],
    },

    // Precio de venta del catálogo (presente en los datos y en el diseño).
    precioventa: {
      type: Number,
      default: 0,
      min: 0,
    },

    descripcion: {
      type: String,
      default: "",
    },

    // Opcionales: los datos migrados no traen unidadMedida/envase.
    unidadMedida: {
      type: String,
      default: "",
    },

    envase: {
      type: String,
      default: "",
    },

    stockMinimo: {
      type: Number,
      default: 0,
    },

    puntoPedido: {
      type: Number,
      default: 0,
    },

    fechaAlta: {
      type: Date,
      default: Date.now,
    },

    operador: {
      type: String,
      default: "sistema",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

maestroProductoSchema.statics.obtenerTodos = async function () {
  return await this.find().lean();
};

maestroProductoSchema.statics.obtenerPorId = async function (id) {
  return await this.findOne({
    idProducto: Number(id),
  }).lean();
};

maestroProductoSchema.statics.guardar = async function (producto) {
  return await this.create(producto);
};

maestroProductoSchema.statics.actualizar = async function (
  id,
  productoActualizado,
) {
  return await this.findOneAndUpdate(
    {
      idProducto: Number(id),
    },
    productoActualizado,
    {
      new: true,
    },
  ).lean();
};

maestroProductoSchema.statics.eliminar = async function (id) {
  return await this.findOneAndDelete({
    idProducto: Number(id),
  });
};

maestroProductoSchema.statics.getProductoByNombre = async function (nombre) {
  return await this.find({
    nombre: {
      $regex: nombre,
      $options: "i",
    },
  }).lean();
};

maestroProductoSchema.statics.getProductosByCategoria = async function (
  categoria,
) {
  return await this.find({
    categorias: {
      $regex: categoria,
      $options: "i",
    },
  }).lean();
};

maestroProductoSchema.statics.getProductoByEAN = async function (ean) {
  return await this.findOne({
    EAN: ean,
  }).lean();
};

maestroProductoSchema.statics.obtenerPorIdProducto = async function (idProducto) {
  return await this.findOne({ idProducto }).lean();
};

const MaestroProducto = mongoose.model(
  "MaestroProducto",
  maestroProductoSchema,
);

// Próximo idProducto = máximo actual + 1 (el maestro no tiene auto-incremento).
maestroProductoSchema.statics.siguienteId = async function () {
  const ultimo = await this.findOne().sort({ idProducto: -1 }).lean();
  return ultimo ? ultimo.idProducto + 1 : 1;
};

export default MaestroProducto;