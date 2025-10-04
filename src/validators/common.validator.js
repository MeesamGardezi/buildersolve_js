import { param, query, validationResult } from 'express-validator';
import { errorResponse } from '../utils/responses.js';

export const validateUserId = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid user ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

export const validateVideoId = [
  param('videoId')
    .trim()
    .notEmpty()
    .withMessage('Video ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid video ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .toInt(),
  
  query('cursor')
    .optional()
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];