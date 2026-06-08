import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import MaestroProducto from "../models/MaestroProducto.js";
import Lote from "../models/Lote.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const migrar = async () => {
  await mongoose.connect("mongodb://localhost:27017/tuDB");

  // Migrar MaestroProductos
  const maestroData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/MaestroProductos.json"), "utf-8")
  );
  await MaestroProducto.insertMany(maestroData);
  console.log("MaestroProductos migrados");

  // Migrar Lotes (Productos.json)
  const lotesData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/Productos.json"), "utf-8")
  );
  await Lote.insertMany(lotesData);
  console.log("Lotes migrados");

  // Migrar Usuarios (Usuarios.json)
  const usuariosData = JSON.parse(
    await fs.readFile(path.join(__dirname, "../data/Usuarios.json"), "utf-8")
  );
  await Usuario.insertMany(usuariosData);
  console.log("Usuarios migrados");

  process.exit();
};

migrar();