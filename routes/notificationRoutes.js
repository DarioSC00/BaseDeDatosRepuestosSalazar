const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notificaciones
router.post('/', notificationController.createNotification);
router.get('/usuario/:usuarioId', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);

// Detalles de notificación
router.post('/detalle', notificationController.createNotificationDetail);
router.get('/detalle/:notificacionId', notificationController.getNotificationDetails);

module.exports = router;
