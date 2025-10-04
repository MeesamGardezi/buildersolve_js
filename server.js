import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// import { helmetConfig, limiter } from './config/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { decryptRequest } from './middleware/encryption.js';

// Initialize Firebase Admin
import './config/firebase.js';

// Import routes
import postsRoutes from './routes/posts.js';
import videosRoutes from './video/video.routes.js';
import usersRoutes from './user/user.routes.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmetConfig);
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Decrypt encrypted requests (optional - will pass through plain JSON)
app.use(decryptRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/posts', postsRoutes);
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
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Server Started Successfully       ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   Encryption: ✗ Disabled (plain JSON)  ║
║   Firebase: ✓ Connected                ║
║   Storage: ✓ Configured                ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;