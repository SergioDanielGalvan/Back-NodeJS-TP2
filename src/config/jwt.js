// config/jwt.js
export const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-CAMBIAR-en-produccion";
export const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";
