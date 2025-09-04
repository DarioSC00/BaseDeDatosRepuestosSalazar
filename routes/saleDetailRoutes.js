const express = require('express');
const router = express.Router();
const saleDetailController = require('../controllers/saleDetailController');
const saleController = require('../controllers/saleController');

// Crear detalle de venta
router.post('/', saleDetailController.createSaleDetail);
// Listar todos los detalles de venta
router.get('/', saleDetailController.getSaleDetails);
// Obtener detalle de venta por ID
router.get('/:id', saleController.getSaleById);
// Actualizar detalle de venta
router.put('/:id', saleDetailController.updateSaleDetail);
// Eliminar detalle de venta
router.delete('/:id', saleDetailController.deleteSaleDetail);

module.exports = router;
