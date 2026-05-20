import fs from "fs/promises";
import path from "path";

const __dirname = import.meta.dirname;
const filePath = path.join(__dirname , "MaestroProductos.json");

// Definiciones viejas

const obtenerTodos = async () => {
  return await leerArchivo();
};

const obtenerPorId = async (id) => {
  const productos = await leerArchivo();
  return productos.find((p) => String(p.idProducto) === String(id));
};

const guardar = async (producto) => {
  const productos = await leerArchivo();

  productos.push(producto);

  await escribirArchivo(productos);

  return producto;
};

const actualizar = async (id, productoActualizado) => {
  const productos = await leerArchivo();

  const index = productos.findIndex((p) => String(p.idProducto) === String(id));

  if (index === -1) return null;

  productos[index] = {
    ...productos[index],
    ...productoActualizado,
  };

  await escribirArchivo(productos);

  return productos[index];
};

const eliminar = async (id) => {
  const productos = await leerArchivo();

  const index = productos.findIndex((p) => String(p.idProducto) === String(id));

  if (index === -1) return null;

  productos.splice(index, 1);

  await escribirArchivo(productos);

  return true;
};

// Definiciones Nuevas

const getAllProductos = async (categoria) => {
  try {
    const productos = await leerArchivo(); // ya lee MaestroProductos.json
    if (categoria) {
      return productos.filter(
        (p) =>
          p.categorias &&
          p.categorias.some((cat) =>
            cat.toLowerCase().includes(categoria.toLowerCase()),
          ),
      );
    }
    return productos;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

const getProductoById = async (id) => {
  const productos = await leerArchivo();
  return productos.find((p) => String(p.idProducto) === String(id));
};

const getProductoByNombre = async (nombre) => {
  const productos = await leerArchivo();
  //return productos.find((p) => p.nombre === nombre);
  return productos.find((p) => p.nombre.includes(nombre));
};

const createProducto = async (producto) => {
  const productos = await leerArchivo();
  const newId =
    productos.length > 0
      ? Math.max(...productos.map((p) => p.idProducto)) + 1
      : 1;
  const nuevoProducto = {
    ...producto, // Copia las propiedades del producto recibido, deconstruyo
    idProducto: newId,
    fechaAlta: new Date().toISOString(),
    operador: datos.operador || "sistema",
  };
  productos.push(nuevoProducto);
  await escribirArchivo(productos);
  return nuevoProducto;
};

const leerArchivo = async () => {
  //const data = await fs.readFile(filePath, "utf-8");
  const data = await fs.readFile( path.join( filePath, "../../data/MaestroProductos.json"), "utf-8");
  return JSON.parse(data);
};

const escribirArchivo = async (data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

function filtrarPorCategoria(productos, categoriaBuscada) {
  return productos.filter(producto =>
    producto.categorias.some(cat => cat.toLowerCase() === categoriaBuscada.toLowerCase())
  );
}
function filtrarPorMultiplesCategoriasOR(productos, categoriasBuscadas) {
  // categoriasBuscadas es un array, ej: ["Tecnología", "Audio"]
  return productos.filter(producto =>
    categoriasBuscadas.some(catBuscada =>
      producto.categorias.some(catProd => catProd.toLowerCase() === catBuscada.toLowerCase())
    )
  );
}

function filtrarPorMultiplesCategoriasAND(productos, categoriasRequeridas) {
  return productos.filter(producto =>
    categoriasRequeridas.every(catRequerida =>
      producto.categorias.some(catProd => catProd.toLowerCase() === catRequerida.toLowerCase())
    )
  );
}

export default {
  obtenerTodos,
  obtenerPorId,
  guardar,
  actualizar,
  eliminar,
  getAllProductos,
  getProductoById,
  getProductoByNombre,
  createProducto,
};