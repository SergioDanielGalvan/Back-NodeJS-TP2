// config/mongodb.js
import mongoose from "mongoose";

const MONGO_URI = URI || "mongodb://127.0.0.1:27017/TP2-IFTS29";
const DB_NAME = process.env.MONGODB_DB || "TP2-IFTS29";

// Cache de conexión para entornos serverless (Vercel): reutiliza la conexión
// entre invocaciones "calientes" en vez de reconectar en cada request.
let cached = globalThis.__mongo;
if (!cached) cached = globalThis.__mongo = { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { dbName: DB_NAME })
      .then((m) => {
        console.log("Conectado con MongoDB:", DB_NAME);
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
