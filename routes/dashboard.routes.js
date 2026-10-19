const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/kpis', dashboardController.getKPIs);
router.get('/stock-chart', dashboardController.getStockChart);
router.get('/category-distribution', dashboardController.getCategoryDistribution);
router.get('/top-products', dashboardController.getTopMovedProducts);
router.get('/recent-movements', dashboardController.getRecentMovements);
router.get('/recent-products', dashboardController.getRecentProducts);

module.exports = router;
