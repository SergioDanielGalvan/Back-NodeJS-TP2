# LEEME — Reporte de reposición

Reporte protegido en `GET /reportes/reposicion`. Muestra dos zonas (bajo stock y
reposición) con badges de estado, reusando `getReporteReposicion()` del modelo.

---

## 0. Primero: destrabar el crash (FUNCTION_INVOCATION_FAILED)

El deploy se cae al ARRANCAR porque el router importa nombres que el resto del
código todavía no exporta. En ESM, un import nombrado inexistente rompe toda la
app (no queda en `undefined` como en CommonJS). Hay que alinear dos imports.

### a) Falta `obtenerReporteReposicion` en el controlador

`Vistas.js` importa `obtenerReporteReposicion`, pero `ProductosControlador.js`
no la tenía. Agregá esto al controlador (ya importás `getReporteReposicion`
arriba, así que no hace falta import nuevo):

```javascript
// Devuelve datos del reporte (no escribe en res) para reusar en la vista Pug.
export const obtenerReporteReposicion = async () => {
  return await getReporteReposicion();
};
```

Verificá (debe devolver DOS líneas: el export y el import del router):

    Get-Content src\controladores\ProductosControlador.js | Select-String "obtenerReporteReposicion"

### b) Confirmá el export de `verificarToken`

`Vistas.js` hace `import { verificarToken } from "../middlewares/auth.js"`.
Confirmá que auth.js lo exporte con ESE nombre exacto:

    Get-Content src\middlewares\auth.js | Select-String "export"

- Si ves `export const verificarToken` o `export function verificarToken`: OK,
  el import con llaves está bien.
- Si ves `export default ...`: cambiá el import del router a
  `import verificarToken from "../middlewares/auth.js"` (SIN llaves).

Cuando los dos imports resuelven, el crash desaparece.

---

## 1. Archivos

- `Vistas.js`  ->  reemplaza `src/rutas/Vistas.js`
- `reposicion.pug`  ->  va en `src/vistas/reportes/reposicion.pug`
  (creá la carpeta `reportes` si no existe)

El export del controlador (paso 0a) lo pegás a mano: no incluyo el controlador
completo para no pisar el resto de tu archivo.

---

## 2. CSS (opcional, para los textos de resumen y zona)

Pegá al final de `src/vistas/css/estilos.css`:

```css
.resumen { color: var(--muted); font-size: .92rem; margin: 0 0 1.5rem; }
.zona-desc { color: var(--muted); font-size: .88rem; margin: -.25rem 0 .75rem; }
.vacio { color: var(--faint); font-style: italic; padding: .5rem 0; }
```

Los badges `.estado.bajo` y `.estado.reposicion` ya están en tu CSS.

---

## 3. Link del menú

En `layout.pug` el menú apunta a `/reportes`, pero la ruta es
`/reportes/reposicion`. Cambiá ese `href` a `/reportes/reposicion`, o más
adelante armás un índice en `/reportes`. Si no, el botón "Reportes" da 404.

---

## 4. Pug: indentación

2 espacios por nivel, nunca tabs. Si tu `consultas/stock.pug` usa
`extends ../layout.pug` (con `.pug` al final), igualá esa forma en
`reposicion.pug` para no mezclar convenciones.

---

## 5. Probar

1. Logueate.
2. Entrá a `/reportes/reposicion` -> dos zonas con badges.
3. Sin login, debería redirigirte a `/login` (la protección anda).
