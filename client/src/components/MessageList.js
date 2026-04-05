import React, { useEffect, useRef } from 'react';
import { formatTime, formatFileSize } from '../utils/format';
import { File as FileIcon, Download } from 'lucide-react';
import '../styles/App.css';

/**
 * 消息列表组件
 * 显示聊天消息
 */
function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  /**
   * 自动滚动到底部
   */
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  /**
   * 当有新消息时自动滚动
   */
  useEffect(() => {
    // 只有当消息数量增加时才自动滚动
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom(true);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  /**
   * 首次加载时滚动到底部
   */
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  /**
   * 渲染文件附件
   */
  const renderFileAttachment = (message) => {
    if (message.type === 'image' && message.fileUrl) {
      return (
        <img
          src={message.fileUrl}
          alt={message.fileName || '图片'}
          className="message-image"
          loading="lazy"
        />
      );
    }

    if (message.type === 'file' && message.fileUrl) {
      return (
        <div className="message-file">
          <FileIcon size={20} style={{ color: 'var(--primary-color)' }} />
          <div>
            <div className="file-name">{message.fileName || '文件'}</div>
            <div className="file-size">
              {formatFileSize(message.fileSize)}
            </div>
          </div>
          <a
            href={message.fileUrl}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
            }}
          >
            <Download size={18} style={{ color: 'var(--primary-color)' }} />
          </a>
        </div>
      );
    }

    return null;
  };

  /**
   * 渲染单条消息
   */
  const renderMessage = (message, index) => {
    if (message.type === 'system') {
      return (
        <div key={message.id || index} className="system-message">
          {message.content}
        </div>
      );
    }

    const isOwn = message.userId === currentUserId;

    return (
      <div key={message.id || index} className="message-group">
        <div className={`message-content ${isOwn ? 'own' : 'other'}`}>
          {!isOwn && (
            <div className="message-header">
              <img
                src={message.avatar}
                alt={message.username}
                className="user-avatar"
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '4px'
                }}
              />
              <span className="message-sender">{message.username}</span>
            </div>
          )}
          {message.content && <div>{message.content}</div>}
          {renderFileAttachment(message)}
          <div
            className="message-time"
            style={{
              fontSize: '11px',
              opacity: 0.7,
              marginTop: '4px',
              textAlign: isOwn ? 'right' : 'left'
            }}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)'
          }}
        >
          <p>暂无消息</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            发送第一条消息开始聊天吧
          </p>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
