import { useState, useEffect, useCallback, useRef, type FormEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { Send, Search, X, Menu, Users, Upload } from 'lucide-react';
import MessageList from './MessageList';
import socketService from '../services/socket';
import { useChatStore } from '../store/chatStore';
import { isImageFile, validateFileSize } from '../utils/format';
import type { User, Message } from '../types';

interface ChatProps {
  user: User;
  onLogout: () => void;
}

// 默认房间ID
const DEFAULT_ROOM = 'general';

/**
 * 聊天主组件
 * 处理实时聊天、消息发送、文件上传等功能
 */
function Chat({ user }: ChatProps) {
  // 使用 Zustand store
  const {
    messages,
    onlineUsers,
    isConnected,
    isLoading,
    error,
    searchQuery,
    searchResults,
    showSearchResults,
    addMessage,
    setMessages,
    setOnlineUsers,
    setConnected,
    setLoading,
    setError,
    setSearchResults,
    setSearchQuery,
    setShowSearchResults,
  } = useChatStore();

  // 组件本地状态
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 防抖后的搜索函数 - 使用 useRef 实现真正的防抖
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        socketService.emit('message:search', {
          roomId: DEFAULT_ROOM,
          keyword: query.trim(),
        });
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }, 300);
  }, [setShowSearchResults, setSearchResults]);

  /**
   * 处理登录连接
   */
  useEffect(() => {
    // 连接 Socket
    socketService.connect(user.id);

    // 监听连接成功
    socketService.on('socket:connected', () => {
      setConnected(true);
      socketService.emit('user:join', {
        username: user.username,
        avatar: user.avatar,
      });
    });

    // 监听断开连接
    socketService.on('socket:disconnected', () => {
      setConnected(false);
      setError('连接已断开');
    });

    // 监听加入成功
    socketService.on('user:join:success', (data: unknown) => {
      const response = data as { onlineUsers: User[] };
      setLoading(false);
      setOnlineUsers(response.onlineUsers || []);

      // 加入默认房间
      socketService.emit('room:join', { roomId: DEFAULT_ROOM });

      // 请求历史消息
      socketService.emit('room:history', {
        roomId: DEFAULT_ROOM,
        limit: 50,
      });
    });

    // 监听其他用户加入
    socketService.on('user:joined', (data: unknown) => {
      const response = data as { onlineUsers: User[]; username: string };
      setOnlineUsers(response.onlineUsers || []);

      // 添加系统消息
      addMessage({
        id: `system-${Date.now()}`,
        type: 'system',
        content: `${response.username} 加入了聊天`,
        sender: { id: 'system', username: '系统', avatar: '' },
        timestamp: Date.now(),
      });
    });

    // 监听用户离开
    socketService.on('user:left', (data: unknown) => {
      const response = data as { onlineUsers: User[] };
      setOnlineUsers(response.onlineUsers || []);
    });

    // 监听新消息
    socketService.on('message:new', (data: unknown) => {
      const message = data as Message;
      addMessage(message);

      // 如果正在显示搜索结果，重新搜索以包含新消息
      if (showSearchResults && searchQuery.trim()) {
        debouncedSearch(searchQuery);
      }
    });

    // 监听历史消息
    socketService.on('room:history:result', (data: unknown) => {
      const response = data as { messages: Message[] };
      setMessages(response.messages || []);
      setLoading(false);
    });

    // 监听搜索结果
    socketService.on('message:search:result', (data: unknown) => {
      const response = data as { messages: Message[] };
      setSearchResults(response.messages || []);
    });

    // 监听错误
    socketService.on('socket:error', (data: unknown) => {
      const errorData = data as { message?: string };
      setError(errorData.message || '发生错误');
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [user.id, user.username, user.avatar, showSearchResults, searchQuery, debouncedSearch, setConnected, setLoading, setOnlineUsers, setError, addMessage, setMessages, setSearchResults]);

  /**
   * 处理消息发送
   */
  const handleSendMessage = () => {
    const content = inputValue.trim();
    if (!content) return;

    socketService.emit('message:send', {
      roomId: DEFAULT_ROOM,
      content,
      type: 'text',
    });

    setInputValue('');
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (file: File) => {
    // 验证文件大小
    if (!validateFileSize(file.size, 10 * 1024 * 1024)) {
      setError('文件大小不能超过10MB');
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'X-File-Name': file.name,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json() as { fileUrl: string; fileName: string; fileSize: number };

      // 发送文件消息
      const messageType = isImageFile(file.name) ? 'image' : 'file';
      socketService.emit('message:send', {
        roomId: DEFAULT_ROOM,
        type: messageType,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      });
    } catch {
      setError('文件上传失败');
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  };

  /**
   * 处理搜索输入
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  /**
   * 处理输入框回车
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 当前显示的消息
  const displayMessages = showSearchResults ? searchResults : messages;

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="chat-app">
      {/* 侧边栏遮罩 */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 侧边栏 */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="btn btn-secondary btn-icon hidden md:block"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
          <h2 className="sidebar-title">在线用户</h2>
        </div>

        <div className="online-section">
          <div className="online-header">
            <span className="online-title">聊天室</span>
            <span className="online-count">{onlineUsers.length}</span>
          </div>

          <div className="user-list">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="user-item">
                <img
                  src={onlineUser.avatar}
                  alt={onlineUser.username}
                  className="user-avatar"
                />
                <span className="user-name">{onlineUser.username}</span>
                <div className="user-status" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="chat-main">
        {/* 聊天头部 */}
        <header className="chat-header">
          <div className="room-info">
            <button
              className="btn btn-secondary btn-icon md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h3 className="room-name">公共聊天室</h3>
            <div className="flex gap-2">
              <Users size={18} className="text-gray-500" />
              <span className="text-gray-500 text-sm">
                {onlineUsers.length}
              </span>
            </div>
          </div>

          <div className="chat-actions">
            <div className="search-box relative">
              <Search size={16} className="search-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="search-input pl-9"
                placeholder="搜索消息..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="btn btn-icon !w-6 !h-6 !p-0 absolute right-1"
                  onClick={clearSearch}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 消息列表 */}
        <MessageList
          messages={displayMessages}
          currentUserId={user.id}
          messagesEndRef={messagesEndRef}
        />

        {/* 输入区域 */}
        <div className="chat-input-area">
          <div className="input-container">
            <textarea
              className="message-input"
              placeholder={showSearchResults ? '搜索模式' : '输入消息...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress as unknown as (e: FormEvent<HTMLTextAreaElement>) => void}
              disabled={showSearchResults}
              rows={1}
            />

            <div className="input-actions">
              <input
                type="file"
                id="file-upload"
                className="file-input"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="file-btn cursor-pointer"
                title="上传文件"
              >
                <Upload size={20} />
              </label>

              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || showSearchResults}
                title="发送消息"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 错误提示 */}
      {error && (
        <div
          className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-3 rounded-lg z-[1000] animate-pulse"
        >
          {error}
          <button
            onClick={() => setError('')}
            className="bg-transparent border-none text-white ml-2 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 连接状态指示 */}
      {!isConnected && (
        <div
          className="fixed top-5 right-5 bg-orange-400 text-white px-3 py-2 rounded-md text-xs z-[1000]"
        >
          连接已断开
        </div>
      )}
    </div>
  );
}

export default Chat;