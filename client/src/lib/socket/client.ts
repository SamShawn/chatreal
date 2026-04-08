import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../api/client';

// WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// Event listener callback type
type EventCallback<T = unknown> = (data: T) => void;

/**
 * Socket client singleton
 */
class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(): Socket {
    if (this.socket && this.connected) {
      return this.socket;
    }

    const token = getAccessToken();

    this.socket = io(WS_URL, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.notifyListeners('socket:connected', undefined);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.connected = false;
      this.notifyListeners('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;
      this.notifyListeners('socket:error', { error: error.message });
    });

    // Forward socket events to registered listeners
    this.setupEventForwarding();

    return this.socket;
  }

  /**
   * Setup automatic event forwarding from socket to listeners
   */
  private setupEventForwarding(): void {
    if (!this.socket) return;

    const events = [
      'auth:success',
      'auth:error',
      'presence:changed',
      'message:new',
      'message:edited',
      'message:deleted',
      'message:reaction',
      'message:pinned',
      'typing:update',
      'conversation:updated',
      'channel:updated',
      'search:results',
      'error',
      'info',
    ];

    for (const event of events) {
      this.socket.on(event, (data) => {
        this.notifyListeners(event, data);
      });
    }
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: unknown): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[Socket] Not connected, cannot emit:', event);
    }
  }

  /**
   * Listen to server events
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Also register with socket if connected
    if (this.socket) {
      this.socket.on(event, callback as (data: unknown) => void);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback as (data: unknown) => void);
    }
  }

  /**
   * Remove all listeners for an event
   */
  offAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create and export singleton
const socketClient = new SocketClient();

export default socketClient;

