# Parte 4 — Circuito de Compras

## Archivos
Nuevos:
- `src/servicios/ComprasService.js`
- `src/controladores/ComprasControlador.js`
- `src/rutas/ComprasRouter.js`
Modificado:
- `app.js`  (monta el router en `/api/compras`)

## Qué hace
Registrar una compra crea, en una sola operación:
- 1 `FacturaCompra` (cabecera: proveedor, nroFactura, fecha, montoTotal calculado)
- N `DetalleCompra` (una línea por producto)
- N lotes (`Producto`) — cada detalle ingresa stock, linkeado por idFacturaCompra/idDetalleCompra

Los ids (idFacturaCompra, idDetalleCompra, idLote) se autoincrementan.
El montoTotal de la factura = suma de (cantidad × precioUnitario) de cada item.

## Endpoints
- POST   /api/compras        -> registrar una compra
- GET    /api/compras        -> listar facturas de compra
- GET    /api/compras/:id    -> una factura con sus detalles

## Ejemplo
POST /api/compras
{
  "idProveedor": 1,
  "nroFactura": "0001-99999999",
  "fechaFactura": "2026-06-26",
  "items": [
    { "idProducto": 1, "cantidad": 100, "precioUnitario": 3500, "fechaVencimiento": "2027-08-01" },
    { "idProducto": 3, "cantidad": 60,  "precioUnitario": 1200 }
  ]
}

Con los datos sembrados, lo esperado:
- factura.idFacturaCompra = 6   (había 5)
- detalles.idDetalleCompra = 13 y 14   (había 12)
- lotes.idLote = 13 y 14   (había 12)
- factura.montoTotal = 100*3500 + 60*1200 = 350000 + 72000 = 422000

Y al haber ingresado un lote nuevo de 100 para el producto 1:
- GET /api/productos/saldo/producto/1  -> Saldo pasa de 340 a 440

## Notas
- Validaciones: proveedor existente, productos existentes en el maestro, cantidad>0, precioUnitario>=0.
- No se usan transacciones (el Mongo local suele ser standalone, sin replica set). En
  producción con replica set se podría envolver en una transacción para atomicidad.
- El endpoint viejo `POST /api/productos/compra` (crearRegistroCompra) sigue existiendo;
  crea solo un lote suelto sin factura. Queda superado por este circuito; se puede retirar
  en una limpieza posterior.
