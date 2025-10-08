const { param, query, validationResult } = require('express-validator');

const validateUserId = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid user ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
];

const validateVideoId = [
  param('videoId')
    .trim()
    .notEmpty()
    .withMessage('Video ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid video ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
];

const validatePagination = [
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
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
];

const validatePage = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
];

module.exports = {
  validateUserId,
  validateVideoId,
  validatePagination,
  validatePage
};