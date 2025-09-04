const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta de login
router.post('/login', authController.login);

// Rutas de recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.get('/verify-token/:token', authController.verifyResetToken);

module.exports = router;
