const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

// Crear permiso
router.post('/', permissionController.createPermission);
// Listar todos los permisos
router.get('/', permissionController.getPermissions);
// Obtener permiso por ID
router.get('/:id', permissionController.getPermissionById);
// Actualizar permiso
router.put('/:id', permissionController.updatePermission);
// Eliminar permiso
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
