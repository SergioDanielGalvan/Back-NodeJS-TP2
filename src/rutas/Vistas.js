// src/rutas/Vistas.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

import Operador from "../modelos/Operador.js";
import {
  obtenerResumenStock,
  obtenerReporteReposicion,
} from "../controladores/ProductosControlador.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

// --- Login ---
router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
  const { usuario, clave } = req.body;
  try {
    const op = await Operador.findOne({ usuario });
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

export default router;
