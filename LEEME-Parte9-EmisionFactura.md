# Parte 9 — Endpoint de Emisión de Factura de Venta

## Archivos (reemplazar)
- `src/servicios/VentasService.js`     (método emitirFactura)
- `src/controladores/VentasControlador.js` (emitirFactura)
- `src/rutas/VentasRouter.js`          (GET /:id/factura)

Sin dependencias nuevas ni re-seed.

## Endpoint
GET /api/ventas/:id/factura   (público, es lectura)

Junta FacturaVenta + Cliente (CUIT/Nombre) + DetalleVenta + nombre del producto (MaestroProducto).
IVA se calcula como montoTotal * 0,21.

## Salida (ejemplo: GET /api/ventas/1/factura)
{
  "nroFactura": "0002-00000123",
  "cliente": { "cuit": "20-12345678-9", "nombre": "Cliente A" },
  "fechaFactura": "2026-03-10T00:00:00.000Z",
  "letraComprobante": "A",
  "tipoComprobante": "F",
  "iva": 25200,
  "montoTotal": 120000,
  "detalles": [
    { "nombreProducto": "Lavandina Ayudín Original 4 Litros", "cantidad": 10, "precioUnitario": 3750, "precioTotal": 37500 },
    { "nombreProducto": "Lavandina Ayudín Original 2 Litros", "cantidad": 5,  "precioUnitario": 1860, "precioTotal": 9300 },
    { "nombreProducto": "Detergente Concentrado Limón Ala 500ml", "cantidad": 20, "precioUnitario": 3660, "precioTotal": 73200 }
  ]
}

Campos solicitados:
- Cabecera: Nº Factura, CUIT y Nombre Cliente, Fecha, LetraComprobante, TipoComprobante, IVA, Monto Total
- Líneas (n): Nombre Producto, Cantidad, PrecioUnitario, PrecioTotal
