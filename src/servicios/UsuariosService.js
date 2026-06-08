import bcrypt from "bcrypt";
import Usuario from "../modelos/Usuarios.js";

class UsuariosService {
  async registrar(datos) {
    if (!datos.nombre) {
      throw new Error("Nombre requerido");
    }

    if (!datos.email) {
      throw new Error("Email requerido");
    }

    if (!datos.password) {
      throw new Error("Contraseña requerida");
    }

    const existe = await Usuario.buscarPorEmail(datos.email);

    if (existe) {
      throw new Error("Ya existe un usuario con ese email");
    }

    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(datos.password, salt);

    const nuevoUsuario = {
      nombre: datos.nombre,
      email: datos.email,
      password: passwordHash,
      rol: datos.rol || "operador",
    };

    const usuario = await Usuario.crearUsuario(nuevoUsuario);

    return {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email y contraseña requeridos");
    }

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      throw new Error("Credenciales inválidas");
    }

    return {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  async obtenerUsuarios() {
    return await Usuario.obtenerTodos();
  }

  async obtenerUsuarioPorId(id) {
    return await Usuario.obtenerPorId(id);
  }

  async eliminarUsuario(id) {
    return await Usuario.eliminarUsuario(id);
  }
}

export default new UsuariosService();
