const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reportController = require('../controllers/report.controller');

router.use(protect);

router.get('/summary', reportController.getInventorySummary);
router.get('/valuation', reportController.getValuation);
router.get('/stock-movements', reportController.getStockMovements);
router.get('/expiry', reportController.getExpiryReport);
router.get('/low-stock', reportController.getLowStockReport);

module.exports = router;
