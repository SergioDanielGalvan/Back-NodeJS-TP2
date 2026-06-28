import { Router } from "express";
import maestroService from "../servicios/MaestroProductosService.js";
// pug va directo al service, no es necesario que pase por el controller que usa json

const router = Router();

// LISTADO
router.get("/", async (req, res) => {
  const productos = await maestroService.obtenerCatalogo();
  console.log("PRODUCTOS DE MONGO:", productos); // <--- AGREGÁ ESTA LÍNEA
  res.render("maestroProductos/index", { productos });
});

// FORM CREAR
router.get("/nuevo", (req, res) => {
  res.render("maestroProductos/form", {
    producto: null,
    action: "/maestroproductos",
  });
});

// CREAR
router.post("/", async (req, res) => {
  const datos = req.body;

  // 🛡️ Control defensivo: si no vienen categorías (como en el login cruzado), evita el crash
  if (datos && datos.categorias && typeof datos.categorias === "string") {
    datos.categorias = datos.categorias.split(",");
  } else {
    datos.categorias = [];
  }

  await maestroService.crearProductoCatalogo(datos);

  res.redirect("/maestroproductos");
});

// FORM EDITAR
router.get("/:id/editar", async (req, res) => {
  const producto = await maestroService.obtenerProductoCatalogo(req.params.id);

  res.render("maestroProductos/form", {
    producto,
    action: `/maestroproductos/${producto.idProducto}?_method=PUT`,
  });
});

// DETALLE
router.get("/:id", async (req, res) => {
  const producto = await maestroService.obtenerProductoCatalogo(req.params.id);
  res.render("maestroProductos/detalle", { producto });
});

// ACTUALIZAR
router.put("/:id", async (req, res) => {
  const datos = req.body;
  
  // 🛡️ Control defensivo: evita el crash si no vienen categorías en la edición
  if (datos && datos.categorias && typeof datos.categorias === "string") {
    datos.categorias = datos.categorias.split(",");
  } else {
    datos.categorias = [];
  }

  await maestroService.editarProductoCatalogo(req.params.id, datos);

  res.redirect("/maestroproductos");
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  await maestroService.eliminarProductoCatalogo(req.params.id);
  res.redirect("/maestroproductos");
});

export default router;