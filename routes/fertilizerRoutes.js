const express = require('express');
const router = express.Router();
const fertilizerController = require('../controllers/fertilizerController');

// Crear fertilizante
router.post('/', fertilizerController.createFertilizer);
// Listar todos los fertilizantes
router.get('/', fertilizerController.getFertilizers);
// Obtener fertilizante por ID
router.get('/:id', fertilizerController.getFertilizerById);
// Actualizar fertilizante
router.put('/:id', fertilizerController.updateFertilizer);
// Eliminar fertilizante
router.delete('/:id', fertilizerController.deleteFertilizer);

module.exports = router;
