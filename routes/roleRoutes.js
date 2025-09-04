const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Crear rol
router.post('/', roleController.createRole);
// Listar todos los roles
router.get('/', roleController.getRoles);
// Obtener rol por ID
router.get('/:id', roleController.getRoleById);
// Actualizar rol
router.put('/:id', roleController.updateRole);
// Eliminar rol
router.delete('/:id', roleController.deleteRole);
// Cambiar estado del rol
router.patch('/:id/status', roleController.changeRoleStatus);

module.exports = router;
