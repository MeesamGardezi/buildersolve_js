import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'StillFeed API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;