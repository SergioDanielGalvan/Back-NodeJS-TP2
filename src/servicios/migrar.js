// servicios/migrar.js
// ---------------------------------------------------------------------------
// Seeder / migración de datos JSON -> MongoDB (Mongoose).
//
// Uso:
//   npm run seed          -> migra SOLO si la base está vacía (no pisa datos)
//   npm run seed:force    -> borra las colecciones y vuelve a migrar
//
// Cada colección tiene una función de transformación que reconcilia los
// nombres de campo del JSON con los del schema (ej: stockminimo -> stockMinimo).
// ---------------------------------------------------------------------------
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Modelos en orden de dependencia lógica (primero los maestros)
import Cliente from "../modelos/Cliente.js";
import Proveedor from "../modelos/Proveedor.js";
import MaestroProducto from "../modelos/MaestroProductos.js";
import FacturaCompra from "../modelos/FacturaCompra.js";
import DetalleCompra from "../modelos/DetalleCompra.js";
import Producto from "../modelos/Productos.js";
import FacturaVenta from "../modelos/FacturaVenta.js";
import DetalleVenta from "../modelos/DetalleVenta.js";
import Recibo from "../modelos/Recibos.js";
import Operador from "../modelos/Operador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TP2-IFTS29";
const FORCE = process.argv.includes("--force");
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function leerJSON(nombre) {
  return JSON.parse(await fs.readFile(path.join(DATA_PATH, nombre), "utf-8"));
}

const sinCambios = (x) => x;

// ---------------------------------------------------------------------------
// Transformaciones JSON -> schema (solo donde difieren los nombres)
// ---------------------------------------------------------------------------
const tMaestro = (p) => ({
  idProducto: p.idProducto,
  nombre: p.nombre,
  categorias: p.categorias || [],
  EAN: p.EAN,
  precioventa: p.precioventa ?? 0,
  stockMinimo: p.stockminimo ?? 0, // JSON: stockminimo -> schema: stockMinimo
  puntoPedido: p.puntoPedido ?? 0,
});

const tProducto = (l) => ({
  idLote: l.idLote,
  idProducto: l.idProducto,
  idFacturaCompra: l.idFacturaCompra,
  idDetalleCompra: l.idDetalleCompra,
  precio: l.precio,
  stock: l.stock,
  fechaIngresoStock: l.fechaIngresoStock,
  FechaVencimiento: l.FechaVencimiento,
});

const tCliente = (c) => ({
  idCliente: c.idCliente,
  nombre: c.nombre,
  nroCUIT: c.nroCUIT,
  situacionIVA: c.situacionIVA,
  email: c.email || "",
  fechaAlta: c.fecha, // JSON: fecha -> fechaAlta
});

const tProveedor = (p) => ({
  idProveedor: p.idProveedor,
  nombre: p.nombre,
  nroCUIT: p.nroCUIT,
  situacionIVA: p.situacionIVA,
  contacto: p.contacto || "",
});

const tFacturaVenta = (f) => ({
  idFacturaVenta: f.idFacturaVenta,
  idCliente: f.idCliente,
  tipoComprobante: f.tipoComprobante,
  letraComprobante: f.letraComprobante,
  nroFactura: f.nroFactura,
  fechaFactura: f.fechaFactura,
  fecha: f.fecha,
  montoTotal: f.total, // JSON: total -> montoTotal
});

const tDetalleVenta = (d) => ({
  idDetalleVenta: d.idDetalleVenta,
  idFacturaVenta: d.idFacturaVenta,
  idProducto: d.idProducto,
  idLote: d.idLote,
  cantidad: d.cantidad,
  precioUnitario: d.precioUnitario,
  montoTotal: d.montoTotal,
});

// Operador necesita hashear la clave (async): password plano -> claveHash
async function tOperador(u) {
  return {
    idOperador: u.idUsuario,
    nombres: u.nombre,
    email: u.email,
    claveHash: await bcrypt.hash(u.password, SALT_ROUNDS),
    rol: (u.rol || "operador").toLowerCase(), // "Operador" -> "operador"
    intentosErroneos: u.NroIntentos ?? 0, // NroIntentos -> intentosErroneos
    fechaAlta: u.fechaAlta,
  };
}

// ---------------------------------------------------------------------------
// Plan de migración (orden importa por dependencias lógicas)
// ---------------------------------------------------------------------------
const PASOS = [
  { modelo: Cliente, archivo: "Clientes.json", map: tCliente },
  { modelo: Proveedor, archivo: "Proveedores.json", map: tProveedor },
  { modelo: MaestroProducto, archivo: "MaestroProductos.json", map: tMaestro },
  { modelo: FacturaCompra, archivo: "FacturasCompra.json", map: sinCambios },
  { modelo: DetalleCompra, archivo: "DetalleCompras.json", map: sinCambios },
  { modelo: Producto, archivo: "Productos.json", map: tProducto },
  { modelo: FacturaVenta, archivo: "FacturaVentas.json", map: tFacturaVenta },
  { modelo: DetalleVenta, archivo: "DetalleVentas.json", map: tDetalleVenta },
  { modelo: Recibo, archivo: "Recibos.json", map: sinCambios },
];

const TODOS_LOS_MODELOS = [...PASOS.map((p) => p.modelo), Operador];

// ---------------------------------------------------------------------------
// Chequeo de integridad / contable (informativo, no aborta la migración)
// ---------------------------------------------------------------------------
async function verificarIntegridad() {
  console.log("\n— Verificación —");

  // 1. Cada FacturaVenta: ¿la suma de su detalle cierra contra el total?
  const facturas = await FacturaVenta.find().lean();
  const detalles = await DetalleVenta.find().lean();
  const sumaPorFactura = {};
  for (const d of detalles) {
    sumaPorFactura[d.idFacturaVenta] =
      (sumaPorFactura[d.idFacturaVenta] || 0) + (d.montoTotal || 0);
  }
  for (const f of facturas) {
    const suma = sumaPorFactura[f.idFacturaVenta] || 0;
    const ok = suma === f.montoTotal;
    console.log(
      `  Factura ${f.idFacturaVenta}: total=${f.montoTotal} sumaDetalle=${suma} -> ${ok ? "OK" : "NO CIERRA ⚠️"}`
    );
  }

  // 2. Lotes huérfanos (idProducto sin Maestro)
  const idsMaestro = new Set(
    (await MaestroProducto.find().select("idProducto").lean()).map((m) => m.idProducto)
  );
  const lotes = await Producto.find().select("idLote idProducto").lean();
  const huerfanos = lotes.filter((l) => !idsMaestro.has(l.idProducto));
  console.log(
    huerfanos.length === 0
      ? "  Lotes con Maestro: OK"
      : `  Lotes huérfanos (sin Maestro): ${huerfanos.map((l) => l.idLote).join(", ")} ⚠️`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function migrar() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`🟢 Conectado a ${MONGO_URI}`);

    if (FORCE) {
      console.log("⚠️  --force: borrando colecciones existentes...");
      await Promise.all(TODOS_LOS_MODELOS.map((M) => M.deleteMany({})));
    } else {
      const yaHayDatos = await MaestroProducto.countDocuments();
      if (yaHayDatos > 0) {
        console.log(
          "La base ya contiene datos. Usá `npm run seed:force` para reiniciar. Saliendo."
        );
        await mongoose.disconnect();
        return;
      }
    }

    for (const { modelo, archivo, map } of PASOS) {
      const datos = await leerJSON(archivo);
      const docs = datos.map(map);
      await modelo.insertMany(docs, { ordered: false });
      console.log(`✅ ${modelo.modelName.padEnd(15)} ${String(docs.length).padStart(3)} docs  (${archivo})`);
    }

    // Operadores aparte (hash asíncrono de la clave)
    const usuarios = await leerJSON("Usuarios.json");
    const operadores = await Promise.all(usuarios.map(tOperador));
    await Operador.insertMany(operadores, { ordered: false });
    console.log(`✅ ${"Operador".padEnd(15)} ${String(operadores.length).padStart(3)} docs  (Usuarios.json)`);

    await verificarIntegridad();

    console.log("\n🎉 Migración completada con éxito");
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrar();