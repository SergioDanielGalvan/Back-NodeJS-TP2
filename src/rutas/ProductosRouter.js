// src/rutas/ProductosRouter.js
import { Router } from "express";

const router = Router();

import {
  crearRegistroCompra,
  createProducto,
  deleteProductoById,
  getAllProductos,
  getAllProductosByNombre,
  getAllProductosByCategoria,
  getAllProductosWithStock,
  getProductoById,
  getProductoByNombre,
  updateProductoWithPrecio,
  updateProductoWithStock,
} from "../controladores/ProductosControlador.js";

// Rutas de productos Públicas
router.get("/", getAllProductos);
router.get("/:id", getProductoById);
router.get("/nombre/:nombre", getProductoByNombre);
router.get("/nombres/:nombre", getAllProductosByNombre);
router.get("/categoria/:categoria", getAllProductosByCategoria);

// Rutas de productos Privadas
router.get("/stock", getAllProductosWithStock);
router.post("/", createProducto);

// Privada y Admin
router.delete("/:id", deleteProductoById);
router.put("/stock/:id", updateProductoWithStock);
router.put("/precio/:id", updateProductoWithPrecio);
router.post("/compra", crearRegistroCompra);

export default router;