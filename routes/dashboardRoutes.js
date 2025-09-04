const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Reportes de dashboard
// Nuevas rutas con filtros año, mes, día
router.get('/ventas', dashboardController.getSalesByPeriod); // ?year=2024&month=7&day=31
router.get('/compras', dashboardController.getPurchasesByPeriod);
router.get('/ganancias', dashboardController.getProfitByPeriod);
router.get('/devoluciones', dashboardController.getDevolutionsByPeriod);
router.get('/productos-mas-vendidos', dashboardController.getTopProducts);
router.get('/categoria-mas-stock', dashboardController.getTopCategoryStock);
router.get('/productos-menos-vendidos', dashboardController.getTopLeastSoldProducts);

// Integrar dashboardDetail
const dashboardDetailRoutes = require('./dashboardDetailRoutes');
router.use('/detail', dashboardDetailRoutes);

module.exports = router;
