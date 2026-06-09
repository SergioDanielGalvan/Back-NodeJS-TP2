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

export const obtenerSaldoLote = async function ( idLote ) {
  try {
    // Primero ubico el producto por su idLote
    //const producto = await mongoose.model("Producto").findOne({ idLote }).lean();
    let saldo = 0;
    let data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const producto = productos.find(p => p.idLote === idLote);
    if (!producto) {
      throw new Error(`Producto con idLote ${idLote} no encontrado`);
    }
    saldo = producto.stock;
    let data = await fs.readFile(
      path.join(__dirname, "../data/DetalleVentas.json"),
      "utf-8",  
    );


  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
  finally {
  }
  return { idLote, saldo };
};

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;
