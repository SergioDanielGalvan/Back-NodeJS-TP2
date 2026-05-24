const mongoose = require('mongoose');

const estadosConexion = {
    0: "Desconectado",
    1: "Conectado",
    2: "Conectando",
    3: "Desconectando"
};

function verificarConexion() {
    const estadoActual = mongoose.connection.readyState;
    console.log(`Estado de conexión a MongoDB: ${estadosConexion[estadoActual]}`);
}

async function verificarBaseDeDatos( BaseDeDatos ) {
    let bOk = false;
    try {
        if ( !BaseDeDatos ) {
            console.log("Por favor, proporciona el nombre de la base de datos a verificar.");
            return bOk;
        }
        // Lógica para verificar la base de datos
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.listDatabases();

        const existe = result.databases.some( db => db.name === BaseDeDatos );
        if ( existe ) {
            console.log("¡La base de datos existe!");
        } else {
            console.log("La base de datos no existe (se creará al insertar el primer dato).");
        }


        bOk = true;
    } catch (error) {
        console.error("Error al verificar la base de datos:", error);
    }
    return bOk;
}

async function verificarColeccion( nombreColeccion ) {
  try {
    // 1. Obtener la conexión activa
    const db = mongoose.connection.db;

    // 2. Obtener todas las colecciones de la base de datos
    const collections = await db.listCollections().toArray();

    // 3. Buscar si existe el nombre exacto (ej. 'usuarios')
    const existe = collections.some( col => col.name === nombreColeccion );

    if (existe) {
      console.log('¡La colección existe!');
    } else {
      console.log('La colección no existe.');
    }
  } catch (error) {
    console.error('Error al verificar la colección:', error);
  }
}

module.exports = {
    verificarConexion,
    verificarBaseDeDatos,
    verificarColeccion
}