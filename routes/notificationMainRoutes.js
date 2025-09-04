const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Rutas para Notificación principal
router.post('/', notificationController.createNotification);
router.get('/usuario/:usuarioId', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
