// servicios/OperadoresService.js
import bcrypt from "bcrypt";
import Operador from "../modelos/Operador.js";

const SALT_ROUNDS = 10;

class OperadoresService {
  async registrar(datos) {
    // Acepta `nombres` (diseño) o `nombre` (compatibilidad).
    const nombres = datos.nombres || datos.nombre;

    if (!nombres) {
      throw new Error("Nombres requerido");
    }
    if (!datos.email) {
      throw new Error("Email requerido");
    }
    if (!datos.password) {
      throw new Error("Contraseña requerida");
    }

    const existe = await Operador.buscarPorEmail(datos.email);
    if (existe) {
      throw new Error("Ya existe un operador con ese email");
    }

    const claveHash = await bcrypt.hash(datos.password, SALT_ROUNDS);

    const operador = await Operador.crearOperador({
      nombres,
      apellidos: datos.apellidos || "",
      email: datos.email,
      claveHash,
      rol: datos.rol || "operador",
    });

    return this.#perfilPublico(operador);
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email y contraseña requeridos");
    }

    const operador = await Operador.buscarPorEmail(email);
    if (!operador) {
      throw new Error("Credenciales inválidas");
    }

    const claveValida = await bcrypt.compare(password, operador.claveHash);
    if (!claveValida) {
      throw new Error("Credenciales inválidas");
    }

    return this.#perfilPublico(operador);
  }

  async obtenerOperadores() {
    return Operador.obtenerTodos();
  }

  async obtenerOperadorPorId(id) {
    return Operador.obtenerPorId(id);
  }

  async eliminarOperador(id) {
    return Operador.eliminar(id);
  }

  // Devuelve solo lo que el cliente debe ver (nunca la claveHash).
  #perfilPublico(operador) {
    return {
      id: operador._id,
      idOperador: operador.idOperador,
      nombres: operador.nombres,
      apellidos: operador.apellidos,
      email: operador.email,
      rol: operador.rol,
    };
  }
}

export default new OperadoresService();
