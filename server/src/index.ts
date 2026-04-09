import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/index.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Create Express app
const app: ReturnType<typeof express> = express();
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', chatRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket handlers
initializeSocket(io);

// Start server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🚀 ChatReal Server Started Successfully!           ║
║                                                            ║
║         📍 Server running on: http://localhost:${config.port}        ║
║         🔌 WebSocket ready on: ws://localhost:${config.port}         ║
║                                                            ║
║         📝 Features:                                       ║
║            • TypeScript + Express                          ║
║            • JWT Authentication                            ║
║            • PostgreSQL + Prisma                           ║
║            • Socket.IO Real-time Messaging                 ║
║            • Role-based Access Control                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, io };
