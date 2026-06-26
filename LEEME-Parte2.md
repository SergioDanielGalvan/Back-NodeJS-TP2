# Parte 2 — Auth migrado a Operador

## Archivos nuevos / actualizados (copiar sobre el repo)
- `src/modelos/Operador.js`            (actualizado: hook de auto-incremento de idOperador + statics crear/eliminar)
- `src/servicios/OperadoresService.js` (reemplaza a UsuariosService.js)
- `src/controladores/OperadoresControlador.js` (reemplaza a UsuariosControlador.js)
- `src/rutas/OperadoresRouter.js`      (reemplaza a UsuariosRouter.js)
- `app.js`                             (ahora importa y monta el router de operadores)

## Archivos a eliminar (la cadena vieja de Usuarios)
```bash
git rm src/rutas/UsuariosRouter.js \
       src/controladores/UsuariosControlador.js \
       src/servicios/UsuariosService.js \
       src/modelos/Usuarios.js
```

## Qué cambió
- El modelo de auth pasa de `Usuario` (password) a `Operador` (claveHash), alineado al diseño.
- La ruta cambia: `/api/usuarios/...`  ->  `/api/operadores/...`
- `register` acepta `nombres` (o `nombre` por compatibilidad), `apellidos` (opcional),
  `email`, `password`, `rol`.
- `login` sigue recibiendo `{ email, password }` y compara contra `claveHash` con bcrypt.
- Nunca se devuelve la `claveHash` al cliente.

## Endpoints
- POST   /api/operadores/register
- POST   /api/operadores/login
- GET    /api/operadores
- GET    /api/operadores/:id
- DELETE /api/operadores/:id

## Probar con el dato sembrado
El operador migrado desde Usuarios.json (Don Roberto) queda con la clave hasheada:
  POST /api/operadores/login
  { "email": "roberto@todostocksrl.com", "password": "password123" }
Debe responder "Login correcto" con los datos del operador (sin claveHash).

## Pendiente / opcional
El modelo Operador ya tiene los campos del diseño para bloqueo de cuenta
(intentosErroneos, fechaBloqueo, estadoCuenta, fechaLogin/fechaLogout).
La lógica de bloqueo por intentos fallidos NO está implementada todavía;
se puede agregar como mejora si entra en el alcance.
