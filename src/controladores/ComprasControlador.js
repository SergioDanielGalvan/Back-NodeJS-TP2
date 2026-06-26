// controladores/ComprasControlador.js
import comprasService from "../servicios/ComprasService.js";

export const registrarCompra = async (req, res) => {
  try {
    const resultado = await comprasService.registrarCompra(req.body);
    res.status(201).json({
      message: "Compra registrada",
      factura: resultado.factura,
      detalles: resultado.detalles,
      lotes: resultado.lotes,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCompras = async (req, res) => {
  try {
    const compras = await comprasService.obtenerCompras();
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompraById = async (req, res) => {
  try {
    const compra = await comprasService.obtenerCompraPorId(req.params.id);
    if (!compra) {
      return res.status(404).json({ error: "Factura de compra no encontrada" });
    }
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
