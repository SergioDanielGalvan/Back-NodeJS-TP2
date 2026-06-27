// middlewares/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

// Saca el token del header Bearer (API) o, si no hay, de la cookie (vistas Pug)
const extraerToken = (req) => {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");
  if (tipo === "Bearer" && token) return token;
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

// Requiere un JWT válido. Header O cookie.
export const verificarToken = (req, res, next) => {
  const token = extraerToken(req);

  if (!token) {
    if (req.accepts("html")) return res.redirect("/login");
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    req.operador = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    if (req.accepts("html")) return res.redirect("/login");
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Restringe por rol. Usar SIEMPRE después de verificarToken.
export const permitirRoles = (...roles) => (req, res, next) => {
  if (!req.operador || !roles.includes(req.operador.rol)) {
    return res.status(403).json({ error: "No autorizado para esta acción" });
  }
  next();
};

// No bloquea. Deja res.locals.operador en TODAS las vistas (para el menú).
export const cargarOperador = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try { res.locals.operador = jwt.verify(token, JWT_SECRET); }
    catch { res.locals.operador = null; }
  } else {
    res.locals.operador = null;
  }
  next();
};
