# Parte 3 — Productos / stock: de fs.readFile a MongoDB

## Archivos (copiar sobre el repo)
- `src/modelos/Productos.js`              (reescrito: consultas Mongo, sin fs)
- `src/controladores/ProductosControlador.js` (4 endpoints de stock migrados a Mongo)

## Qué cambió
Idea central: el **saldo de un lote = stock cargado − cantidades vendidas de ese lote**
(suma de `cantidad` en `DetalleVenta`). Antes se leía de los JSON; ahora se resuelve
con un `aggregate` sobre `DetalleVenta`.

Modelo `Productos.js`:
- `getSaldoLote`, `getSaldoProducto`, `getProductosConBajoStockOptimizado`,
  `getValorInventario` → ahora consultan Mongo (sin fs).
- `getListaLotesDisponibles` → reescrita (estaba rota: reasignaba un const y usaba
  variables sin declarar). Ahora hace FEFO con Mongo (ordena por FechaVencimiento).
- `grabarDescargaStock` → eliminada. Escribía el JSON y quedó obsoleta: el saldo es
  dinámico, la descarga de stock se hará insertando DetalleVenta en el circuito de ventas.
- **Nuevo static `obtenerPorIdLote`** → arregla el bug de `getProductoById`
  (llamaba a un método que no existía).

Controlador `ProductosControlador.js`:
- `getResumenStockPorProducto`, `getDetalleStockPorProducto`, `getDetalleStockPorLote`,
  `getLotesPorProducto` → migrados a Mongo (Producto.find + agregación de DetalleVenta).
- Se quitó todo el bloque `fs`/`path`/`DATA_PATH`.

## Endpoints y valores esperados (con los datos sembrados)

GET /api/productos/:id            -> ahora funciona (antes tiraba 500 por obtenerPorIdLote)

GET /api/productos/saldo/lote/1   -> { "idLote": 1, "Saldo": 40 }
GET /api/productos/saldo/lote/3   -> { "idLote": 3, "Saldo": 82 }
GET /api/productos/saldo/lote/4   -> { "idLote": 4, "Saldo": 260 }

GET /api/productos/saldo/producto/1 -> { "idProducto": 1, "Saldo": 340 }
GET /api/productos/saldo/producto/4 -> { "idProducto": 4, "Saldo": 490 }

GET /api/productos/stock/resumen  -> saldoTotal por producto:
   prod 1: 340 | prod 2: 145 | prod 3: 222 | prod 4: 490 | prod 5: 315 | prod 6: 190 | prod 7: 300

## Pendiente (para la parte de Ventas)
`Venta.js` está inerte (nadie lo importa) e importa `modificarSaldo` de Productos.js,
que no existe. Se resuelve cuando armemos el circuito de ventas.
