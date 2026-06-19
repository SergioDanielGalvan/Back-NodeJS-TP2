// models/FacturaCompra.js

import mongoose from "mongoose";

const facturaCompraSchema = new mongoose.Schema({
  idFacturaCompra: { type: Number, unique: true },
  idProveedor: Number,
  nroFactura: String,
  fechaFactura: Date,
  montoTotal: Number,
  fechaAlta: Date,
  fechaUltimoMovimiento: Date,
  operador: String
}, { versionKey: false });

// ----- Funciones de saldo -----
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

export default mongoose.model("FacturaCompra", facturaCompraSchema);