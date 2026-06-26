// rutas/ComprasRouter.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

import {
  getCompraById,
  getCompras,
  registrarCompra,
} from "../controladores/ComprasControlador.js";

const router = Router();

router.post("/", verificarToken, registrarCompra);
router.get("/", getCompras);
router.get("/:id", getCompraById);

export default router;
