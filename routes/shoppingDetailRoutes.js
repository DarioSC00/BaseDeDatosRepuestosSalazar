const express = require('express');
const router = express.Router();
const shoppingDetailController = require('../controllers/shoppingDetailController');

// Crear detalle de compra
router.post('/', shoppingDetailController.createShoppingDetail);
// Listar todos los detalles de compra
router.get('/', shoppingDetailController.getShoppingDetails);
// Obtener detalles por compra
router.get('/by-shopping/:shoppingId', shoppingDetailController.getDetailsByShopping);
// Obtener detalle de compra por ID
router.get('/:id', shoppingDetailController.getShoppingDetailById);
// Actualizar detalle de compra
router.put('/:id', shoppingDetailController.updateShoppingDetail);
// Eliminar detalle de compra
router.delete('/:id', shoppingDetailController.deleteShoppingDetail);

module.exports = router;
