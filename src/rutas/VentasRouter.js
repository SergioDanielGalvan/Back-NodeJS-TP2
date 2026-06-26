// rutas/VentasRouter.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

import {
  getVentaById,
  getVentas,
  registrarVenta,
} from "../controladores/VentasControlador.js";

const router = Router();

router.post("/", verificarToken, registrarVenta);
router.get("/", getVentas);
router.get("/:id", getVentaById);

export default router;
