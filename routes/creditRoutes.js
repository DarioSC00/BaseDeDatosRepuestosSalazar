const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
// Controller para gestión de cupos (nuevo)
const creditControllerNew = require('../controllers/creditControllerNew');


// Crear crédito
// Crear crédito (venta/financiación)
router.post('/', creditController.createCredit);

// Endpoint específico para asignación/actualización de cupo de cliente
// Espera payload { client, cupo_asignado, observaciones, asignado_por }
router.post('/cupo', creditControllerNew.createCredit);

// Obtener todos los cupos de clientes
router.get('/cupos', creditControllerNew.getCupos);

// Liberar cupo (para abonos)
router.post('/liberar-cupo', creditControllerNew.liberarCupo);

// Listar todos los créditos
router.get('/', creditController.getCredits);
// Obtener crédito por ID
router.get('/:id', creditController.getCreditById);
// Obtener cuotas de un crédito
router.get('/:id/cuotas', creditController.getCuotasByCredit);
// Actualizar crédito
router.put('/:id', creditController.updateCredit);
// Eliminar crédito
router.delete('/:id', creditController.deleteCredit);
// Registrar abono
router.post('/:id/abonos', creditController.addAbono);

module.exports = router;
