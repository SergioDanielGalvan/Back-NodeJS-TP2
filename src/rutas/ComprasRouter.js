// rutas/ComprasRouter.js
import { Router } from "express";

import {
  getCompraById,
  getCompras,
  registrarCompra,
} from "../controladores/ComprasControlador.js";

const router = Router();

router.post("/", registrarCompra);
router.get("/", getCompras);
router.get("/:id", getCompraById);

export default router;
