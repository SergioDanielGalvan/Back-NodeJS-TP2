// models/FacturaVenta.js

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

const facturaVentaSchema = new mongoose.Schema({
  idFacturaVenta: { type: Number, unique: true },
  idCliente: Number,
  tipoComprobante: String,
  letraComprobante: String,
  nroFactura: String,
  fechaFactura: Date,
  fecha: Date,
  montoTotal: Number,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

export async function getNuevoNroFactura() {
  try {
    const facturasVentaData = await fs.readFile(path.join(DATA_PATH, "FacturasVenta.json"), "utf8");
    const facturasVenta = JSON.parse(facturasVentaData);
    if ( facturasVenta.length === 0 ) {
      return { "NroFactura": "00001-00000001" };
    }
    const ultimoNroFactura = facturasVenta.reduce( (ultimo, factura) => {
      const nroFactura = factura.nroFactura.replace("-", "");
      return nroFactura > ultimo ? nroFactura : ultimo;
    }, "0000100000001");
    ultimoNroFactura = ultimoNroFactura.substr(0, 5) + "-" + ultimoNroFactura.substr(5, 8);
    return { "NroFactura": ultimoNroFactura };
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw error;
  }
};

export default mongoose.model("FacturaVenta", facturaVentaSchema);