import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import MaestroProductos from "../modelos/MaestroProducto.js";
import Productos from "../modelos/Productos.js";
import Rutinas from "../controladores/funcionesMongoose.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const migrar = async () => {
  await mongoose.connect("mongodb://localhost:27017/TP2-IFTS29");

  // Migrar MaestroProductos
  const maestroData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/MaestroProductos.json"), "utf-8")
  );
  await MaestroProductos.insertMany(maestroData);
  console.log("MaestroProductos migrados");

  // Migrar Lotes (Productos.json)
  const lotesData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/Productos.json"), "utf-8")
  );
  await Productos.insertMany(lotesData);
  console.log("Lotes migrados");

  // Migrar Ventas (Ventas)
  const ventasData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/FacturaVentas.json"), "utf-8")
  );
  await Venta.insertMany(ventasData);
  console.log("Ventas migradas");

  // Migrar Usuarios (Usuarios.json)
  const usuariosData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/Usuarios.json"), "utf-8")
  );
  await Usuario.insertMany(usuariosData);
  console.log("Usuarios migrados");

  process.exit();
};

migrar();