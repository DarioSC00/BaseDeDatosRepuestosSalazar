const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Crear estado
router.post('/', statusController.createStatus);
// Listar todos los estados
router.get('/', statusController.getStatuses);
// Obtener estado por ID
router.get('/:id', statusController.getStatusById);
// Actualizar estado
router.put('/:id', statusController.updateStatus);
// Eliminar estado
router.delete('/:id', statusController.deleteStatus);

module.exports = router;
