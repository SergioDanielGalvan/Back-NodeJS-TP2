import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

import Operador from "../modelos/Operador.js";
import { obtenerResumenStock } from "../controladores/ProductosControlador.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

// --- Vista del Formulario de Login ---
router.get("/login", (req, res) => res.render("login", { error: null }));

// --- Procesar el Login ---
router.post("/login", async (req, res) => {
  const { usuario, clave } = req.body;
  console.log("➡️ INTENTO DE LOGIN CON:", { usuario, clave });

  try {
    // 🔓 LOGIN FORZADO DIRECTO: Si ponés admin / admin123, entra sí o sí salteando la base de datos
    if (usuario === "admin" && clave === "admin123") {
      console.log("¡Combinación admin/admin123 detectada! Forzando login exitoso...");
      
      const token = jwt.sign(
        { id: "123456789012345678901234", usuario: "admin", nombre: "Administrador Local", rol: "sistema" },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 8,
      });
      
      return res.redirect("/");
    }

    const op = await Operador.findOne({ usuario });
    console.log("Operador encontrado en Mongo:", op);

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

// --- Cerrar Sesión ---
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// --- Consultas públicas (sin login) ---
router.get("/consultas/stock", async (req, res) => {
  try {
    const productos = await obtenerResumenStock();
    res.render("consultas/stock", { productos, error: null });
  } catch (err) {
    console.error("Error al consultar stock:", err);
    res.status(500).render("consultas/stock", {
      productos: [],
      error: "No se pudo cargar el stock",
    });
  }
});

// --- Vista del Formulario de Compras ---
router.get("/compras", verificarToken, (req, res) => {
  res.render("compras", { error: null });
});

export default router;