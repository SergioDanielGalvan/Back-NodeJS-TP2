import fs from "fs/promises";
import path from "path";

// let products = [];

const __dirname = import.meta.dirname;

export const getAllProductos = async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const dataMaestro = await fs.readFile(
      path.join(__dirname, "../data/MaestroProductos.json"),
      "utf-8",
    );
    const productosMaestro = JSON.parse(dataMaestro);
    productos.forEach((producto) => {
      const productoMaestro = productosMaestro.find(
        (item) => item.idProducto === producto.idProducto,
      );
      if (productoMaestro) {
        producto.nombre = productoMaestro.nombre;
        producto.categorias = productoMaestro.categorias;
        producto.EAN = productoMaestro.EAN;
      }
    });
    return productos;
  } catch (error) {
    console.error("Error al obtener todos los productos", error);
    throw error;
  } finally {
  }
};

export const getProductoById = async (id) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );

    const productos = JSON.parse(data);

    const producto = products.find((item) => item.id == id);

    return producto;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

export const getProductoByNombre = async (nombre) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );

    const productos = JSON.parse(data);

    const producto = products.find((item) => item.nombre == nombre);

    return producto;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

export const createProducto = async (nombre, precio, categorias, stock) => {
  // Checks para validar los datos de entrada
  if (!nombre || typeof nombre !== "string") {
    throw new Error("Nombre es requerido y debe ser una cadena de texto");
  }
  if (!precio || typeof precio !== "number" || precio < 0) {
    throw new Error("Precio es requerido y debe ser un número positivo");
  }
  if (
    !Array.isArray(categorias) ||
    categorias.some((cat) => typeof cat !== "string")
  ) {
    throw new Error("Categorías debe ser un array de cadenas de texto");
  }
  if (stock === undefined || typeof stock !== "number" || stock < 0) {
    throw new Error("Stock es requerido y debe ser un número positivo");
  }

  // Verifico contra el maestro que el producto exista ya por nombre
  const data = await fs.readFile(
    path.join(__dirname, "../data/MaestroProductos.json"),
    "utf-8",
  );
  const MaestroProductos = JSON.parse(data);
  const productoMaestro = MaestroProductos.find(
    (item) => item.nombre === nombre,
  );
  if (!productoMaestro) {
    throw new Error("El producto no existe en el maestro");
  }
  const idProducto = productoMaestro.id;

  // Busco un id único para el nuevo producto
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const ids = productos.map((producto) => producto.id);
    const maxId = Math.max(...ids);
    const newId = maxId + 1;
  } catch (error) {
    console.error(error);
  } finally {
    newId = newId ? newId : 1; // Si no hay productos, el primer ID será 1
  }

  const product = {
    id: newId,
    idProducto: idProducto,
    precio: precio,
    stock: stock,
  };

  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);

    productos.push(producto); // Agrego el nuevo producto al array

    await fs.writeFile(
      path.join(__dirname, "../data/Productos.json"),
      JSON.stringify(productos, null, 2), // Guardo el array actualizado en el archivo
      "utf-8",
    );

    return product;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

export const deleteProductoById = async (id) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const index = productos.findIndex((producto) => producto.id === id);
    if (index === -1) {
      throw new Error("Producto no encontrado");
    }
    productos.splice(index, 1); // Elimino el producto del array
    await fs.writeFile(
      path.join(__dirname, "../data/Productos.json"),
      JSON.stringify(productos, null, 2), // Guardo el array actualizado en el archivo
      "utf-8",
    );
    return true;
  } catch (error) {
    console.error("Error al eliminar producto", error);
    throw error;
  } finally {
  }
};

export const getAllProductosWithStock = async (req, res) => {
  try {
    const dataStock = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productosStock = JSON.parse(dataStock);
    const productosConStock = productosStock.filter(
      (producto) => producto.stock > 0,
    );
    const dataMaestro = await fs.readFile(
      path.join(__dirname, "../data/MaestroProductos.json"),
      "utf-8",
    );
    const productosMaestro = JSON.parse(dataMaestro);
    productosConStock.forEach((producto) => {
      const productoMaestro = productosMaestro.find(
        (item) => item.id === producto.idProducto,
      );
      if (productoMaestro) {
        producto.nombre = productoMaestro.nombre;
        producto.categorias = productoMaestro.categorias;
        producto.EAN = productoMaestro.EAN;
      }
    });
    return productosConStock;
  } catch (error) {
    console.error("Error al obtener productos con stock", error);
    throw error;
  } finally {
  }
};

export const updateProductoWithStock = async (id, nuevoStock) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const index = productos.findIndex((producto) => producto.id === id);
    if (index === -1) {
      throw new Error("Producto no encontrado");
    }
    productos[index].stock = nuevoStock; // Actualizo el stock del producto
    await fs.writeFile(
      path.join(__dirname, "../data/Productos.json"),
      JSON.stringify(productos, null, 2), // Guardo el array actualizado en el archivo
      "utf-8",
    );
    return productos[index];
  } catch (error) {
    console.error("Error al actualizar stock del producto", error);
    throw error;
  } finally {
  }
};

export const updateProductoWithPrecio = async (id, nuevoPrecio) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const index = productos.findIndex((producto) => producto.id === id);
    if (index === -1) {
      throw new Error("Producto no encontrado");
    }
    productos[index].precio = nuevoPrecio; // Actualizo el precio del producto
    await fs.writeFile(
      path.join(__dirname, "../data/Productos.json"),
      JSON.stringify(productos, null, 2), // Guardo el array actualizado en el archivo
      "utf-8",
    );
    return productos[index];
  } catch (error) {
    console.error("Error al actualizar precio del producto", error);
    throw error;
  } finally {
  }
};

export const getAllProductosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.query;
    const data = await fs.readFile(
      path.join(__dirname, "../data/Productos.json"),
      "utf-8",
    );
    const productos = JSON.parse(data);
    const productosFiltrados = productos.filter((producto) =>
      producto.categorias.includes(categoria),
    );
    const dataMaestro = await fs.readFile(
      path.join(__dirname, "../data/MaestroProductos.json"),
      "utf-8",
    );
    const productosMaestro = JSON.parse(dataMaestro);
    productosFiltrados.forEach((producto) => {
      const productoMaestro = productosMaestro.find(
        (item) => item.id === producto.idProducto,
      );
      if (productoMaestro) {
        producto.nombre = productoMaestro.nombre;
        producto.categorias = productoMaestro.categorias;
        producto.EAN = productoMaestro.EAN;
      }
    });
    return productosFiltrados;
  } catch (error) {
    console.error("Error al obtener productos por categoría", error);
    throw error;
  } finally {
  }
};

export const registrarCompraLote = async (dataCompra) => {
  try {
    const productos = await leerArchivo(); // Usamos la función de lectura que ya tenemos

    // 1. Generar nuevo idLote
    const ids = productos.map((p) => p.idLote || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nuevoIdLote = maxId + 1;

    // 2. Armar el nuevo objeto Lote
    const nuevoLote = {
      idLote: nuevoIdLote,
      idProducto: dataCompra.idProducto,
      precio: dataCompra.precioCompra, // El precio al que compramos
      stock: dataCompra.cantidad,
      FechaVencimiento: dataCompra.fechaVencimiento || "2027-01-01",
    };

    // 3. Guardar en el JSON
    productos.push(nuevoLote);
    await fs.writeFile(
      path.join(__dirname, "../data/Productos.json"),
      JSON.stringify(productos, null, 2),
      "utf-8",
    );

    return nuevoLote;
  } catch (error) {
    console.error("Error al registrar compra:", error);
    throw error;
  }
};
