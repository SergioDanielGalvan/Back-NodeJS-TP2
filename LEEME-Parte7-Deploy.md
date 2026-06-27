# Parte 7 — Deploy en Vercel + Mongo Atlas (con datos precargados)

## Archivos
Nuevos:
- `api/index.js`     (entry serverless: exporta la app de Express)
- `vercel.json`      (rutea todo a /api)
- `.env.example`     (plantilla; copiar a .env)
Modificados:
- `src/config/mongodb.js`  (lee MONGODB_URI del entorno + cache de conexión serverless)
- `app.js`                 (dotenv, conexión por request, exporta la app, listen solo en local)
- `src/servicios/migrar.js`(dotenv + dbName)

Dependencia ya presente: `dotenv` (en package.json).

---

## PASO 1 — Precargar Atlas (la migración)

1. Creá un archivo `.env` en la raíz (NO se commitea) con tu cadena de Atlas:

   MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/TP2-IFTS29?appName=TP2-IFTS29
   MONGODB_DB=TP2-IFTS29

   - Reemplazá PASSWORD por la clave real (URL-encodeá símbolos: @ -> %40, etc.)
   - Asegurate que termine en /TP2-IFTS29 antes del "?"

2. En Atlas:
   - Database Access: el usuario debe tener rol readWrite sobre TP2-IFTS29.
   - Network Access: agregá tu IP actual (para poder seedear desde tu máquina).

3. Instalá y seedeá:

   npm install
   npm run seed:force

   Como el .env apunta a Atlas, la carga va directo a Atlas. Tenés que ver los X/X docs
   y la verificación contable. Verificalo en Atlas (Collections) o con Compass.

---

## PASO 2 — Deploy en Vercel

1. Subí el repo a GitHub (con el .env IGNORADO).

2. En Vercel:
   - New Project -> importá el repo.
   - Settings -> Environment Variables:
       MONGODB_URI = (la misma cadena de Atlas)
       MONGODB_DB  = TP2-IFTS29
   - Deploy.

3. En Atlas -> Network Access: agregá 0.0.0.0/0 (o el rango de Vercel) para que la
   función serverless pueda conectar.

4. Probá los endpoints en la URL .vercel.app, ej:
   POST https://TU-APP.vercel.app/api/operadores/login

---

## Notas / gotchas
- En Vercel, `express.static()` NO sirve archivos estáticos (es la doc oficial): las
  imágenes/CSS de las vistas Pug no se sirven así. La API funciona 100%. Si necesitás
  los assets de las vistas, movelos a una carpeta `public/` en la raíz.
- Si las vistas Pug (res.render) fallan en Vercel por no encontrar los .pug, hay que
  incluirlos en el bundle (config `includeFiles`). Para el TP de API no es bloqueante.
- NUNCA commitees el .env. La cadena de Atlas y la password van solo en .env (local) y
  en las Environment Variables de Vercel.
