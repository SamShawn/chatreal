const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 导入工具类
const redisClient = require('./utils/redisClient');
const SocketHandler = require('./socket/handler');

// 加载环境变量
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 配置 CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// 解析 JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置 Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// 确保上传目录存在
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 静态文件服务（用于访问上传的文件）
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redisConnected: redisClient.isReady(),
  });
});

// 文件上传端点
app.post('/api/upload', (req, res) => {
  try {
    // 简单的文件上传处理（生产环境应使用 multer 等库）
    const chunks = [];
    let fileSize = 0;
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB

    req.on('data', (chunk) => {
      fileSize += chunk.length;
      if (fileSize > maxSize) {
        return res.status(413).json({ error: '文件过大' });
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (fileSize > maxSize) {
        return res.status(413).json({ error: '文件过大' });
      }

      // 简单的随机文件名生成
      const fileExt = req.headers['content-type']?.includes('image/') ?
        req.headers['content-type'].split('/')[1] : 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // 写入文件
      fs.writeFileSync(filePath, Buffer.concat(chunks));

      // 返回文件URL
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

      res.json({
        success: true,
        fileUrl,
        fileName: req.headers['x-file-name'] || fileName,
        fileSize,
      });
    });

    req.on('error', (err) => {
      console.error('File upload error:', err);
      res.status(500).json({ error: '文件上传失败' });
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 初始化函数
async function initialize() {
  try {
    // 连接 Redis
    console.log('Connecting to Redis...');
    await redisClient.connect();

    // 初始化 Socket 处理器
    const socketHandler = new SocketHandler(io);
    socketHandler.initialize();

    // 启动服务器
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🚀 ChatReal Server Started Successfully!       ║
║                                                            ║
║         📍 Server running on: http://localhost:${PORT}         ║
║         🔌 WebSocket ready on: ws://localhost:${PORT}         ║
║                                                            ║
║         📝 Features:                                      ║
║            • Real-time chat via WebSocket                ║
║            • Redis message persistence                   ║
║            • User presence tracking                      ║
║            • File upload support                         ║
║            • Message search                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // 优雅关闭
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// 优雅关闭函数
async function gracefulShutdown() {
  console.log('\\nShutting down gracefully...');

  // 关闭 Socket.IO
  io.close();

  // 关闭 Redis 连接
  await redisClient.disconnect();

  // 关闭 HTTP 服务器
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // 强制退出（10秒后）
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
}

// 启动应用
initialize().catch((error) => {
  console.error('Startup error:', error);
  process.exit(1);
});

module.exports = { app, server, io };
