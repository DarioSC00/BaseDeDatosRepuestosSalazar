const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shoppingController');

// Crear compra
router.post('/', shoppingController.createShopping);
// Listar todas las compras
router.get('/', shoppingController.getShoppings);
// Obtener compra por ID
router.get('/:id', shoppingController.getShoppingById);
// Actualizar compra
router.put('/:id', shoppingController.updateShopping);
// Eliminar compra
router.delete('/:id', shoppingController.deleteShopping);

module.exports = router;
