const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Rutas para Detalle de Notificación
router.post('/', notificationController.createNotificationDetail);
router.get('/:notificacionId', notificationController.getNotificationDetails);

module.exports = router;
