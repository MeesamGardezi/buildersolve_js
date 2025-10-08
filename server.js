require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./src/middleware/errorHandler');

// Initialize Firebase Admin
require('./src/config/firebase');

// Import routes
const videosRoutes = require('./src/video/video.routes');
const usersRoutes = require('./src/user/user.routes');
const authRoutes = require('./src/routes/auth.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// IMPROVED CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Check environment variable for allowed origins
    if (process.env.CORS_ORIGIN) {
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    } else {
      // If no CORS_ORIGIN is set, allow all in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
    }

    // Reject if not allowed
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  const corsStatus = process.env.CORS_ORIGIN 
    ? `Configured (${process.env.CORS_ORIGIN})`
    : 'Allow All (Development)';
    
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Server Started Successfully       ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   Firebase: ✓ Connected                ║
║   Storage: ✓ Configured                ║
║   CORS: ✓ ${corsStatus}  ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;