import { useEffect, useRef, type RefObject } from 'react';
import { formatTime, formatFileSize } from '../utils/format';
import { File as FileIcon, Download } from 'lucide-react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: RefObject<HTMLDivElement>;
}

/**
 * 消息列表组件 - 粗野主义风格
 * 块状消息设计 + 裸露网格背景
 */
function MessageList({ messages, currentUserId, messagesEndRef }: MessageListProps) {
  const prevMessagesLengthRef = useRef(0);

  /**
   * 自动滚动到底部
   */
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  /**
   * 当有新消息时自动滚动
   */
  useEffect(() => {
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
  const renderFileAttachment = (message: Message) => {
    if (message.type === 'image' && message.fileUrl) {
      return (
        <img
          src={message.fileUrl}
          alt={message.fileName || 'IMAGE'}
          className="message-image"
          loading="lazy"
        />
      );
    }

    if (message.type === 'file' && message.fileUrl) {
      return (
        <div className="message-file">
          <FileIcon size={20} />
          <div>
            <div className="file-name">{message.fileName || 'FILE'}</div>
            <div className="file-size">
              {formatFileSize(message.fileSize)}
            </div>
          </div>
          <a
            href={message.fileUrl}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <Download size={18} />
          </a>
        </div>
      );
    }

    return null;
  };

  /**
   * 渲染单条消息
   */
  const renderMessage = (message: Message, index: number) => {
    // 生成唯一 key
    const messageKey = message.id || `msg-${index}-${message.timestamp || Date.now() + Math.random()}`;

    // 安全检查
    if (!message.sender || !message.sender.id) {
      console.warn('Invalid message: missing sender', message);
      return (
        <div key={messageKey} className="system-message">
          [INVALID MESSAGE]
        </div>
      );
    }

    // 系统消息
    if (message.type === 'system') {
      return (
        <div key={messageKey} className="system-message">
          {message.content}
        </div>
      );
    }

    const isOwn = message.sender.id === currentUserId;

    return (
      <div key={messageKey} className="message-group">
        <div className={`message-content ${isOwn ? 'own' : 'other'}`}>
          {/* 对方消息显示发送者信息 */}
          {!isOwn && (
            <div className="message-header">
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="user-avatar w-6 h-6 mr-2"
              />
              <span className="message-sender">{message.sender.username}</span>
            </div>
          )}
          {/* 消息内容 */}
          {message.content && <div className="whitespace-pre-wrap">{message.content}</div>}
          {/* 文件附件 */}
          {renderFileAttachment(message)}
          {/* 时间戳 - 粗野主义风格 */}
          <div
            className={`text-[10px] font-bold tracking-widest mt-2 ${isOwn ? 'text-right' : 'text-left'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            [{formatTime(message.timestamp)}]
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">NO MESSAGES YET</p>
          <p className="empty-state-hint">SEND THE FIRST MESSAGE</p>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;