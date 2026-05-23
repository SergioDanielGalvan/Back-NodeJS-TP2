import { Router } from "express";

import {
  deleteUsuario,
  getUsuarioById,
  getUsuarios,
  login,
  register,
} from "../controladores/UsuariosControlador.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.delete("/:id", deleteUsuario);

export default router;
