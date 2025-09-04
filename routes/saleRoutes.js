const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const auth = require('../middleware/auth');

// Obtener siguiente número de venta
router.get('/next-number', saleController.getNextSaleNumber);

// Crear venta
router.post('/', auth, saleController.createSale);
// Listar todas las ventas
router.get('/', saleController.getSales);
// Obtener venta por ID (AL FINAL)
router.get('/:id', saleController.getSaleById);
// Actualizar venta
router.put('/:id', saleController.updateSale);
// Eliminar venta
router.delete('/:id', saleController.deleteSale);

module.exports = router;
