const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const generalLimiter = rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts, please try again later' }
  },
  skipSuccessfulRequests: true
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { message: 'Upload limit reached, please try again later' }
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter
};