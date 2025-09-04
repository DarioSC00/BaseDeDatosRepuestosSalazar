const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Crear proveedor
router.post('/', supplierController.createSupplier);
// Listar todos los proveedores
router.get('/', supplierController.getSuppliers);
// Obtener proveedor por ID
router.get('/:id', supplierController.getSupplierById);
// Actualizar proveedor
router.put('/:id', supplierController.updateSupplier);
// Eliminar proveedor
router.delete('/:id', supplierController.deleteSupplier);
// Cambiar estado del proveedor
router.patch('/:id/cambiar-estado', supplierController.cambiarEstadoProveedor);

module.exports = router;
