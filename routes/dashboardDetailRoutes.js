const express = require('express');
const router = express.Router();
const dashboardDetailController = require('../controllers/dashboardDetailController');

// GET: Obtener dashboard detail por periodo y tipo
router.get('/', dashboardDetailController.getDashboardDetail);

// POST/PUT: Crear o actualizar dashboard detail
router.post('/', dashboardDetailController.upsertDashboardDetail);

module.exports = router;
