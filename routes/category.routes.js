const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const categoryController = require('../controllers/category.controller');
const { categoryValidator } = require('../validators/category.validator');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', requireRole(ROLES.ADMIN, ROLES.MANAGER), categoryValidator, validate, categoryController.create);
router.patch('/:id', requireRole(ROLES.ADMIN, ROLES.MANAGER), categoryValidator, validate, categoryController.update);

module.exports = router;
