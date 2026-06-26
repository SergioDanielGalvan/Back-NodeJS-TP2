// servicios/RecibosService.js
import Recibo from "../modelos/Recibos.js";
import FacturaVenta from "../modelos/FacturaVenta.js";

async function proximoId(Modelo, campo) {
  const ultimo = await Modelo.findOne().sort(`-${campo}`).select(campo).lean();
  return (ultimo?.[campo] || 0) + 1;
}

class RecibosService {
  // Registra un recibo contra una FacturaVenta. Regla de negocio:
  // la suma de recibos de una factura no puede exceder su montoTotal.
  async registrarRecibo(datos) {
    const {
      idFacturaVenta,
      monto,
      medioDePago,
      fechaRecibo,
      fechaAcreditacion,
      nroRecibo,
      operador,
    } = datos;

    if (!idFacturaVenta) throw new Error("idFacturaVenta requerido");
    if (!(monto > 0)) throw new Error("El monto debe ser mayor a 0");

    const factura = await FacturaVenta.findOne({
      idFacturaVenta: Number(idFacturaVenta),
    }).lean();
    if (!factura) {
      throw new Error(`La factura de venta ${idFacturaVenta} no existe`);
    }

    const pagado = await Recibo.totalPagadoFactura(idFacturaVenta);
    const pendiente = factura.montoTotal - pagado;

    if (monto > pendiente) {
      throw new Error(
        `El monto (${monto}) excede el saldo pendiente de la factura (${pendiente})`
      );
    }

    const idRecibo = await proximoId(Recibo, "idRecibo");
    const recibo = await Recibo.create({
      idRecibo,
      idFacturaVenta: Number(idFacturaVenta),
      idCliente: factura.idCliente,
      nroRecibo: nroRecibo || `R${String(idRecibo).padStart(3, "0")}`,
      monto,
      medioDePago: medioDePago || "Efectivo",
      fechaRecibo: fechaRecibo ? new Date(fechaRecibo) : new Date(),
      fechaAcreditacion: fechaAcreditacion ? new Date(fechaAcreditacion) : null,
      fechaAlta: new Date(),
      operador: operador || "sistema",
    });

    const nuevoPagado = pagado + monto;
    const nuevoPendiente = factura.montoTotal - nuevoPagado;

    return {
      recibo,
      estadoFactura: {
        idFacturaVenta: Number(idFacturaVenta),
        montoTotal: factura.montoTotal,
        pagado: nuevoPagado,
        pendiente: nuevoPendiente,
        cancelada: nuevoPendiente === 0,
      },
    };
  }

  async obtenerRecibos() {
    return Recibo.obtenerTodos();
  }

  async obtenerReciboPorId(id) {
    return Recibo.obtenerPorId(id);
  }

  // Estado de cuenta de una factura: total, pagado, pendiente y sus recibos.
  async obtenerEstadoFactura(idFacturaVenta) {
    const factura = await FacturaVenta.findOne({
      idFacturaVenta: Number(idFacturaVenta),
    }).lean();
    if (!factura) return null;

    const recibos = await Recibo.obtenerPorFactura(idFacturaVenta);
    const pagado = recibos.reduce((acc, r) => acc + (r.monto || 0), 0);
    const pendiente = factura.montoTotal - pagado;

    return {
      idFacturaVenta: Number(idFacturaVenta),
      idCliente: factura.idCliente,
      montoTotal: factura.montoTotal,
      pagado,
      pendiente,
      cancelada: pendiente === 0,
      recibos,
    };
  }
}

export default new RecibosService();
