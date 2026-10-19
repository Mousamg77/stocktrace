const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const alertController = require('../controllers/alert.controller');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/', alertController.getAll);
router.get('/counts', alertController.getCounts);
router.patch('/:id/resolve', requireRole(ROLES.ADMIN, ROLES.MANAGER), alertController.resolve);

module.exports = router;
