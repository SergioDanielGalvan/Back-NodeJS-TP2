// controladores/RecibosControlador.js
import recibosService from "../servicios/RecibosService.js";

export const registrarRecibo = async (req, res) => {
  try {
    const resultado = await recibosService.registrarRecibo(req.body);
    res.status(201).json({
      message: "Recibo registrado",
      recibo: resultado.recibo,
      estadoFactura: resultado.estadoFactura,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRecibos = async (req, res) => {
  try {
    const recibos = await recibosService.obtenerRecibos();
    res.json(recibos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReciboById = async (req, res) => {
  try {
    const recibo = await recibosService.obtenerReciboPorId(req.params.id);
    if (!recibo) {
      return res.status(404).json({ error: "Recibo no encontrado" });
    }
    res.json(recibo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estado de cuenta de una factura de venta (total, pagado, pendiente, recibos)
export const getEstadoFactura = async (req, res) => {
  try {
    const estado = await recibosService.obtenerEstadoFactura(req.params.idFacturaVenta);
    if (!estado) {
      return res.status(404).json({ error: "Factura de venta no encontrada" });
    }
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
