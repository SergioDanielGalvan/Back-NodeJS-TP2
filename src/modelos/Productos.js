// models/Productos.js
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    idLote: {
      type: Number,
      unique: true,
    },
    idProducto: {
      type: Number,
      required: true,
      // Referencia lógica al campo idProducto de MaestroProducto
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    FechaVencimiento: {
      type: Date,
      default: "2027-01-01",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-increment para idLote (opcional, ver explicación)
productoSchema.pre("save", async function (next) {
  if (this.isNew && !this.idLote) {
    const lastLote = await mongoose.model("Producto").findOne().sort({ idLote: -1 });
    this.idLote = lastLote ? lastLote.idLote + 1 : 1;
  }
  next();
});

// Métodos estáticos (similares a los que tenía con JSON)
productoSchema.statics.obtenerTodos = async function () {
  return await this.find().lean();
};

productoSchema.statics.obtenerPorId = async function (id) {
  return await this.findOne({ id }).lean();
};

productoSchema.statics.obtenerPorIdProducto = async function (idProducto) {
  return await this.find({ idProducto }).lean();
};

productoSchema.statics.crearProducto = async function (dataProducto) {
  return await this.create(dataProducto);
};

productoSchema.statics.actualizarStock = async function (id, nuevoStock) {
  return await this.findOneAndUpdate(
    { idLote: id },
    { stock: nuevoStock },
    { new: true }
  ).lean();
};

productoSchema.statics.actualizarPrecio = async function (idLote, nuevoPrecio) {
  return await this.findOneAndUpdate(
    { idLote },
    { precio: nuevoPrecio },
    { new: true }
  ).lean();
};

productoSchema.statics.eliminarPorIdLote = async function (idLote) {
  return await this.findOneAndDelete({ idLote });
};

<<<<<<< HEAD
export const obtenerSaldoLote = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
  finally {  }
};
=======
const Producto = mongoose.model("Producto", productoSchema);
export default Producto;
>>>>>>> 960508aa0a9269aa6c15050f78b59a9917cc32fb
