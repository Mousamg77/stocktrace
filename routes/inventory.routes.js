const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const inventoryController = require('../controllers/inventory.controller');
const { stockInValidator, stockOutValidator, adjustmentValidator } = require('../validators/inventory.validator');
const { ROLES } = require('../config/constants');

router.use(protect);

router.post('/stock-in', stockInValidator, validate, inventoryController.stockIn);
router.post('/stock-out', stockOutValidator, validate, inventoryController.stockOut);
router.post('/adjustments', requireRole(ROLES.ADMIN, ROLES.MANAGER), adjustmentValidator, validate, inventoryController.adjustment);
router.post('/reverse/:movementId', requireRole(ROLES.ADMIN, ROLES.MANAGER), inventoryController.reverseMovement);
router.get('/history', inventoryController.getHistory);
router.get('/summary', inventoryController.getSummary);

module.exports = router;
