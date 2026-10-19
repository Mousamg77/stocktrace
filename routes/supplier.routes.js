const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supplierController = require('../controllers/supplier.controller');
const { supplierValidator } = require('../validators/supplier.validator');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', requireRole(ROLES.ADMIN, ROLES.MANAGER), supplierValidator, validate, supplierController.create);
router.patch('/:id', requireRole(ROLES.ADMIN, ROLES.MANAGER), supplierValidator, validate, supplierController.update);

module.exports = router;
