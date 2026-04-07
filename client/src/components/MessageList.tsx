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
 * 消息列表组件
 * 显示聊天消息
 */
function MessageList({ messages, currentUserId, messagesEndRef }: MessageListProps) {
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
          alt={message.fileName || '图片'}
          className="message-image"
          loading="lazy"
        />
      );
    }

    if (message.type === 'file' && message.fileUrl) {
      return (
        <div className="message-file">
          <FileIcon size={20} className="text-primary" />
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
            className="ml-auto"
          >
            <Download size={18} className="text-primary" />
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
    // 生成唯一 key：优先使用 message.id，否则使用 index + timestamp 确保唯一性
    // 使用 Date.now() + Math.random() 作为最终 fallback，确保即使 timestamp 为 0 也能生成唯一 key
    const messageKey = message.id || `msg-${index}-${message.timestamp || Date.now() + Math.random()}`;

    // 安全检查：确保消息有有效的 sender
    if (!message.sender || !message.sender.id) {
      console.warn('Invalid message: missing sender', message);
      return (
        <div key={messageKey} className="system-message">
          [无效消息]
        </div>
      );
    }

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
          {!isOwn && (
            <div className="message-header">
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="user-avatar w-6 h-6 mr-1"
              />
              <span className="message-sender">{message.sender.username}</span>
            </div>
          )}
          {message.content && <div>{message.content}</div>}
          {renderFileAttachment(message)}
          <div
            className={`message-time text-[11px] opacity-70 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}
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
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
          <p>暂无消息</p>
          <p className="text-[13px] mt-2">发送第一条消息开始聊天吧</p>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;