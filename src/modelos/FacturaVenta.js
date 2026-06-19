// models/FacturaVenta.js

import mongoose from "mongoose";

// Esto es para poder usar la lectura de JSON, con Moongose se saca.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la carpeta data (ajústala si es necesario)
const DATA_PATH = path.join(__dirname, "../data");

const facturaVentaSchema = new mongoose.Schema({
  idFacturaVenta: { type: Number, unique: true },
  idCliente: Number,
  nroFactura: String,
  fechaFactura: Date,
  montoTotal: Number,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

export default mongoose.model("FacturaVenta", facturaVentaSchema);