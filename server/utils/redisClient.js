const redis = require('redis');
require('dotenv').config();

/**
 * Redis 客户端管理类
 * 负责与 Redis 的连接和基本操作
 */
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * 创建 Redis 连接
   */
  async connect() {
    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        },
        password: process.env.REDIS_PASSWORD || undefined,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Redis Connection Failed:', error);
      throw error;
    }
  }

  /**
   * 断开 Redis 连接
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Redis Client Disconnected');
    }
  }

  /**
   * 获取客户端实例
   */
  getClient() {
    return this.client;
  }

  /**
   * 检查连接状态
   */
  isReady() {
    return this.isConnected;
  }
}

// 创建单例实例
const redisClient = new RedisClient();

module.exports = redisClient;
