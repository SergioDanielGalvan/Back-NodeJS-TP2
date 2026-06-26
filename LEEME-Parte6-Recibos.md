# Parte 6 — Circuito de Recibos (con regla de cierre contable)

## Archivos
Nuevos:
- `src/servicios/RecibosService.js`
- `src/controladores/RecibosControlador.js`
- `src/rutas/RecibosRouter.js`
Modificados:
- `src/modelos/Recibos.js`   (NUEVO campo `idFacturaVenta` + statics)
- `src/servicios/migrar.js`  (backfill de idFacturaVenta en recibos + chequeo contable)
- `app.js`                   (monta el router en `/api/recibos`)

## Resuelve el gap de diseño
El modelo Recibo ahora tiene `idFacturaVenta` (antes solo `idCliente`), así se puede
enforcar la regla: **N recibos por FacturaVenta, cuya suma no puede exceder el total.**

El seeder backfillea ese campo en los recibos sembrados mapeando cliente -> factura
(en el seed hay 1 factura por cliente, así que es unívoco).

## IMPORTANTE: re-seedear
Como cambió el modelo Recibo y el seeder, hay que recargar:
    npm run seed:force

Tenés que ver:
    ✅ Recibo            3/3 docs  (Recibos.json)
    ...
    — Verificación —
    Factura 1: total=120000 pagado=120000 -> OK (cancelada)
    Factura 2: total=932920 pagado=932920 -> OK (cancelada)
    Factura 3: total=226000 pagado=226000 -> OK (cancelada)

## Endpoints
- POST /api/recibos                       -> registrar un recibo contra una factura
- GET  /api/recibos                       -> listar recibos
- GET  /api/recibos/:id                   -> un recibo
- GET  /api/recibos/factura/:idFacturaVenta -> estado de cuenta de la factura
       (montoTotal, pagado, pendiente, cancelada, y sus recibos)

## Demostrar la regla
1) Estado de una factura ya cancelada (datos sembrados):
   GET /api/recibos/factura/1
   -> { montoTotal:120000, pagado:120000, pendiente:0, cancelada:true, recibos:[...] }

2) Intentar pagar de más una factura cancelada:
   POST /api/recibos  { "idFacturaVenta":1, "monto":1000 }
   -> 400 "El monto (1000) excede el saldo pendiente de la factura (0)"

3) Pago parcial sobre una factura nueva (primero generá una venta):
   POST /api/ventas   { "idCliente":1, "items":[{ "idProducto":1, "cantidad":60 }] }
        -> crea FacturaVenta 4, montoTotal 228000
   GET  /api/recibos/factura/4   -> pagado 0, pendiente 228000
   POST /api/recibos  { "idFacturaVenta":4, "monto":100000 }
        -> estadoFactura: pagado 100000, pendiente 128000, cancelada false
   POST /api/recibos  { "idFacturaVenta":4, "monto":128000 }
        -> estadoFactura: pagado 228000, pendiente 0, cancelada true
   POST /api/recibos  { "idFacturaVenta":4, "monto":1 }
        -> 400 excede el saldo pendiente (0)

(Los recibos nuevos arrancan en idRecibo 4 / nroRecibo "R004".)
