// src/rutas/Vistas.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

import Operador from "../modelos/Operador.js";
import {
  obtenerResumenStock,
  obtenerReporteReposicion,
  obtenerIndiceReportes,
  obtenerReporteVencimiento,
  obtenerReporteValor
} from "../controladores/ProductosControlador.js";

import { verificarToken } from "../middlewares/auth.js";

import {
  obtenerResumenStock,
  obtenerReporteReposicion,
  obtenerIndiceReportes,
  obtenerReporteVencimiento,
  obtenerReporteValor,
  listarMaestro,
  obtenerMaestroPorId,
  crearMaestro,
  actualizarMaestro,
  eliminarMaestro,
} from "../controladores/ProductosControlador.js";

const router = express.Router();

// --- Login ---
router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
  const { usuario, clave } = req.body;
  try {
    const op = await Operador.findOne({ email: usuario });
    if (!op || !(await bcrypt.compare(clave, op.claveHash))) {
      return res.render("login", { error: "Usuario o clave incorrectos" });
    }
    const token = jwt.sign(
      { id: op.id ?? op._id, usuario: op.usuario, nombre: op.nombre, rol: op.rol },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    });
    res.redirect("/");
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).render("login", { error: "Error del servidor" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// --- Consultas públicas (sin login) ---
router.get("/consultas/stock", async (req, res) => {
  try {
    const productos = await obtenerResumenStock();   // ⬅️ función que devuelve datos
    res.render("consultas/stock", { productos, error: null });
  } catch (err) {
    console.error("Error al consultar stock:", err);
    res.status(500).render("consultas/stock", {
      productos: [],
      error: "No se pudo cargar el stock",
    });
  }
});

// --- Reporte de reposición (requiere login) ---
router.get("/reportes/reposicion", verificarToken, async (req, res) => {
  try {
    const reporte = await obtenerReporteReposicion();
    res.render("reportes/reposicion", { reporte, error: null });
  } catch (err) {
    console.error("Error al generar reporte de reposición:", err);
    res.status(500).render("reportes/reposicion", {
      reporte: {
        bajoStock: { cantidad: 0, items: [] },
        reposicion: { cantidad: 0, items: [] },
      },
      error: "No se pudo generar el reporte",
    });
  }
});

// --- Index de Reportes ---
router.get("/reportes", verificarToken, async (req, res) => {
  try {
    await obtenerIndiceReportes();
    res.render("reportes/index", { error: null });
  } catch (err) {
    console.error("Error en índice de reportes:", err);
    res.status(500).render("reportes/index", { error: "No se pudo cargar" });
  }
});

export default router;

// --- EndPoint de Reportes Vencimiento ---
router.get("/reportes/vencimiento", verificarToken, async (req, res) => {
  try {
    let dias = Number(req.query.dias);
    if (!Number.isFinite(dias) || dias < 0) dias = 30;
    const reporte = await obtenerReporteVencimiento(dias);
    res.render("reportes/vencimiento", { reporte, error: null });
  } catch (err) {
    console.error("Error en reporte de vencimiento:", err);
    res.status(500).render("reportes/vencimiento", {
      reporte: { dias: 30, cantidad: 0, items: [] },
      error: "No se pudo generar el reporte",
    });
  }
});

// --- EndPoint de Reportes Valor ---
router.get("/reportes/valor", verificarToken, async (req, res) => {
  try {
    const reporte = await obtenerReporteValor();
    res.render("reportes/valor", { reporte, error: null });
  } catch (err) {
    console.error("Error en reporte de valor:", err);
    res.status(500).render("reportes/valor", {
      reporte: { valorTotal: 0, items: [] },
      error: "No se pudo generar el reporte",
    });
  }
});

// --- ABM MaestroProducto (requiere login) ---

// Listado
router.get("/maestro", verificarToken, async (req, res) => {
  try {
    const productos = await listarMaestro();
    res.render("maestro/index", { productos, error: null });
  } catch (err) {
    console.error("Error al listar maestro:", err);
    res.status(500).render("maestro/index", { productos: [], error: "No se pudo cargar" });
  }
});

// Form de alta (vacío)
router.get("/maestro/nuevo", verificarToken, (req, res) => {
  res.render("maestro/form", { producto: null, error: null });
});

// Form de edición (precargado)
router.get("/maestro/:id/editar", verificarToken, async (req, res) => {
  try {
    const producto = await obtenerMaestroPorId(req.params.id);
    if (!producto) return res.status(404).render("404");
    res.render("maestro/form", { producto, error: null });
  } catch (err) {
    console.error("Error al cargar producto:", err);
    res.status(500).render("maestro/form", { producto: null, error: "No se pudo cargar" });
  }
});

// Crear (POST)
router.post("/maestro", verificarToken, async (req, res) => {
  try {
    const operador = res.locals.operador?.nombre || "sistema";
    await crearMaestro(req.body, operador);
    res.redirect("/maestro");
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(400).render("maestro/form", { producto: req.body, error: err.message });
  }
});

// Actualizar (PUT vía methodOverride)
router.put("/maestro/:id", verificarToken, async (req, res) => {
  try {
    await actualizarMaestro(req.params.id, req.body);
    res.redirect("/maestro");
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(400).render("maestro/form", { producto: { ...req.body, idProducto: req.params.id }, error: err.message });
  }
});

// Eliminar (DELETE vía methodOverride)
router.delete("/maestro/:id", verificarToken, async (req, res) => {
  try {
    await eliminarMaestro(req.params.id);
    res.redirect("/maestro");
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.redirect("/maestro");
  }
});