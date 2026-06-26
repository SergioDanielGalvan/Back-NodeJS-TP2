# Fix — el login daba 401 porque el Operador no se insertaba

## Causa
En `Operador.js` el hook estaba escrito como `async function (next) { ... next(); }`.
Mezclar `async` + `next()` hace que Mongoose considere la validación resuelta dos veces
y la marque como fallida. Con `insertMany(..., { ordered: false })` ese error se traga en
silencio y el documento se descarta -> 0 operadores en la base (aunque el log decía "1 docs").

## Arreglo
1. `src/modelos/Operador.js`  -> hook `async` SIN `next()`.
2. `src/servicios/migrar.js`  -> ahora reporta insertados REALES (ej: `1/1 docs`) y avisa si se descarta algo.

## Pasos
1. Reemplazá esos dos archivos.
2. Volvé a correr:  `npm run seed:force`
   Tenés que ver:  `✅ Operador   1/1 docs  (Usuarios.json)`
3. Probá el login de nuevo:
   POST /api/operadores/login   { "email": "roberto@todostocksrl.com", "password": "password123" }
   -> 200 "Login correcto"
4. Borrá el diagnóstico: `git rm diagnostico-login.js` (o no lo commitees).
