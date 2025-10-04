import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegistration, validateProfileUpdate } from '../validators/auth.validator.js';
import { register, getProfile, updateProfile, deleteAccount } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authenticate, authLimiter, validateRegistration, register);

router.get('/profile', authenticate, getProfile);

router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

router.delete('/account', authenticate, authLimiter, deleteAccount);

export default router;