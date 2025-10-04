import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/responses.js';

export const validateRegistration = [
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Display name must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Bio must not exceed 150 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

export const validateProfileUpdate = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Display name must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Bio must not exceed 150 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];