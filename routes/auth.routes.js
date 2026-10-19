const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/me/password', protect, authController.changePassword);
router.patch('/me/profile', protect, authController.updateProfile);

module.exports = router;
