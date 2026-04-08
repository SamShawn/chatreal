import dotenv from 'dotenv';
dotenv.config();
export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    // Client URL for CORS
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/chatreal',
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    // File Upload
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    // CORS
    corsOrigins: process.env.CLIENT_URL?.split(',').map(o => o.trim()) || ['http://localhost:5173'],
};
//# sourceMappingURL=index.js.map