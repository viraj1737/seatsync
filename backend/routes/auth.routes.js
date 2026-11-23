const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const requireAuth = require('../middleware/requireAuth');

// Public endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Authenticated endpoints
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
