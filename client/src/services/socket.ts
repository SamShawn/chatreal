import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Socket.IO 客户端封装类
 * 管理 WebSocket 连接和事件
 */
class SocketService {
  private socket: Socket | null = null;
  private connected = false;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  /**
   * 连接到服务器
   */
  connect(_userId: string): Socket {
    // 如果已经连接，直接触发回调
    if (this.socket && this.connected) {
      this.emit('socket:connected', undefined);
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] connect event fired, socket.id:', this.socket?.id);
      this.connected = true;
      this.emit('socket:connected', undefined);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      this.emit('socket:disconnected', undefined);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket:error', error);
    });

    return this.socket;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * 发送事件
   */
  emit(event: string, data: unknown): void {
    // 优先处理自定义事件（通过 listeners）
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach((callback) => callback(data));
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
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback as (data: unknown) => void);
    }
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback: (data: unknown) => void): void {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      listeners?.delete(callback);

      if (listeners?.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback as (data: unknown) => void);
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        if (this.socket) {
          this.socket.off('', callback as (data: unknown) => void);
        }
      });
    });
    this.listeners.clear();
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 获取 socket 实例
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// 创建单例
const socketService = new SocketService();

export default socketService;