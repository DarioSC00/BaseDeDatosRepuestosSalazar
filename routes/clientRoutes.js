const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Crear cliente
router.post('/', clientController.createClient);
// Listar todos los clientes
router.get('/', clientController.getClients);
// Obtener cliente por ID
router.get('/:id', clientController.getClientById);
// Actualizar cliente
router.put('/:id', clientController.updateClient);
// Eliminar cliente
router.delete('/:id', clientController.deleteClient);
// Cambiar estado del cliente
router.patch('/:id/cambiar-estado', clientController.changeClientStatus);

module.exports = router;
