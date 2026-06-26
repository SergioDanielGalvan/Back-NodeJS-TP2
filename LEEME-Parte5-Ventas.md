# Parte 5 — Circuito de Ventas (con descarga FEFO)

## Archivos
Nuevos:
- `src/servicios/VentasService.js`
- `src/controladores/VentasControlador.js`
- `src/rutas/VentasRouter.js`
Modificado:
- `app.js`  (monta el router en `/api/ventas`)

## Qué hace
Registrar una venta:
1. Valida cliente e items.
2. Por cada producto toma stock por **FEFO** (First Expired, First Out): usa los lotes
   ordenados por FechaVencimiento y va consumiendo saldo lote por lote.
3. Si no hay saldo suficiente -> error "Stock insuficiente...".
4. Crea 1 `FacturaVenta` + N `DetalleVenta` (una línea por lote consumido).
5. La descarga de stock es **implícita**: el saldo es dinámico, así que insertar los
   DetalleVenta ya descuenta el stock disponible.

precioUnitario = precioventa del catálogo (MaestroProducto).
montoTotal factura = suma de los montoTotal de cada detalle.

## Endpoints
- POST   /api/ventas        -> registrar una venta
- GET    /api/ventas        -> listar facturas de venta
- GET    /api/ventas/:id    -> una factura con sus detalles

## Ejemplo
POST /api/ventas
{
  "idCliente": 1,
  "items": [ { "idProducto": 1, "cantidad": 60 } ]
}

Esperado con los datos sembrados:
- idFacturaVenta = 4 (había 3)
- 2 detalles (idDetalleVenta 9 y 10), porque el pedido se reparte por FEFO:
    - lote 1  (vence 2026-12-31): 40 u  -> montoTotal 152000
    - lote 10 (vence 2027-01-10): 20 u  -> montoTotal  76000
- factura.montoTotal = 228000  (60 u × $3800)
- GET /api/productos/saldo/producto/1  pasa de 340 a 280

Probar el control de stock:
- Pedir más de lo disponible (ej. producto 1 × 9999) -> 400 "Stock insuficiente..."

## Pendiente / limpieza menor
- `FacturaVenta.getNuevoNroFactura()` está roto (lee un JSON inexistente) y no se usa;
  el servicio genera el nroFactura. Se puede borrar junto con los imports fs muertos
  de FacturaVenta.js y DetalleVenta.js.
- `Venta.js` quedó totalmente superado por este circuito (sigue inerte). Se puede borrar.
