const chatService = require('../utils/chatService');
const { createHash } = require('crypto');

/**
 * Socket.IO 事件处理器
 * 处理所有 WebSocket 连接和消息
 */
class SocketHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.socketUsers = new Map(); // socketId -> userId
  }

  /**
   * 初始化所有事件监听
   */
  initialize() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // 用户加入
      socket.on('user:join', async (data) => {
        await this.handleUserJoin(socket, data);
      });

      // 发送消息
      socket.on('message:send', async (data) => {
        await this.handleMessageSend(socket, data);
      });

      // 搜索消息
      socket.on('message:search', async (data) => {
        await this.handleMessageSearch(socket, data);
      });

      // 加入房间
      socket.on('room:join', async (data) => {
        await this.handleRoomJoin(socket, data);
      });

      // 离开房间
      socket.on('room:leave', async (data) => {
        await this.handleRoomLeave(socket, data);
      });

      // 获取房间历史消息
      socket.on('room:history', async (data) => {
        await this.handleRoomHistory(socket, data);
      });

      // 断开连接
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });

    console.log('Socket handlers initialized');
  }

  /**
   * 处理用户加入
   */
  async handleUserJoin(socket, data) {
    try {
      const { username, avatar } = data;

      if (!username) {
        socket.emit('error', { message: '用户名不能为空' });
        return;
      }

      // 生成用户ID
      const userId = this.generateUserId(username);

      // 存储用户信息
      await chatService.addUser(userId, {
        username,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        socketId: socket.id,
        joinedAtari: Date.now(),
      });

      // 映射关系
      this.userSockets.set(userId, socket.id);
      this.socketUsers.set(socket.id, userId);

      // 获取在线用户列表
      const onlineUsers = await chatService.getOnlineUsers();

      // 广播用户加入事件
      this.io.emit('user:joined', {
        userId,
        username,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        onlineUsers,
        onlineCount: onlineUsers.length,
      });

      // 发送成功响应
      socket.emit('user:join:success', {
        userId,
        username,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        onlineUsers,
        onlineCount: onlineUsers.length,
      });

      console.log(`User ${username} joined with ID: ${userId}`);
    } catch (error) {
      console.error('Error handling user join:', error);
      socket.emit('error', { message: '加入失败，请重试' });
    }
  }

  /**
   * 处理消息发送
   */
  async handleMessageSend(socket, data) {
    try {
      const { roomId, content, type = 'text', fileUrl, fileName, fileSize } = data;

      const userId = this.socketUsers.get(socket.id);
      if (!userId) {
        socket.emit('error', { message: '未登录' });
        return;
      }

      if (!roomId || (!content && !fileUrl)) {
        socket.emit('error', { message: '消息内容不能为空' });
        return;
      }

      // 获取用户信息
      const user = await chatService.getUser(userId);
      const username = user?.username || '匿名用户';
      const avatar = user?.avatar || '';

      // 构建消息对象
      const message = {
        id: this.generateMessageId(),
        roomId,
        userId,
        username,
        avatar,
        content: content || '',
        type, // text, image, file
        fileUrl,
        fileName,
        fileSize,
        timestamp: Date.now(),
      };

      // 保存消息到 Redis
      await chatService.saveMessage(roomId, message);

      // 广播消息到房间
      this.io.to(roomId).emit('message:new', message);

      console.log(`Message sent by ${username} in room ${roomId}`);
    } catch (error) {
      console.error('Error handling message send:', error);
      socket.emit('error', { message: '发送消息失败' });
    }
  }

  /**
   * 处理消息搜索
   */
  async handleMessageSearch(socket, data) {
    try {
      const { roomId, keyword } = data;

      if (!roomId || !keyword) {
        socket.emit('error', { message: '搜索参数不完整' });
        return;
      }

      // 搜索消息
      const messages = await chatService.searchMessages(roomId, keyword);

      socket.emit('message:search:result', {
        messages,
        count: messages.length,
      });

      console.log(`Searched for "${keyword}" in room ${roomId}, found ${messages.length} messages`);
    } catch (error) {
      console.error('Error handling message search:', error);
      socket.emit('error', { message: '搜索失败' });
    }
  }

  /**
   * 处理加入房间
   */
  async handleRoomJoin(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit('error', { message: '房间ID不能为空' });
        return;
      }

      // 加入 Socket.IO 房间
      socket.join(roomId);

      // 获取房间内用户数
      const room = this.io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;

      socket.emit('room:join:success', {
        roomId,
        userCount,
      });

      // 通知房间内其他用户
      socket.to(roomId).emit('room:user:joined', {
        userId: this.socketUsers.get(socket.id),
        roomId,
        userCount,
      });

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error handling room join:', error);
      socket.emit('error', { message: '加入房间失败' });
    }
  }

  /**
   * 处理离开房间
   */
  async handleRoomLeave(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit('error', { message: '房间ID不能为空' });
        return;
      }

      // 离开 Socket.IO 房间
      socket.leave(roomId);

      // 获取房间内用户数
      const room = this.io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;

      // 通知房间内其他用户
      socket.to(roomId).emit('room:user:left', {
        userId: this.socketUsers.get(socket.id),
        roomId,
        userCount,
      });

      socket.emit('room:leave:success', { roomId });

      console.log(`Socket ${socket.id} left room ${roomId}`);
    } catch (error) {
      console.error('Error handling room leave:', error);
      socket.emit('error', { message: '离开房间失败' });
    }
  }

  /**
   * 处理获取房间历史消息
   */
  async handleRoomHistory(socket, data) {
    try {
      const { roomId, limit = 50 } = data;

      if (!roomId) {
        socket.emit('error', { message: '房间ID不能为空' });
        return;
      }

      // 获取历史消息
      const messages = await chatService.getMessages(roomId, limit);

      socket.emit('room:history:result', {
        roomId,
        messages,
        count: messages.length,
      });

      console.log(`Sent ${messages.length} historical messages for room ${roomId}`);
    } catch (error) {
      console.error('Error handling room history:', error);
      socket.emit('error', { message: '获取历史消息失败' });
    }
  }

  /**
   * 处理断开连接
   */
  async handleDisconnect(socket) {
    try {
      const userId = this.socketUsers.get(socket.id);

      if (userId) {
        // 更新用户状态为离线
        await chatService.removeUser(userId);

        // 删除映射关系
        this.userSockets.delete(userId);
        this.socketUsers.delete(socket.id);

        // 获取在线用户列表
        const onlineUsers = await chatService.getOnlineUsers();

        // 广播用户离开事件
        this.io.emit('user:left', {
          userId,
          onlineUsers,
          onlineCount: onlineUsers.length,
        });

        console.log(`User ${userId} disconnected`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * 生成用户ID
   */
  generateUserId(username) {
    const hash = createHash('sha256');
    hash.update(username + Date.now());
    return hash.digest('hex').substring(0, 16);
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return createHash('sha256')
      .update(Date.now() + Math.random().toString())
      .digest('hex')
      .substring(0, 16);
  }
}

module.exports = SocketHandler;
