import * as modelProductos from "../modelos/Productos.js";
//import * as modelMaestro from "../modelos/MaestroProductos.js";
import modelMaestro from "../modelos/MaestroProductos.js";

export const getAllProductos = async ( req, res ) => {
    try {
        const productosMaestro = await modelMaestro.getAllProductos( '' );
        //const productosMaestro = await modelMaestro.obtenerTodos();
        if ( !productosMaestro ) {
            return res.status(404).json({ error: "Productos en Maestro no encontrados" });
        }
        // Datos de stock para cada producto
        const productosConStock = await modelProductos.getAllProductos( '', false );
        if ( !productosConStock ) {
            return res.status(404).json({ error: "Productos en stock no encontrados" });
        }
        productosConStock.forEach( producto => {
            const productoMaestro = productosMaestro.find(item => item.idProducto === producto.idProducto);
            if ( productoMaestro ) {
                producto.nombre = productoMaestro.nombre;
                producto.categorias = productoMaestro.categorias;
                producto.EAN = productoMaestro.EAN;
            }
        } );
        res.status(200).json( productosConStock );
    }    
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor", details: error.message });
    }
    finally {
    }
};

export const getAllProductosByCategoria = async ( req, res ) => {
    try {
        const { categoria } = req.params;
        const productosMaestro = await modelMaestro.getAllProducts( categoria, false );
        if ( !productosMaestro ) {
            return res.status(404).json({ error: "Productos en Maestro no encontrados" });
        }
        // Datos de stock para cada producto
        const productosConStock = await modelProductos.getAllProductos( categoria, false );
        if ( !productosConStock ) {
            return res.status(404).json({ error: "Productos en stock no encontrados" });
        }
        productosConStock.forEach( producto => {
            const productoMaestro = productosMaestro.find( item => item.id === producto.id );
            if ( productoMaestro ) {
                producto.nombre = productoMaestro.nombre;
                producto.categorias = productoMaestro.categorias;
                producto.EAN = productoMaestro.EAN;
            }
        } );
        res.status(200).json( productosConStock );
    } catch ( error ) {
      res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }
};

export const getProductoById = async ( req, res ) => {
  try {
    const { id } = req.params;
    const productoenStock = await modelProductos.getProductoById( id );
    if ( !productoenStock ) {
        return res.status(404).json({ error: "Producto en stock no encontrado" });
    }

    const productoEnMaestro = await modelMaestro.getProductoById( id );
    if ( !productoEnMaestro ) {
        return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }
    productoenStock.nombre = productoEnMaestro.nombre;
    productoenStock.categorias = productoEnMaestro.categorias;
    productoenStock.EAN = productoEnMaestro.EAN;
    res.status(200).json( productoenStock );
  }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {

    }
};

export const getProductoByNombre = async ( req, res ) => {
  try {
    const { nombre } = req.params;
    const productoEnMaestro = await modelMaestro.getProductoByNombre( nombre );
    if ( !productoEnMaestro ) {
        return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }
    const productoenStock = await modelProductos.getProductoByIdProducto( productoEnMaestro.idProducto );
    if ( !productoenStock ) {
        return res.status(404).json({ error: "Producto en stock no encontrado" });
    }
    productoenStock.nombre = productoEnMaestro.nombre;
    productoenStock.categorias = productoEnMaestro.categorias;
    productoenStock.EAN = productoEnMaestro.EAN;
    res.status(200).json( productoenStock );
  }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }   
};

export const getAllProductosByNombre = async ( req, res ) => {
  try {
    const { nombre } = req.params;
    console.log("Buscando productos por nombre:", nombre);
    const productoEnMaestro = await modelMaestro.getProductoByNombre( nombre );
    if ( !productoEnMaestro ) {
        return res.status(404).json({ error: "Producto en Maestro no encontrado" });
    }
    const productoenStock = await modelProductos.getProductoByIdProducto( productoEnMaestro.idProducto );
    if ( !productoenStock ) {
        return res.status(404).json({ error: "Producto en stock no encontrado" });
    }
    productoenStock.nombre = productoEnMaestro.nombre;
    productoenStock.categorias = productoEnMaestro.categorias;
    productoenStock.EAN = productoEnMaestro.EAN;
    res.status(200).json( productoenStock );
  }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }   
};


export const createProducto = async ( req, res ) => {
  try {
    const { nombre, precio, categorias, stock } = req.body;
    const producto = await modelProductos.createProducto( nombre, precio, categorias, stock );
    res.status(201).json( producto );
  } catch ( error ) {
    res.status(400).json({ error: error.message });
  }
};

// RENOMBRADO: De deleteProducto a deleteProductoById para que coincida con el Router
export const deleteProductoById = async ( req, res ) => {
    try {
        const { id } = req.params;
        const productoEliminado = await modelProductos.deleteProducto( id );
        if ( !productoEliminado ) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json({ message: "Producto eliminado correctamente" });
    }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }
};

export const updateProductoWithStock = async ( req, res ) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const productoActualizado = await modelProductos.updateProductoWithStock( id, stock );
        if ( !productoActualizado ) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json( productoActualizado );
    }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }
};

export const updateProductoWithPrecio = async ( req, res ) => {
    try {
        const { id } = req.params;
        const { precio } = req.body;
        const productoActualizado = await modelProductos.updateProductoWithPrecio( id, precio );
        if ( !productoActualizado ) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json( productoActualizado );
    }
    catch ( error ) {
        res.status(500).json({ error: "Error del servidor" });
    }
    finally {
    }
};

export const crearRegistroCompra = async (req, res) => {
    try {
        const { idProducto, precioCompra, cantidad, fechaVencimiento } = req.body;

        // Validaciones mínimas
        if ( !idProducto || !precioCompra || !cantidad) {
            return res.status(400).json({ error: "Faltan datos obligatorios para la compra" });
        }

        const nuevoLote = await modelProductos.registrarCompraLote({
            idProducto,
            precioCompra,
            cantidad,
            fechaVencimiento
        });

        res.status(201).json({
            message: "Compra registrada y lote creado con éxito",
            lote: nuevoLote
        });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la compra" });
    }
};

export const getAllProductosWithStock = getAllProductos;
