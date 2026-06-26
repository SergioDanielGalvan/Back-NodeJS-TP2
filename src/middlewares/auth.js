// middlewares/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

// Requiere un JWT válido en el header: Authorization: Bearer <token>
export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    req.operador = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Opcional: restringe por rol. Usar SIEMPRE después de verificarToken.
// Ej: router.delete("/:id", verificarToken, permitirRoles("admin"), handler)
export const permitirRoles = (...roles) => (req, res, next) => {
  if (!req.operador || !roles.includes(req.operador.rol)) {
    return res.status(403).json({ error: "No autorizado para esta acción" });
  }
  next();
};
