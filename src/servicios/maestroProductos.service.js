import { randomUUID } from "crypto"; // actualmente usamos numeros enteros en el json, pero a la larga tenemos que usar uuids
// import repo from "../repositorios/maestroProductosRepository.js";
import repo from "../modelos/MaestroProductos.js";

class MaestroProductosService {
  async obtenerCatalogo() {
    return await repo.obtenerTodos();
  }

  async obtenerProductoCatalogo(id) {
    if (!id) throw new Error("ID requerido");
    return await repo.obtenerPorId(id);
  }

  async crearProductoCatalogo(datos) {
    this.validarProducto(datos);

    const productos = await repo.obtenerTodos();

    // Evitar duplicado por EAN
    const existe = productos.find((p) => p.EAN === datos.EAN);
    if (existe) {
      throw new Error("Ya existe un producto con ese EAN");
    }

    const nuevoProducto = {
      idProducto: randomUUID(),
      EAN: datos.EAN,
      nombre: datos.nombre,
      categorias: datos.categorias,
      descripcion: datos.descripcion || "",
      unidadMedida: datos.unidadMedida,
      envase: datos.envase,
      stockMinimo: Number(datos.stockMinimo),
      puntoPedido: Number(datos.puntoPedido),
      fechaAlta: new Date().toISOString(),
      operador: datos.operador || "sistema",
    };

    return await repo.guardar(nuevoProducto);
  }

  async editarProductoCatalogo(id, datos) {
    if (!id) throw new Error("ID requerido");

    const producto = await repo.obtenerPorId(id);
    if (!producto) return null;

    this.validarProducto(datos, true);

    const actualizado = {
      ...producto,
      ...datos,
    };

    return await repo.actualizar(id, actualizado);
  }

  async eliminarProductoCatalogo(id) {
    if (!id) throw new Error("ID requerido");

    const producto = await repo.obtenerPorId(id);
    if (!producto) return null;

    // TODO: validar relación con productos (lotes)
    return await repo.eliminar(id);
  }

  async buscarPorNombre(nombre) {
    const productos = await repo.obtenerTodos();

    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(nombre.toLowerCase()),
    );
  }

  async buscarPorCategoria(categoria) {
    const productos = await repo.obtenerTodos();

    return productos.filter((p) =>
      p.categorias?.some((cat) =>
        cat.toLowerCase().includes(categoria.toLowerCase()),
      ),
    );
  }

  async buscarPorEAN(ean) {
    this.validarEAN(ean);

    const productos = await repo.obtenerTodos();
    return productos.find((p) => p.EAN === ean);
  }

  validarProducto(datos, parcial = false) {
    if (!parcial) {
      if (!datos.EAN) throw new Error("EAN requerido");
      if (!datos.nombre) throw new Error("Nombre requerido");
      if (!datos.unidadMedida) throw new Error("Unidad de medida requerida");
      if (!datos.envase) throw new Error("Envase requerido");
    }

    if (datos.EAN) this.validarEAN(datos.EAN);

    if (datos.stockMinimo < 0) {
      throw new Error("Stock mínimo inválido");
    }

    if (datos.puntoPedido < datos.stockMinimo) {
      throw new Error("Punto de pedido no puede ser menor al stock mínimo");
    }
  }

  validarEAN(ean) {
    const regex = /^[0-9]{13}$/;
    if (!regex.test(ean)) {
      throw new Error("EAN inválido (13 dígitos)");
    }
  }
}

export default new MaestroProductosService();
