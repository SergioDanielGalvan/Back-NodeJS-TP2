// app.js
import express from 'express';
// import cors from 'cors';
import methodOverride from "method-override";
import path from 'path';
import { fileURLToPath } from 'url';
import productosRouter from "./src/rutas/ProductosRouter.js";
import maestroProductosRouter from "./src/rutas/MaestroProductosRouter.js";
import maestroProductosRouterViews from "./src/rutas/MaestroProductosRouterViews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
//app.use(cors());

// Configuración de Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/vistas'));

// Archivos estáticos
app.use('/imagenes', express.static(path.join(__dirname, 'src/vistas/imagenes')));
app.use(express.static(path.join(__dirname, 'src/vistas')));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static('public'));
//app.use(methodOverride("_method"));

// Rutas (se irán agregando)
app.get('/', (req, res) => {
  res.render('index', { titulo: 'TodoStock S.A.' });
});

app.use('/api/usuarios', usersRouter);
app.use("/api/productos", productosRouter);
app.use("/api/maestroproductos", maestroProductosRouter);
app.use("/maestroProductosRouterViews", maestroProductosRouterViews);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('404', { titulo: 'Página no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));