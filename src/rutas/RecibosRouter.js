// rutas/RecibosRouter.js
import { Router } from "express";

import {
  getEstadoFactura,
  getReciboById,
  getRecibos,
  registrarRecibo,
} from "../controladores/RecibosControlador.js";

const router = Router();

router.post("/", registrarRecibo);
router.get("/", getRecibos);
router.get("/factura/:idFacturaVenta", getEstadoFactura);
router.get("/:id", getReciboById);

export default router;
