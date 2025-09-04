const express = require('express');
const router = express.Router();
const creditDetailController = require('../controllers/creditDetailController');

// Crear detalle de crédito
router.post('/', creditDetailController.createCreditDetail);

// Obtener todos los detalles de crédito
router.get('/', creditDetailController.getAllCreditDetails);

// Obtener detalles por crédito
router.get('/by-credit/:creditId', creditDetailController.getCreditDetailsByCredit);

// Actualizar detalle de crédito
router.put('/:id', creditDetailController.updateCreditDetail);

// Eliminar detalle de crédito
router.delete('/:id', creditDetailController.deleteCreditDetail);

module.exports = router;
