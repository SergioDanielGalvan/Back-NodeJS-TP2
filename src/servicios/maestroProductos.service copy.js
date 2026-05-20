/*
  Para una siguiente fase, SDG 21/04/2026
*/

import repo from '../repositories/maestroProductos.repository.js';

class MaestroProductosService {
  async listar() {
    return await repo.obtenerTodos();
  }

  async obtenerPorId(id) {
    return await repo.obtenerPorId(id);
  }

  async crear(datos) {
    // Validar campos obligatorios
    if ( !datos.nombre || !datos.categoria || !datos.stockMinimo ) {
      throw new Error('Faltan campos obligatorios');
    }
    return await repo.guardar(datos);
  }

  async actualizar(id, datos) {
    return await repo.actualizar(id, datos);
  }

  async eliminar(id) {
    // Validar que no tenga lotes asociados (se conectará con ProductosRepository)
    await repo.eliminar(id);
  }
}

export default new MaestroProductosService();