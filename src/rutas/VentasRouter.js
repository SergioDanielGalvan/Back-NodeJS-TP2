// rutas/VentasRouter.js
import { Router } from "express";

import {
  getVentaById,
  getVentas,
  registrarVenta,
} from "../controladores/VentasControlador.js";

const router = Router();

router.post("/", registrarVenta);
router.get("/", getVentas);
router.get("/:id", getVentaById);

export default router;
