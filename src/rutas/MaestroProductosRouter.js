import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

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

// Rutas de productos Privadas (requieren token)
router.post("/", verificarToken, createProducto);
// Privada y Admin
router.put("/:id", verificarToken, updateProductoById);
router.delete("/:id", verificarToken, deleteProductoById);

export default router;
