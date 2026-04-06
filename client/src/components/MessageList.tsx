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
            className="ml-auto"
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
  const renderMessage = (message: Message, index: number) => {
    if (message.type === 'system') {
      return (
        <div key={message.id || index} className="system-message">
          {message.content}
        </div>
      );
    }

    const isOwn = message.sender.id === currentUserId;

    return (
      <div key={message.id || index} className="message-group">
        <div className={`message-content ${isOwn ? 'own' : 'other'}`}>
          {!isOwn && (
            <div className="message-header">
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="user-avatar"
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '4px'
                }}
              />
              <span className="message-sender">{message.sender.username}</span>
            </div>
          )}
          {message.content && <div>{message.content}</div>}
          {renderFileAttachment(message)}
          <div
            className="message-time text-[11px] opacity-70 mt-1"
            style={{ textAlign: isOwn ? 'right' : 'left' }}
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