/*
  Para una siguiente fase, SDG 22/04/2026
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data');

class JsonRepository {
  constructor(fileName) {
    this.filePath = path.join(dataPath, fileName);
  }

  async leer() {
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async escribir(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async obtenerTodos() {
    return this.leer();
  }

  async obtenerPorId(id) {
    const items = await this.leer();
    return items.find(item => item.id == id);
  }

  async guardar(item) {
    const items = await this.leer();
    const nuevoId = Date.now().toString();
    const nuevoItem = { id: nuevoId, ...item };
    items.push(nuevoItem);
    await this.escribir(items);
    return nuevoItem;
  }

  async actualizar(id, nuevosDatos) {
    const items = await this.leer();
    const index = items.findIndex(item => item.id == id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...nuevosDatos };
    await this.escribir(items);
    return items[index];
  }

  async eliminar(id) {
    const items = await this.leer();
    const nuevosItems = items.filter(item => item.id != id);
    await this.escribir(nuevosItems);
  }
}

export default JsonRepository;