import usuariosService from "../servicios/UsuariosService.js";

export const register = async (req, res) => {
  try {
    const usuario = await usuariosService.registrar(req.body);

    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await usuariosService.login(email, password);

    res.json({
      message: "Login correcto",
      usuario,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuariosService.obtenerUsuarios();

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const usuario = await usuariosService.obtenerUsuarioPorId(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    const eliminado = await usuariosService.eliminarUsuario(req.params.id);

    if (!eliminado) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.json({
      message: "Usuario eliminado",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
