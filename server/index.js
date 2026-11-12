import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import errorHandler from './middleware/error.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import formRoutes from './routes/form.routes.js';
import responseRoutes from './routes/response.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time WebSocket notifications (Experiment 7 requirement)
initSocket(server);

// Connect to MongoDB Database (Experiment 5 requirement)
connectDB().then(async () => {
  if (process.env.AUTO_SEED === 'true') {
    try {
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase({ force: false, disconnect: false });
    } catch (seedErr) {
      console.error('[Auto-Seed] Note:', seedErr.message);
    }
  }
});

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health & Info Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Student Feedback Management System API',
    database: 'StudentFeedbackDB (MongoDB Mongoose)',
    features: [
      'Experiment 5: MongoDB Atlas & Mongoose Persistent REST API CRUD',
      'Experiment 6: JWT Auth, bcrypt password hashing, role-based authorization',
      'Experiment 7: WebSockets & Socket.IO Real-time Notifications',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/feedback-forms', formRoutes);
app.use('/api/feedback-responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback 404 Route for unmatched API endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.argv[1]?.includes('test-backend')) {
  server.listen(PORT, () => {
    console.log(`[Server] Student Feedback System backend running on http://localhost:${PORT}`);
    console.log(`[Socket.IO] Real-time notification server active`);
  });
}

export { app, server };
export default app;
