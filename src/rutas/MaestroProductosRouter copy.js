// src/rutas/ProductosRouter.js
import { Router } from "express";

const router = Router();

import {
  createProducto,
  deleteProducto,
  getAllProductos,
  getAllProductosByCategoria,
  getProductoByEAN,
  getProductoById,
  getProductoByNombre,
  updateProducto,
} from "../controladores/MaestroProductosControlador.js";

// Rutas de productos Públicas
router.get("/", getAllProductos);
router.get("/:id", getProductoById);
router.get("/nombre/:nombre", getProductoByNombre);
router.get("/categoria/:categoria", getAllProductosByCategoria);
router.get("/ean/:ean", getProductoByEAN);

// Rutas de productos Privadas
router.post("/", createProducto);
// Privada y Admin
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;