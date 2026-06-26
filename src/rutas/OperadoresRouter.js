// rutas/OperadoresRouter.js
import { Router } from "express";

import {
  deleteOperador,
  getOperadorById,
  getOperadores,
  login,
  register,
} from "../controladores/OperadoresControlador.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getOperadores);
router.get("/:id", getOperadorById);
router.delete("/:id", deleteOperador);

export default router;
