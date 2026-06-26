// rutas/OperadoresRouter.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";

import {
  deleteOperador,
  getOperadorById,
  getOperadores,
  login,
  register,
} from "../controladores/OperadoresControlador.js";

const router = Router();

router.post("/register", verificarToken, register);
router.post("/login", login);
router.get("/", getOperadores);
router.get("/:id", getOperadorById);
router.delete("/:id", verificarToken, deleteOperador);

export default router;
