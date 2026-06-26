// servicios/ComprasService.js
import Proveedor from "../modelos/Proveedor.js";
import MaestroProducto from "../modelos/MaestroProductos.js";
import FacturaCompra from "../modelos/FacturaCompra.js";
import DetalleCompra from "../modelos/DetalleCompra.js";
import Producto from "../modelos/Productos.js";

// Próximo valor de un campo numérico autoincremental.
async function proximoId(Modelo, campo) {
  const ultimo = await Modelo.findOne().sort(`-${campo}`).select(campo).lean();
  return (ultimo?.[campo] || 0) + 1;
}

class ComprasService {
  // Registra una compra completa: cabecera (FacturaCompra) + N DetalleCompra,
  // y por cada detalle ingresa un lote (Producto) a stock.
  async registrarCompra(datos) {
    const { idProveedor, nroFactura, fechaFactura, operador, items } = datos;

    // Validaciones básicas
    if (!idProveedor) throw new Error("idProveedor requerido");
    if (!nroFactura) throw new Error("nroFactura requerido");
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La compra debe tener al menos un item");
    }

    const proveedor = await Proveedor.obtenerPorId(idProveedor);
    if (!proveedor) throw new Error(`El proveedor ${idProveedor} no existe`);

    // Validar items y armar líneas con su total
    const lineas = [];
    for (const it of items) {
      if (!it.idProducto) throw new Error("Cada item necesita idProducto");
      if (!(it.cantidad > 0)) {
        throw new Error(`Cantidad inválida para el producto ${it.idProducto}`);
      }
      if (!(it.precioUnitario >= 0)) {
        throw new Error(`precioUnitario inválido para el producto ${it.idProducto}`);
      }

      const maestro = await MaestroProducto.findOne({ idProducto: it.idProducto }).lean();
      if (!maestro) {
        throw new Error(`El producto ${it.idProducto} no existe en el maestro`);
      }

      lineas.push({
        idProducto: it.idProducto,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        unidadmedida: it.unidadmedida || "",
        fechaVencimiento: it.fechaVencimiento || "2027-01-01",
        total: it.cantidad * it.precioUnitario,
      });
    }

    const montoTotal = lineas.reduce((acc, l) => acc + l.total, 0);
    const fecha = fechaFactura ? new Date(fechaFactura) : new Date();

    // 1) Cabecera
    const idFacturaCompra = await proximoId(FacturaCompra, "idFacturaCompra");
    const factura = await FacturaCompra.create({
      idFacturaCompra,
      idProveedor,
      nroFactura,
      fechaFactura: fecha,
      montoTotal,
      fechaAlta: new Date(),
      operador: operador || "sistema",
    });

    // 2) Detalles + lotes (secuencial para respetar los autoincrementos)
    let idDetalle = await proximoId(DetalleCompra, "idDetalleCompra");
    const detalles = [];
    const lotes = [];

    for (const l of lineas) {
      const detalle = await DetalleCompra.create({
        idDetalleCompra: idDetalle,
        idFacturaCompra,
        idProducto: l.idProducto,
        cantidad: l.cantidad,
        unidadmedida: l.unidadmedida,
        fechaIngresoStock: fecha,
        total: l.total,
      });

      // Cada detalle ingresa un lote a stock (idLote autoincremental en Producto)
      const lote = await Producto.create({
        idProducto: l.idProducto,
        idFacturaCompra,
        idDetalleCompra: idDetalle,
        precio: l.precioUnitario,
        stock: l.cantidad,
        fechaIngresoStock: fecha,
        FechaVencimiento: l.fechaVencimiento,
      });

      detalles.push(detalle);
      lotes.push(lote);
      idDetalle++;
    }

    return { factura, detalles, lotes };
  }

  async obtenerCompras() {
    return FacturaCompra.find().sort({ idFacturaCompra: 1 }).lean();
  }

  // Una factura de compra con sus detalles.
  async obtenerCompraPorId(id) {
    const idFacturaCompra = Number(id);
    const factura = await FacturaCompra.findOne({ idFacturaCompra }).lean();
    if (!factura) return null;
    const detalles = await DetalleCompra.find({ idFacturaCompra }).lean();
    return { ...factura, detalles };
  }
}

export default new ComprasService();
