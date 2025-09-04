const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

console.log('Cargando rutas de usuario');

// Cambiar estado (primero)
router.patch('/:id/cambiar-estado', userController.cambiarEstadoUsuario);
// Eliminar usuario (antes del get por id)
router.delete('/:id', userController.deleteUser);

// Crear usuario
router.post('/', userController.createUser);
// Listar todos los usuarios
router.get('/', userController.getUsers);
const auth = require('../middleware/auth');
// Obtener perfil del usuario autenticado (protegido)
router.get('/perfil', auth, userController.getProfile);
// Cambiar contraseña del usuario autenticado (protegido)
router.put('/cambiar-contrasena', auth, userController.changePassword);
// Obtener usuario por ID (AL FINAL)
router.get('/:id', userController.getUserById);
// Actualizar usuario
router.put('/:id', userController.updateUser);

module.exports = router;
