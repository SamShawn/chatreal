import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { X, Send, Smile, Paperclip } from 'lucide-react';
import { Avatar, Button } from '../../../components/ui';
import socketClient from '../../../lib/socket/client';
import type { Message } from '../../../lib/api/endpoints';

interface ThreadPanelProps {
  parentMessage: Message | null;
  onClose: () => void;
}

export function ThreadPanel({ parentMessage, onClose }: ThreadPanelProps): JSX.Element | null {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentMessage?.threadId) {
      loadThreadMessages();
    }
  }, [parentMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreadMessages = async (): Promise<void> => {
    if (!parentMessage?.threadId) return;
    setIsLoading(true);
    // TODO: Load thread messages from API
    setMessages([]); // Empty for now until API is implemented
    setIsLoading(false);
  };

  const sendMessage = (): void => {
    if (!inputValue.trim() || !parentMessage?.threadId) return;

    socketClient.emit('message:send', {
      content: inputValue.trim(),
      type: 'TEXT',
      threadId: parentMessage.threadId,
      replyToId: parentMessage.id,
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!parentMessage) return null;

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="w-80 h-full bg-secondary border-l border-[var(--border-default)] flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-default)]">
        <h3 className="font-semibold text-[var(--text-primary)]">Thread</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          <X size={18} className="text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Parent Message Preview */}
      <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
        <div className="flex gap-3">
          <Avatar
            src={parentMessage.sender.avatar || undefined}
            alt={parentMessage.sender.username}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-[var(--text-primary)]">
                {parentMessage.sender.username}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {formatTime(parentMessage.createdAt)}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
              {parentMessage.content}
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {parentMessage.replyCount || 0} replies
        </p>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <p className="text-sm">No replies yet</p>
            <p className="text-xs mt-1">Be the first to reply!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar
                  src={msg.sender.avatar || undefined}
                  alt={msg.sender.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-[var(--text-primary)]">
                      {msg.sender.username}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Reply to thread..."
              className="w-full px-3 py-2 pr-10 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors">
                <Smile size={16} className="text-[var(--text-muted)]" />
              </button>
              <button className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors">
                <Paperclip size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            size="sm"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
