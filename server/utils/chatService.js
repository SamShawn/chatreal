const redisClient = require('./redisClient');

/**
 * 聊天数据服务类
 * 负责 Redis 中的聊天记录和用户状态管理
 */
class ChatService {
  constructor() {
    this.MESSAGE_KEY_PREFIX = 'chat:messages:';
    this.USERS_KEY = 'chat:users';
    this.USER_STATUS_KEY = 'chat:user_status:';
    this.MAX_MESSAGES = 1000; // 每个房间最多存储的消息数
  }

  /**
   * 获取 Redis 客户端
   */
  getClient() {
    return redisClient.getClient();
  }

  /**
   * 保存消息到 Redis
   * @param {string} roomId - 房间ID
   * @param {object} message - 消息对象
   */
  async saveMessage(roomId, message) {
    const client = this.getClient();
    if (!client) {
      console.error('Redis client not available');
      return false;
    }

    try {
      const key = this.MESSAGE_KEY_PREFIX + roomId;
      const messageStr = JSON.stringify(message);

      // 使用列表存储消息，最新的消息在列表头部
      await client.lPush(key, messageStr);

      // 限制消息数量，删除旧消息
      await client.lTrim(key, 0, this.MAX_MESSAGES - 1);

      return true;
    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  }

  /**
   * 获取房间历史消息
   * @param {string} roomId - 房间ID
   * @param {number} limit - 获取消息数量限制
   */
  async getMessages(roomId, limit = 50) {
    const client = this.getClient();
    if (!client) {
      console.error('Redis client not available');
      return [];
    }

    try {
      const key = this.MESSAGE_KEY_PREFIX + roomId;
      // 获取最新的消息（Redis list 是 LIFO）
      const messages = await client.lRange(key, 0, limit - 1);

      // 反转数组以按时间顺序显示
      return messages
        .map(msgStr => {
          try {
            return JSON.parse(msgStr);
          } catch (e) {
            console.error('Error parsing message:', e);
            return null;
          }
        })
        .filter(msg => msg !== null)
        .reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * 搜索消息
   * @param {string} roomId - 房间ID
   * @param {string} keyword - 搜索关键词
   */
  async searchMessages(roomId, keyword) {
    const client = this.getClient();
    if (!client) {
      console.error('Redis client not available');
      return [];
    }

    try {
      const key = this.MESSAGE_KEY_PREFIX + roomId;
      const messages = await client.lRange(key, 0, -1);

      const lowerKeyword = keyword.toLowerCase();
      return messages
        .map(msgStr => {
          try {
            return JSON.parse(msgStr);
          } catch (e) {
            return null;
          }
        })
        .filter(msg => {
          if (!msg || !msg.content) return false;
          return msg.content.toLowerCase().includes(lowerKeyword);
        })
        .reverse();
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * 添加在线用户
   * @param {string} userId - 用户ID
   * @param {object} userData - 用户数据
   */
  async addUser(userId, userData) {
    const client = this.getClient();
    if (!client) return;

    try {
      // 先检查用户是否已存在
      const existingUser = await client.hGet(this.USERS_KEY, userId);

      // 如果用户已存在，只更新 socketId 和 joinedAt
      if (existingUser) {
        const existingData = JSON.parse(existingUser);
        await client.hSet(this.USERS_KEY, userId, JSON.stringify({
          ...existingData,
          ...userData,
          socketId: userData.socketId,
          joinedAt: Date.now(), // 更新加入时间
        }));
      } else {
        // 新用户才存储用户信息
        await client.hSet(this.USERS_KEY, userId, JSON.stringify(userData));
      }

      // 设置用户在线状态
      await client.set(this.USER_STATUS_KEY + userId, 'online');

      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  }

  /**
   * 移除用户（用户下线）
   * @param {string} userId - 用户ID
   */
  async removeUser(userId) {
    const client = this.getClient();
    if (!client) return;

    try {
      // 删除用户在线状态
      await client.del(this.USER_STATUS_KEY + userId);

      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }

  /**
   * 获取所有用户
   */
  async getAllUsers() {
    const client = this.getClient();
    if (!client) return [];

    try {
      const users = await client.hGetAll(this.USERS_KEY);

      return Object.entries(users).map(([userId, userDataStr]) => {
        try {
          const userData = JSON.parse(userDataStr);
          return { userId, ...userData };
        } catch (e) {
          return null;
        }
      }).filter(user => user !== null);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * 获取在线用户
   */
  async getOnlineUsers() {
    const client = this.getClient();
    if (!client) return [];

    try {
      const users = await client.hGetAll(this.USERS_KEY);
      const onlineUsers = [];

      for (const [userId, userDataStr] of Object.entries(users)) {
        const status = await client.get(this.USER_STATUS_KEY + userId);
        if (status === 'online') {
          try {
            const userData = JSON.parse(userDataStr);
            onlineUsers.push({ userId, ...userData });
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      return onlineUsers;
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  /**
   * 更新用户状态
   * @param {string} userId - 用户ID
   * @param {string} status - 状态（online/offline）
   */
  async updateUserStatus(userId, status) {
    const client = this.getClient();
    if (!client) return;

    try {
      if (status === 'online') {
        await client.set(this.USER_STATUS_KEY + userId, 'online');
      } else {
        await client.del(this.USER_STATUS_KEY + userId);
      }
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   */
  async getUser(userId) {
    const client = this.getClient();
    if (!client) return null;

    try {
      const userDataStr = await client.hGet(this.USERS_KEY, userId);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const status = await client.get(this.USER_STATUS_KEY + userId);
        return { userId, ...userData, isOnline: status === 'online' };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}

// 创建单例实例
const chatService = new ChatService();

module.exports = chatService;
