import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

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
  getDetalleStockPorProducto,
  getLotesPorProducto,
  getProductosPorVencimiento,
  getReporteStock,
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
router.get("/stock/detalle/:idProducto", getDetalleStockPorProducto);
router.get("/stock/:idProducto/lotes", getLotesPorProducto);
//router.get("/vencimiento/:dias", getProductosPorVencimiento);
router.get("/reporte/reposicion", getReporteStock);

// Rutas de productos Privadas (requieren token)
router.post("/", verificarToken, createProducto);
router.get("/vencimiento/:dias", verificarToken, getProductosPorVencimiento);
//router.get("/reporte/reposicion", verificarToken, getReporteStock);

// Privada y Admin
router.delete("/:id", verificarToken, deleteProductoById);
router.put("/stock/:id", verificarToken, updateProductoWithStock);
router.put("/precio/:id", verificarToken, updateProductoWithPrecio);
router.post("/compra", verificarToken, crearRegistroCompra);

export default router;
