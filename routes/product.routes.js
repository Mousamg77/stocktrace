const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductValidator, updateProductValidator, listProductsValidator } = require('../validators/product.validator');
const { ROLES } = require('../config/constants');

// All product routes require authentication
router.use(protect);

// QR lookup (before /:id to avoid route conflict)
router.get('/qr/:qrId', productController.getByQrId);

router.get('/', listProductsValidator, validate, productController.getAll);
router.post('/', requireRole(ROLES.ADMIN, ROLES.MANAGER), createProductValidator, validate, productController.create);
router.get('/:id', productController.getById);
router.patch('/:id', requireRole(ROLES.ADMIN, ROLES.MANAGER), updateProductValidator, validate, productController.update);
router.patch('/:id/archive', requireRole(ROLES.ADMIN, ROLES.MANAGER), productController.archive);

module.exports = router;
