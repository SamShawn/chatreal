import React, { useState, useEffect, useCallback } from 'react';
import { Send, Search, X, Menu, Users, Upload } from 'lucide-react';
import MessageList from './MessageList';
import socketService from '../services/socket';
import { debounce, isImageFile, validateFileSize } from '../utils/format';
import './styles/App.css';

// 默认房间ID
const DEFAULT_ROOM = 'general';

/**
 * 聊天主组件
 * 处理实时聊天、消息发送、文件上传等功能
 */
function Chat({ user }) {
  // 状态管理
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 防抖后的搜索函数
  const debouncedSearch = useCallback(
    debounce((query) => {
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
    }, 300),
    []
  );

  /**
   * 处理登录连接
   */
  useEffect(() => {
    // 连接 Socket
    const socket = socketService.connect();

    // 监听连接成功
    socketService.on('socket:connected', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    // 监听断开连接
    socketService.on('socket:disconnected', () => {
      setIsConnected(false);
      setError('连接已断开');
    });

    // 发送用户加入事件
    socketService.emit('user:join', {
      username: user.username,
      avatar: user.avatar,
    });

    // 监听加入成功
    socketService.on('user:join:success', (data) => {
      setIsLoading(false);
      setOnlineUsers(data.onlineUsers || []);
      console.log('User joined successfully');

      // 加入默认房间
      socketService.emit('room:join', { roomId: DEFAULT_ROOM });

      // 请求历史消息
      socketService.emit('room:history', {
        roomId: DEFAULT_ROOM,
        limit: 50,
      });
    });

    // 监听其他用户加入
    socketService.on('user:joined', (data) => {
      setOnlineUsers(data.onlineUsers || []);

      // 添加系统消息
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: `${data.username} 加入了聊天`,
          timestamp: Date.now(),
        }
      ]);
    });

    // 监听用户离开
    socketService.on('user:left', (data) => {
      setOnlineUsers(data.onlineUsers || []);
    });

    // 监听新消息
    socketService.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);

      // 如果正在显示搜索结果，重新搜索以包含新消息
      if (showSearchResults && searchQuery.trim()) {
        debouncedSearch(searchQuery);
      }
    });

    // 监听历史消息
    socketService.on('room:history:result', (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    // 监听搜索结果
    socketService.on('message:search:result', (data) => {
      setSearchResults(data.messages || []);
    });

    // 监听房间加入成功
    socketService.on('room:join:success', (data) => {
      console.log('Joined room:', data.roomId);
    });

    // 监听错误
    socketService.on('socket:error', (errorData) => {
      setError(errorData.message || '发生错误');
      console.error('Socket error:', errorData);
    });

    return () => {
      // 清理事件监听
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [user.username, user.avatar, showSearchResults, searchQuery, debouncedSearch]);

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
  const handleFileUpload = async (file) => {
    // 验证文件大小
    if (!validateFileSize(file.size, 10 * 1024 * 1024)) {
      setError('文件大小不能超过10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 使用 fetch 上传文件
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-File-Name': file.name,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();

      // 发送文件消息
      const messageType = isImageFile(file.name) ? 'image' : 'file';
      socketService.emit('message:send', {
        roomId: DEFAULT_ROOM,
        type: messageType,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      });
    } catch (error) {
      setError('文件上传失败');
      console.error('Upload error:', error);
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e) => {
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
  const handleSearchChange = (e) => {
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
  const handleKeyPress = (e) => {
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
        <div className="loading" style={{ width: 40, height: 40 }} />
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
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setIsSidebarOpen(false)}
            style={{ display: 'none' }} // 仅在移动端显示
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
              <div key={onlineUser.userId} className="user-item">
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
      </div>

      {/* 主聊天区域 */}
      <div className="chat-main">
        {/* 聊天头部 */}
        <div className="chat-header">
          <div className="room-info">
            <button
              className="btn btn-secondary btn-icon"
              onClick={() => setIsSidebarOpen(true)}
              style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
            >
              <Menu size={20} />
            </button>
            <h3 className="room-name">公共聊天室</h3>
            <div className="flex gap-sm">
              <Users size={18} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {onlineUsers.length}
              </span>
            </div>
          </div>

          <div className="chat-actions">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="搜索消息..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="btn btn-icon"
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    width: 24,
                    height: 24,
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <MessageList
          messages={displayMessages}
          currentUserId={user.userId}
        />

        {/* 输入区域 */}
        <div className="chat-input-area">
          <div className="input-container">
            <textarea
              className="message-input"
              placeholder={showSearchResults ? '搜索模式' : '输入消息...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
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
                className="file-btn"
                title="上传文件"
                style={{ cursor: 'pointer' }}
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
      </div>

      {/* 错误提示 */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--danger-color)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}
        >
          {error}
          <button
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: '8px',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 连接状态指示 */}
      {!isConnected && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--warning-color)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 1000
          }}
        >
          连接已断开
        </div>
      )}
    </div>
  );
}

export default Chat;
