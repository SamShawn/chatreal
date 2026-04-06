import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

/**
 * Socket.IO 客户端封装类
 * 管理 WebSocket 连接和事件
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * 连接到服务器
   */
  connect(userId) {
    // 如果已经连接，直接触发回调
    if (this.socket && this.connected) {
      this.emit('socket:connected');
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgradeTimeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] connect event fired, socket.id:', this.socket.id);
      this.connected = true;
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      this.emit('socket:disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket:error', error);
    });

    return this.socket;
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * 发送事件
   */
  emit(event, data) {
    // 优先处理自定义事件（通过 listeners）
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }

    // 如果 socket 已连接，发送到服务器
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[Socket] Not connected, cannot emit to server:', event);
    }
  }

  /**
   * 监听事件
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      listeners.delete(callback);

      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        if (this.socket) {
          this.socket.off(event, callback);
        }
      });
    });
    this.listeners.clear();
  }

  /**
   * 检查是否已连接
   */
  isConnected() {
    return this.connected;
  }

  /**
   * 获取 socket 实例
   */
  getSocket() {
    return this.socket;
  }
}

// 创建单例
const socketService = new SocketService();

export default socketService;
