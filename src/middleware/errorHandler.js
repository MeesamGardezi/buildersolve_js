import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/responses.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation failed', 400, err.errors);
  }

  console.error('Unexpected error:', err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return errorResponse(res, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};