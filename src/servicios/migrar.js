// serviciosigrar.js
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Modelos en orden de dependencia (primero los maestros)
import Cliente from "../modelos/Cliente.js";
import Proveedor from "../modelos/Proveedor.js";
import MaestroProducto from "../modelos/MaestroProductos.js";
import FacturaCompra from "../modelos/FacturaCompra.js";
import DetalleCompra from "../modelos/DetalleCompra.js";
import Producto from "../modelos/Productos.js";
import FacturaVenta from "../modelos/FacturaVenta.js";
import DetalleVenta from "../modelos/DetalleVenta.js";
import Usuario from "../modelos/Usuario.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data");

async function migrar() {
  try {
    await mongoose.connect("mongodb://localhost:27017/TP2-IFTS29");
    console.log("🟢 Conectado a MongoDB");

    // Verificar si ya hay datos (opcional)
    const count = await Cliente.countDocuments();
    if (count > 0) {
      console.log("⚠️ La base ya contiene datos. Usá --force para reiniciar.");
      process.exit(0);
    }

    // 1. Clientes
    const clientes = JSON.parse(await fs.readFile(path.join(DATA_PATH, "Clientes.json"), "utf-8"));
    await Cliente.insertMany(clientes);
    console.log("✅ Clientes");

    // 2. Proveedores
    const proveedores = JSON.parse(await fs.readFile(path.join(DATA_PATH, "Proveedores.json"), "utf-8"));
    await Proveedor.insertMany(proveedores);
    console.log("✅ Proveedores");

    // 3. MaestroProductos
    const maestro = JSON.parse(await fs.readFile(path.join(DATA_PATH, "MaestroProductos.json"), "utf-8"));
    await MaestroProducto.insertMany(maestro);
    console.log("✅ MaestroProductos");

    // 4. FacturasCompra
    const facturasCompra = JSON.parse(await fs.readFile(path.join(DATA_PATH, "FacturasCompra.json"), "utf-8"));
    await FacturaCompra.insertMany(facturasCompra);
    console.log("✅ FacturasCompra");

    // 5. DetalleCompras
    const detalleCompra = JSON.parse(await fs.readFile(path.join(DATA_PATH, "DetalleCompras.json"), "utf-8"));
    await DetalleCompra.insertMany(detalleCompra);
    console.log("✅ DetalleCompras");

    // 6. Productos (lotes)
    const lotes = JSON.parse(await fs.readFile(path.join(DATA_PATH, "Productos.json"), "utf-8"));
    await Producto.insertMany(lotes);
    console.log("✅ Productos (lotes)");

    // 7. FacturasVenta
    const facturasVenta = JSON.parse(await fs.readFile(path.join(DATA_PATH, "FacturaVentas.json"), "utf-8"));
    await FacturaVenta.insertMany(facturasVenta);
    console.log("✅ FacturasVenta");

    // 8. DetalleVentas
    const detalleVenta = JSON.parse(await fs.readFile(path.join(DATA_PATH, "DetalleVentas.json"), "utf-8"));
    await DetalleVenta.insertMany(detalleVenta);
    console.log("✅ DetalleVentas");

    // 9. Usuarios
    const usuarios = JSON.parse(await fs.readFile(path.join(DATA_PATH, "Usuarios.json"), "utf-8"));
    await Usuario.insertMany(usuarios);
    console.log("✅ Usuarios");

    console.log("🎉 Migración completada con éxito");
  } catch (error) {
    console.error("❌ Error en migración:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrar();