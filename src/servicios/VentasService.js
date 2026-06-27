// servicios/VentasService.js
import Cliente from "../modelos/Cliente.js";
import MaestroProducto from "../modelos/MaestroProductos.js";
import FacturaVenta from "../modelos/FacturaVenta.js";
import DetalleVenta from "../modelos/DetalleVenta.js";
import { getListaLotesDisponibles } from "../modelos/Productos.js";

const ALICUOTA_IVA = 0.21;

async function proximoId(Modelo, campo) {
  const ultimo = await Modelo.findOne().sort(`-${campo}`).select(campo).lean();
  return (ultimo?.[campo] || 0) + 1;
}

class VentasService {
  // Registra una venta: valida stock por FEFO, crea la FacturaVenta y los
  // DetalleVenta (uno por lote consumido). El saldo es dinámico, así que
  // insertar los DetalleVenta ES la descarga de stock.
  async registrarVenta(datos) {
    const {
      idCliente,
      tipoComprobante,
      letraComprobante,
      nroFactura,
      fecha,
      operador,
      items,
    } = datos;

    if (!idCliente) throw new Error("idCliente requerido");
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La venta debe tener al menos un item");
    }

    const cliente = await Cliente.obtenerPorId(idCliente);
    if (!cliente) throw new Error(`El cliente ${idCliente} no existe`);

    const fechaVenta = fecha ? new Date(fecha) : new Date();

    // Agrupar cantidades por producto (por si un producto viene repetido)
    const pedidoPorProducto = new Map();
    for (const it of items) {
      if (!it.idProducto) throw new Error("Cada item necesita idProducto");
      if (!(it.cantidad > 0)) {
        throw new Error(`Cantidad inválida para el producto ${it.idProducto}`);
      }
      pedidoPorProducto.set(
        it.idProducto,
        (pedidoPorProducto.get(it.idProducto) || 0) + it.cantidad
      );
    }

    // Asignación FEFO -> líneas de detalle (en memoria, antes de insertar nada)
    const lineas = [];
    for (const [idProducto, cantidadPedida] of pedidoPorProducto) {
      const lotes = await getListaLotesDisponibles(idProducto, fechaVenta);
      const saldoTotal = lotes.reduce((acc, l) => acc + l.saldo, 0);
      if (saldoTotal < cantidadPedida) {
        throw new Error(
          `Stock insuficiente para el producto ${idProducto}: disponible ${saldoTotal}, pedido ${cantidadPedida}`
        );
      }

      let restante = cantidadPedida;
      for (const lote of lotes) {
        // lotes ya vienen ordenados FEFO (vence antes -> sale primero)
        if (restante <= 0) break;
        const tomar = Math.min(lote.saldo, restante);
        if (tomar <= 0) continue;
        lineas.push({
          idProducto,
          idLote: lote.idLote,
          cantidad: tomar,
          precioUnitario: lote.precioVenta,
          montoTotal: tomar * lote.precioVenta,
        });
        restante -= tomar;
      }
    }

    const montoTotal = lineas.reduce((acc, l) => acc + l.montoTotal, 0);

    // 1) Cabecera
    const idFacturaVenta = await proximoId(FacturaVenta, "idFacturaVenta");
    const factura = await FacturaVenta.create({
      idFacturaVenta,
      idCliente,
      tipoComprobante: tipoComprobante || "FAC",
      letraComprobante: letraComprobante || "B",
      nroFactura: nroFactura || `0001-${String(idFacturaVenta).padStart(8, "0")}`,
      fechaFactura: fechaVenta,
      fecha: fechaVenta,
      montoTotal,
      fechaAlta: new Date(),
      operador: operador || "sistema",
    });

    // 2) Detalles
    let idDetalle = await proximoId(DetalleVenta, "idDetalleVenta");
    const detalles = [];
    for (const l of lineas) {
      const detalle = await DetalleVenta.create({
        idDetalleVenta: idDetalle,
        idFacturaVenta,
        idProducto: l.idProducto,
        idLote: l.idLote,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        montoTotal: l.montoTotal,
        fechaAlta: new Date(),
        operador: operador || "sistema",
      });
      detalles.push(detalle);
      idDetalle++;
    }

    return { factura, detalles };
  }

  async obtenerVentas() {
    return FacturaVenta.find().sort({ idFacturaVenta: 1 }).lean();
  }

  // Una factura de venta con sus detalles.
  async obtenerVentaPorId(id) {
    const idFacturaVenta = Number(id);
    const factura = await FacturaVenta.findOne({ idFacturaVenta }).lean();
    if (!factura) return null;
    const detalles = await DetalleVenta.find({ idFacturaVenta }).lean();
    return { ...factura, detalles };
  }

  // Emite/imprime una factura: cabecera fiscal + líneas con nombre de producto.
  async emitirFactura(id) {
    const idFacturaVenta = Number(id);
    const factura = await FacturaVenta.findOne({ idFacturaVenta }).lean();
    if (!factura) return null;

    const cliente = await Cliente.obtenerPorId(factura.idCliente);
    const detalles = await DetalleVenta.find({ idFacturaVenta }).lean();

    // Nombre de producto desde el maestro (una sola consulta)
    const idsProducto = [...new Set(detalles.map((d) => d.idProducto))];
    const maestros = await MaestroProducto.find({
      idProducto: { $in: idsProducto },
    })
      .select("idProducto nombre")
      .lean();
    const nombrePorProducto = {};
    for (const m of maestros) nombrePorProducto[m.idProducto] = m.nombre;

    const montoTotal = factura.montoTotal;
    const iva = Math.round(montoTotal * ALICUOTA_IVA * 100) / 100;

    return {
      nroFactura: factura.nroFactura,
      cliente: {
        cuit: cliente?.nroCUIT ?? null,
        nombre: cliente?.nombre ?? null,
      },
      fechaFactura: factura.fechaFactura,
      letraComprobante: factura.letraComprobante,
      tipoComprobante: factura.tipoComprobante,
      iva,
      montoTotal,
      detalles: detalles.map((d) => ({
        nombreProducto: nombrePorProducto[d.idProducto] ?? null,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        precioTotal: d.montoTotal,
      })),
    };
  }
}

export default new VentasService();
