// src/rutas/ProductosRouter.js
import { Router } from "express";

const router = Router();

import {
  createProducto,
  deleteProductoById,
  getAllProductos,
  getAllProductosByCategoria,
  getProductoByEAN,
  getProductoById,
  getProductoByNombre,
  updateProductoById,
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
router.put("/:id", updateProductoById);
router.delete("/:id", deleteProductoById);

export default router;