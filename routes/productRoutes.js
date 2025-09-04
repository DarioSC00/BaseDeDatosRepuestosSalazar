const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Crear producto
router.post('/', productController.createProduct);
// Listar todos los productos
router.get('/', productController.getProducts);
// Obtener producto por ID
router.get('/:id', productController.getProductById);
// Actualizar producto
router.put('/:id', productController.updateProduct);
// Eliminar producto
router.delete('/:id', productController.deleteProduct);
// Cambiar estado del producto (ACTIVO/INACTIVO)
router.patch('/:id/status', productController.changeProductStatus);

module.exports = router;
