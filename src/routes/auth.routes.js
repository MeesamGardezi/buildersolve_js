const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateProfileUpdate } = require('../validators/auth.validator');
const { register, getProfile, updateProfile, deleteAccount } = require('../controllers/auth.controller');

const router = express.Router();

// Register new user profile
router.post('/register', authenticate, authLimiter, validateRegistration, register);

// Get current user profile
router.get('/profile', authenticate, getProfile);

// Update user profile
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

// Delete user account
router.delete('/account', authenticate, authLimiter, deleteAccount);

module.exports = router;