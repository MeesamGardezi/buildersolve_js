const AppError = require('../utils/errors').AppError;

const errorHandler = (err, req, res, next) => {
  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message }
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { 
        message: 'Validation failed',
        details: err.errors 
      }
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Generic error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return res.status(statusCode).json({
    success: false,
    error: { message }
  });
};

const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: { message: `Route ${req.originalUrl} not found` }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};