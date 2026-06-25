# Parte 1 — Migración por scripts (JSON -> MongoDB)

## Qué incluye
Archivos nuevos:
- `src/modelos/Cliente.js`
- `src/modelos/Proveedor.js`
- `src/modelos/Operador.js`   (entidad de auth alineada al diseño; reemplaza a "Usuario")

Archivos modificados:
- `src/modelos/MaestroProductos.js`  (unidadMedida/envase opcionales; se agrega `precioventa`)
- `src/modelos/Productos.js`         (se agregan idFacturaCompra/idDetalleCompra/fechaIngresoStock)
- `src/modelos/DetalleVenta.js`      (`montototal` -> `montoTotal`)
- `src/modelos/FacturaVenta.js`      (se agregan tipoComprobante/letraComprobante/fecha)
- `src/servicios/migrar.js`          (seeder robusto con transformaciones, --force y verificación)
- `package.json`                     (scripts `seed` y `seed:force`)

## Cómo correr
1. Copiá estos archivos sobre tu repo (respetan las rutas).
2. Tené MongoDB corriendo en `mongodb://127.0.0.1:27017/TP2-IFTS29`
   (o exportá `MONGODB_URI` para apuntar a otra instancia/Atlas).
3. Instalá dependencias si hace falta: `npm install`
4. Migrá:
   - `npm run seed`        -> migra solo si la base está vacía
   - `npm run seed:force`  -> borra las colecciones y vuelve a migrar

## Renombres de campo que hace el seeder (JSON -> schema)
- MaestroProductos: `stockminimo` -> `stockMinimo`; se conserva `precioventa`
- Clientes:         `fecha` -> `fechaAlta`
- FacturaVentas:    `total` -> `montoTotal`
- Usuarios->Operador: `nombre`->`nombres`, `password`->`claveHash` (hasheado con bcrypt),
                      `rol` a minúscula, `NroIntentos`->`intentosErroneos`, `idUsuario`->`idOperador`

## Notas
- El `saldo` de Productos NO se persiste: se calcula dinámicamente (stock - ventas).
- Recibos se vincula a `idCliente` (no a `idFacturaVenta`). Para enforzar
  "N recibos por factura, suma que cierra" hay que agregar esa FK al modelo Recibo
  (queda para la parte de Recibos).
- Esta parte solo migra datos y deja los modelos listos. Recablear los
  controladores/servicios que todavía leen JSON con `fs` es la parte siguiente.
