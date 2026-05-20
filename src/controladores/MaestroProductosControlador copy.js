import * as modelMaestro from "../modelos/MaestroProductos.js";
import * as modelProductos from "../modelos/Productos.js";

export const getAllProductos = async ( req, res ) => {
  try {
    const productosMaestro = await modelMaestro.getAllProductos( '', false );
    if ( !productosMaestro ) {
      return res.status(404).json({ error: "Productos no encontrados" });
    }
    // Datos de stock para cada producto
    const productosConStock = await modelProductos.getAllProductos( '', false );
    /*
    const productosConStock = await Promise.all(
      productosMaestro.map( async ( producto ) => {
        const productoConStock = await modelProductos.getProductoById( producto.id ); 
        return {
          ...producto,
          stock: productoConStock ? productoConStock.stock : 0
        };
      } )
    );
    */
    res.status(200).json( productosConStock );
  } catch ( error ) {
    res.status(500).json({ error: "Error del servidor" });
  }

};

export const getAllProductosByCategoria = async ( req, res ) => {
  try {
    const { categoria } = req.params;
    const productos = await modelMaestro.getAllProducts( categoria, false );
    if ( !productos ) {
      return res.status(404).json({ error: "Productos no encontrados" });
    }
    res.status(200).json( productos );
  } catch ( error ) {
    res.status(500).json({ error: "Error del servidor" });
  }
  finally {
  }
};