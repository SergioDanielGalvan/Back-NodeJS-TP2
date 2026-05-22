const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // O tu URI de MongoDB Atlas
const client = new MongoClient( uri );

async function verificarBaseDeDatos( BaseDeDatos ) {
    let bOk = false;
    try {
        if ( !BaseDeDatos ) {
            console.log("Por favor, proporciona el nombre de la base de datos a verificar.");
            return bOk;
        }
        await client.connect();
        console.log("Conexión exitosa al servidor");

        // 1. Obtener la lista de bases de datos
        const adminDb = client.db().admin();
        const result = await adminDb.listDatabases();

        // 2. Comprobar si existe la que buscas (ejemplo: 'miBaseDeDatos')
        const existe = result.databases.some(db => db.name === BaseDeDatos );

        if (existe) {
            console.log("¡La base de datos existe!");
            bOk = true;
        } else {
            console.log("La base de datos no existe (se creará al insertar el primer dato).");
        }

    } catch (error) {
        console.error("Error al conectar:", error);
    } finally {
        await client.close();
    }
    return bOk;
}

module.exports = {
    verificarBaseDeDatos
}
