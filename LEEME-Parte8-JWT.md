# Parte 8 — Autenticación con JWT

## Archivos
Nuevos:
- `src/config/jwt.js`         (JWT_SECRET y expiración desde entorno)
- `src/middlewares/auth.js`   (verificarToken + permitirRoles)
Modificados:
- `package.json`              (dependencia jsonwebtoken)
- `src/servicios/OperadoresService.js`     (login firma y devuelve el token)
- `src/controladores/OperadoresControlador.js` (login devuelve { token, operador })
- `src/rutas/*.js`            (token en las escrituras)
- `.env.example`             (JWT_SECRET, JWT_EXPIRES)

## Instalar
    npm install            # baja jsonwebtoken
En tu .env (opcional pero recomendado):
    JWT_SECRET=una-clave-larga-y-aleatoria
    JWT_EXPIRES=8h
(Si no lo ponés, usa un secret de desarrollo por defecto.)

## Qué requiere token y qué no
PÚBLICO (sin token):
- POST /api/operadores/login
- TODOS los GET (productos, stock, saldos, maestro, compras, ventas, recibos, operadores)

REQUIERE token (header `Authorization: Bearer <token>`):
- POST /api/operadores/register
- DELETE /api/operadores/:id
- POST/PUT/DELETE de productos y maestroproductos (crear, stock, precio, compra, borrar)
- POST /api/compras
- POST /api/ventas
- POST /api/recibos

## Flujo de prueba
1) Login (público) -> copiás el token:
   POST /api/operadores/login
   { "email": "roberto@todostocksrl.com", "password": "password123" }
   -> { "message":"Login correcto", "token":"eyJ...", "operador":{...} }

2) GET público (sin token) funciona:
   GET /api/productos/saldo/producto/1   -> 200

3) Escritura SIN token -> 401:
   POST /api/ventas { "idCliente":1, "items":[{"idProducto":1,"cantidad":10}] }
   -> 401 { "error": "Token requerido" }

4) La misma escritura CON token -> 201:
   POST /api/ventas
   Header: Authorization: Bearer eyJ...
   -> 201 (venta registrada)

5) Token inválido/vencido -> 401 "Token inválido o expirado"

## Roles (opcional, ya disponible)
El middleware `permitirRoles("admin")` ya está listo para gatear por rol.
Ej: router.delete("/:id", verificarToken, permitirRoles("admin"), handler)
Hoy no está aplicado para que todo sea testeable con el operador sembrado (rol "operador").

## Deploy
En Vercel agregá también la env var JWT_SECRET (además de MONGODB_URI/MONGODB_DB).
