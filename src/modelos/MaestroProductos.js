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

    descripcion: {
      type: String,
      default: "",
    },

    unidadMedida: {
      type: String,
      required: true,
    },

    envase: {
      type: String,
      required: true,
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

const MaestroProducto = mongoose.model(
  "MaestroProducto",
  maestroProductoSchema,
);

export default MaestroProducto;
