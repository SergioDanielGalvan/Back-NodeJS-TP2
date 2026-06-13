// controllers/ProductosControlador.js
import MaestroProducto from "../modelos/MaestroProductos.js";
//import Producto from "../modelos/Productos.js";
//import Producto, { getSaldoLote, getSaldoProducto } from "../modelos/Productos.js";
import Producto, { getSaldoLote as getSaldoLoteModel, getSaldoProducto as getSaldoProductoModel } from "../modelos/Productos.js";

// --------------------------------------------------------------
// Obtener todos los productos (lotes) enriquecidos con datos del maestro
// --------------------------------------------------------------
export const getAllProductos = async (req, res) => {
  try {
    // Obtener todos los productos del maestro
    const productosMaestro = await MaestroProducto.obtenerTodos();
    if (!productosMaestro || productosMaestro.length === 0) {
      return res.status(404).json({ error: "Productos en Maestro no encontrados" });
    }

    // Obtener todos los lotes (productos con stock)
    const productosConStock = await Producto.obtenerTodos();
    if (!productosConStock || productosConStock.length === 0) {
      return res.status(404).json({ error: "Productos en stock no encontrados" });
    }

    // Mapa de productos maestro por idProducto para búsqueda rápida
    const mapaMaestro = new Map(productosMaestro.map(p => [p.idProducto, p]));

    // Enriquecer cada lote con los datos del maestro
    const lotesEnriquecidos = productosConStock.map(lote => {
      const maestro = mapaMaestro.get(lote.idProducto);
      return {
        ...lote,
        nombre: maestro?.nombre || "",
        categorias: maestro?.categorias || [],
        EAN: maestro?.EAN || "",
      };
    });

    res.status(200).json(lotesEnriquecidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor", details: error.message });
  }
};

// --------------------------------------------------------------
// Obtener todos los productos de una categoría (enriquecidos)
// --------------------------------------------------------------
export const getAllProductosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;

    // Buscar productos en el maestro que contengan la categoría (búsqueda flexible)
    const productosMaestro = await MaestroProducto.find({
      categorias: { $regex: categoria, $options: "i" }
    }).lean();

    if (!productosMaestro || productosMaestro.length === 0) {
      return res.status(404).json({ error: "Productos en Maestro no encontrados para esa categoría" });
    }

    const idsProducto = productosMaestro.map(p => p.idProducto);

    // Obtener los lotes que correspondan a esos idProducto
    const productosConStock = await Producto.find({ idProducto: { $in: idsProducto } }).lean();

    if (!productosConStock || productosConStock.length === 0) {
      return res.status(404).json({ error: "No hay stock para productos de esa categoría" });
    }

    // Mapa maestro por idProducto
    const mapaMaestro = new Map(productosMaestro.map(p => [p.idProducto, p]));

    const lotesEnriquecidos = productosConStock.map(lote => ({
      ...lote,
      nombre: mapaMaestro.get(lote.idProducto)?.nombre || "",
      categorias: mapaMaestro.get(lote.idProducto)?.categorias || [],
      EAN: mapaMaestro.get(lote.idProducto)?.EAN || "",
    }));

    res.status(200).json(lotesEnriquecidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Obtener un lote por su idLote (enriquecido)
// --------------------------------------------------------------
export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const productoenStock = await Producto.obtenerPorIdLote(Number(id));
    if (!productoenStock) {
      return res.status(404).json({ error: "Producto en stock no encontrado" });
    }

    const productoEnMaestro = await MaestroProducto.obtenerPorId(productoenStock.idProducto);
    if (!productoEnMaestro) {
      return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }

    // Enriquecer
    const result = {
      ...productoenStock,
      nombre: productoEnMaestro.nombre,
      categorias: productoEnMaestro.categorias,
      EAN: productoEnMaestro.EAN,
    };
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Obtener un lote por el nombre exacto del producto (primer lote que encuentre)
// --------------------------------------------------------------
export const getProductoByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const productoEnMaestro = await MaestroProducto.getProductoByNombre(nombre);
    if (!productoEnMaestro) {
      return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }

    const productoenStock = await Producto.obtenerPorIdProducto(productoEnMaestro.idProducto);
    if (!productoenStock || productoenStock.length === 0) {
      return res.status(404).json({ error: "Producto en stock no encontrado" });
    }

    // Tomamos el primer lote (o podrías devolver todos, pero la función original devuelve uno)
    const primerLote = productoenStock[0];
    primerLote.nombre = productoEnMaestro.nombre;
    primerLote.categorias = productoEnMaestro.categorias;
    primerLote.EAN = productoEnMaestro.EAN;

    res.status(200).json(primerLote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Obtener todos los lotes que coincidan con un nombre (búsqueda flexible)
// --------------------------------------------------------------
export const getAllProductosByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    console.log("Buscando productos por nombre:", nombre);

    // Buscar productos en maestro por nombre (coincidencia parcial)
    const productosMaestro = await MaestroProducto.find({
      nombre: { $regex: nombre, $options: "i" }
    }).lean();

    if (!productosMaestro || productosMaestro.length === 0) {
      return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }

    const idsProducto = productosMaestro.map(p => p.idProducto);
    const lotes = await Producto.find({ idProducto: { $in: idsProducto } }).lean();

    if (!lotes || lotes.length === 0) {
      return res.status(404).json({ error: "Producto en stock no encontrado" });
    }

    // Mapa maestro
    const mapaMaestro = new Map(productosMaestro.map(p => [p.idProducto, p]));

    const lotesEnriquecidos = lotes.map(lote => ({
      ...lote,
      nombre: mapaMaestro.get(lote.idProducto)?.nombre || "",
      categorias: mapaMaestro.get(lote.idProducto)?.categorias || [],
      EAN: mapaMaestro.get(lote.idProducto)?.EAN || "",
    }));

    res.status(200).json(lotesEnriquecidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Obtener el saldo de un lote (producto en inventario)
// --------------------------------------------------------------
export const getSaldoLote = async (req, res) => {
  try {
    const { idLote } = req.params;
    const saldo = await getSaldoLoteModel( idLote );
    res.status(200).json(saldo);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Obtener el saldo de un Producto (producto en inventario)
// --------------------------------------------------------------
export const getSaldoProducto = async (req, res) => {
  try {
    const { idProducto } = req.params;
    const saldo = await getSaldoProductoModel( idProducto );
    res.status(200).json(saldo);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Crear un nuevo lote (producto en inventario)
// --------------------------------------------------------------
export const createProducto = async (req, res) => {
  try {
    const { nombre, precio, categorias, stock } = req.body;

    // Validaciones
    if (!nombre || typeof nombre !== "string") {
      throw new Error("Nombre es requerido y debe ser una cadena de texto");
    }
    if (!precio || typeof precio !== "number" || precio < 0) {
      throw new Error("Precio es requerido y debe ser un número positivo");
    }
    if (!Array.isArray(categorias) || categorias.some(cat => typeof cat !== "string")) {
      throw new Error("Categorías debe ser un array de cadenas de texto");
    }
    if (stock === undefined || typeof stock !== "number" || stock < 0) {
      throw new Error("Stock es requerido y debe ser un número positivo");
    }

    // Verificar que el producto exista en el maestro por nombre
    const productoMaestro = await MaestroProducto.findOne({ nombre });
    if (!productoMaestro) {
      throw new Error("El producto no existe en el maestro");
    }

    const idProducto = productoMaestro.idProducto;

    // Crear el lote (el método `crearProducto` usará el auto-increment de idLote)
    const nuevoLote = await Producto.crearProducto({
      idProducto,
      precio,
      stock,
    });

    res.status(201).json(nuevoLote);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// --------------------------------------------------------------
// Eliminar un lote por su idLote
// --------------------------------------------------------------
export const deleteProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.eliminarPorIdLote(Number(id));
    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Actualizar el stock de un lote
// --------------------------------------------------------------
export const updateProductoWithStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const productoActualizado = await Producto.actualizarStock(Number(id), stock);
    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Actualizar el precio de un lote
// --------------------------------------------------------------
export const updateProductoWithPrecio = async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;
    const productoActualizado = await Producto.actualizarPrecio(Number(id), precio);
    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// --------------------------------------------------------------
// Registrar una compra (crea un nuevo lote)
// --------------------------------------------------------------
export const crearRegistroCompra = async (req, res) => {
  try {
    const { idProducto, precioCompra, cantidad, fechaVencimiento } = req.body;

    if (!idProducto || !precioCompra || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios para la compra" });
    }

    const nuevoLote = await Producto.crearProducto({
      idProducto: Number(idProducto),
      precio: precioCompra,
      stock: cantidad,
      FechaVencimiento: fechaVencimiento || "2027-01-01",
    });

    res.status(201).json({
      message: "Compra registrada y lote creado con éxito",
      lote: nuevoLote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la compra" });
  }
};