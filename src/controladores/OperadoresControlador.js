// controladores/OperadoresControlador.js
import operadoresService from "../servicios/OperadoresService.js";

export const register = async (req, res) => {
  try {
    const operador = await operadoresService.registrar(req.body);
    res.status(201).json(operador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const operador = await operadoresService.login(email, password);
    res.json({ message: "Login correcto", operador });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getOperadores = async (req, res) => {
  try {
    const operadores = await operadoresService.obtenerOperadores();
    res.json(operadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOperadorById = async (req, res) => {
  try {
    const operador = await operadoresService.obtenerOperadorPorId(req.params.id);
    if (!operador) {
      return res.status(404).json({ error: "Operador no encontrado" });
    }
    res.json(operador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOperador = async (req, res) => {
  try {
    const eliminado = await operadoresService.eliminarOperador(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Operador no encontrado" });
    }
    res.json({ message: "Operador eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
