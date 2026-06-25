// models/DetalleVenta.js

import mongoose from "mongoose";

// Esto es para poder usar la lectura de JSON, con Mongoose se saca.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la carpeta data (ajústala si es necesario)
const DATA_PATH = path.join(__dirname, "../data");

const detalleVentaSchema = new mongoose.Schema({
  idDetalleVenta: { type: Number, unique: true },
  idFacturaVenta: Number,
  idProducto: Number,
  idLote: Number,
  cantidad: Number,
  precioUnitario: Number,
  montoTotal: Number,
  unidadmedida: String,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });



export default mongoose.model("DetalleVenta", detalleVentaSchema);