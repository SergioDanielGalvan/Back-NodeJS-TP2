// controladores/VentasControlador.js
import ventasService from "../servicios/VentasService.js";

export const registrarVenta = async (req, res) => {
  try {
    const resultado = await ventasService.registrarVenta(req.body);
    res.status(201).json({
      message: "Venta registrada",
      factura: resultado.factura,
      detalles: resultado.detalles,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getVentas = async (req, res) => {
  try {
    const ventas = await ventasService.obtenerVentas();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVentaById = async (req, res) => {
  try {
    const venta = await ventasService.obtenerVentaPorId(req.params.id);
    if (!venta) {
      return res.status(404).json({ error: "Factura de venta no encontrada" });
    }
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Emite/imprime la factura con su cabecera fiscal y el detalle de líneas.
export const emitirFactura = async (req, res) => {
  try {
    const factura = await ventasService.emitirFactura(req.params.id);
    if (!factura) {
      return res.status(404).json({ error: "Factura de venta no encontrada" });
    }
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
