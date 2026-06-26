// diagnostico-login.js  (temporal: borrar después de usar)
// Corré:  node diagnostico-login.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Operador from "./src/modelos/Operador.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TP2-IFTS29";

const EMAIL = "roberto@todostocksrl.com";
const PASSWORD = "password123";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Conectado a", MONGO_URI, "\n");

  const total = await Operador.countDocuments();
  console.log("Operadores en la base:", total);

  // Listar todos los emails crudos (sin pasar por el modelo)
  const crudos = await mongoose.connection
    .collection("operadors")
    .find({})
    .toArray();
  console.log(
    "Colección 'operadors' ->",
    crudos.map((o) => ({
      email: o.email,
      tieneClaveHash: typeof o.claveHash === "string",
      hashPrefix: o.claveHash ? String(o.claveHash).slice(0, 7) : null,
    }))
  );

  // Buscar por email como lo hace el login
  const op = await Operador.buscarPorEmail(EMAIL);
  console.log("\nbuscarPorEmail('" + EMAIL + "') ->", op ? "ENCONTRADO" : "NULL");

  if (op) {
    console.log("  email guardado:", JSON.stringify(op.email));
    console.log("  claveHash existe:", typeof op.claveHash === "string");
    console.log("  claveHash:", op.claveHash);
    const ok = await bcrypt.compare(PASSWORD, op.claveHash || "");
    console.log("  bcrypt.compare('" + PASSWORD + "', claveHash) ->", ok);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});