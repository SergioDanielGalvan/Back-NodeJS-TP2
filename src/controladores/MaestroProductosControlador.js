import maestroService from "../servicios/MaestroProductosService.js";

// GET /maestroproductos
export const getAllProductos = async (req, res) => {
  try {
    const productos = await maestroService.obtenerCatalogo();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /maestroproductos/:id
export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await maestroService.obtenerProductoCatalogo(id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /maestroproductos/nombre/:nombre
export const getProductoByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;

    const producto = await maestroService.buscarPorNombre(nombre);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /maestroproductos/categoria/:categoria
export const getAllProductosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;

    const productos = await maestroService.buscarPorCategoria(categoria);

    if (!productos) {
      return res.status(404).json({ error: "Productos no encontrados" });
    }

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /maestroproductos/ean/:ean
export const getProductoByEAN = async (req, res) => {
  try {
    const { ean } = req.params;

    const producto = await maestroService.buscarPorEAN(ean);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /maestroproductos
export const createProducto = async (req, res) => {
  try {
    const nuevoProducto = await maestroService.crearProductoCatalogo(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /maestroproductos/:id
export const updateProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const productoActualizado = await maestroService.editarProductoCatalogo(
      id,
      req.body,
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /maestroproductos/:id
export const deleteProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await maestroService.eliminarProductoCatalogo(id);

    if (!eliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
