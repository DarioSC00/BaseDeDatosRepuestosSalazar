const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Crear categoría
router.post('/', categoryController.createCategory);
// Listar todas las categorías
router.get('/', categoryController.getCategories);
// Obtener categoría por ID
router.get('/:id', categoryController.getCategoryById);
// Actualizar categoría
router.put('/:id', categoryController.updateCategory);
// Eliminar categoría
router.delete('/:id', categoryController.deleteCategory);
// Cambiar estado de la categoría
router.patch('/:id/cambiar-estado', categoryController.changeCategoryStatus);

module.exports = router;
