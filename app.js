// app.js
import "dotenv/config";
import express from "express";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/mongodb.js";
import maestroProductosRouter from "./src/rutas/MaestroProductosRouter.js";
import maestroProductosRouterViews from "./src/rutas/MaestroProductosRouterViews.js";
import productosRouter from "./src/rutas/ProductosRouter.js";
import operadoresRouter from "./src/rutas/OperadoresRouter.js";
import comprasRouter from "./src/rutas/ComprasRouter.js";
import ventasRouter from "./src/rutas/VentasRouter.js";
import recibosRouter from "./src/rutas/RecibosRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src/vistas"));

// Archivos estáticos
app.use(
  "/imagenes",
  express.static(path.join(__dirname, "src/vistas/imagenes")),
);
app.use(express.static(path.join(__dirname, "src/vistas")));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src")));
app.use(methodOverride("_method"));

// Asegura la conexión a Mongo antes de atender cada request (serverless-safe).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Rutas
app.get("/", (req, res) => {
  res.render("index", { titulo: "TodoStock S.A." });
});

app.use("/api/operadores", operadoresRouter);
app.use("/api/compras", comprasRouter);
app.use("/api/ventas", ventasRouter);
app.use("/api/recibos", recibosRouter);
app.use("/api/productos", productosRouter);
app.use("/api/maestroproductos", maestroProductosRouter);
app.use("/maestroproductos", maestroProductosRouterViews);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Página no encontrada" });
});

// En local levanta el servidor; en Vercel se exporta la app (serverless).
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`),
  );
}

export default app;
