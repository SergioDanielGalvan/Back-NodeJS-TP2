import { Router } from "express";

const router = Router();

import {
  crearRegistroCompra,
  createProducto,
  deleteProductoById,
  getAllProductos,
  getAllProductosByCategoria,
  getAllProductosByNombre,
  getProductoById,
  getProductoByNombre,
  getSaldoLote,
  getSaldoProducto,
  getResumenStockPorProducto,
  updateProductoWithPrecio,
  updateProductoWithStock,
} from "../controladores/ProductosControlador.js";

// Rutas de productos Públicas
router.get("/", getAllProductos);
router.get("/:id", getProductoById);
router.get("/nombre/:nombre", getProductoByNombre);
router.get("/nombres/:nombre", getAllProductosByNombre);
router.get("/categoria/:categoria", getAllProductosByCategoria);
router.get("/saldo/lote/:idLote", getSaldoLote);
router.get("/saldo/producto/:idProducto", getSaldoProducto);
router.get("/stock/resumen", getResumenStockPorProducto);

// Rutas de productos Privadas
router.post("/", createProducto);

// Privada y Admin
router.delete("/:id", deleteProductoById);
router.put("/stock/:id", updateProductoWithStock);
router.put("/precio/:id", updateProductoWithPrecio);
router.post("/compra", crearRegistroCompra);

export default router;
