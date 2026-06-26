// rutas/RecibosRouter.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

import {
  getEstadoFactura,
  getReciboById,
  getRecibos,
  registrarRecibo,
} from "../controladores/RecibosControlador.js";

const router = Router();

router.post("/", verificarToken, registrarRecibo);
router.get("/", getRecibos);
router.get("/factura/:idFacturaVenta", getEstadoFactura);
router.get("/:id", getReciboById);

export default router;
