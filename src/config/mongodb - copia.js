// config/mongodb.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/TP2-IFTS29");

    console.log("Conectado con MongoDB TP2-IFTS29");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
};
