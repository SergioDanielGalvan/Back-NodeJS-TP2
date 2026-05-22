var express = require('express');
var router = express.Router();
const usuariosControl = require("../controladores/UsuariosControlador");

/* GET users listing. */
router.get('/', usuariosControl.getAll);
router.post('/', usuariosControl.create);
router.delete("/:id", usuariosControl.deleteUsuario);
router.post('/login', usuariosControl.loginUsuario);

module.exports = router;