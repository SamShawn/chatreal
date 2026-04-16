import { useState, type ChangeEvent } from 'react';
import { Avatar, Button } from '../../../components/ui';
import type { Message } from '../../../lib/api/endpoints';
import { X, Send, Smile, Paperclip, MoreHorizontal } from 'lucide-react';

interface ThreadPanelProps {
  parentMessage: Message;
  onClose: () => void;
  onSendMessage?: (content: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function ThreadPanel({
  parentMessage,
  onClose,
  onSendMessage,
}: ThreadPanelProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');

  const handleSend = (): void => {
    if (!inputValue.trim()) return;
    onSendMessage?.(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="h-full flex flex-col animate-slide-right"
      style={{
        width: '400px',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderLeft: '1px solid var(--glass-border)',
        animationDuration: 'var(--duration-normal)',
        animationTimingFunction: 'var(--ease-out)',
      }}
    >
      {/* Header */}
      <div
        className="h-14 px-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <h3 className="font-semibold" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
          Thread
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-surface"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Close thread"
        >
          <X size={18} />
        </button>
      </div>

      {/* Parent message */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-elevated)' }}
      >
        <div className="flex gap-3">
          <Avatar src={parentMessage.sender.avatar} alt={parentMessage.sender.username} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                {parentMessage.sender.username}
              </span>
              <span className="text-xs" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {formatTimestamp(parentMessage.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {parentMessage.content}
            </p>
          </div>
        </div>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--color-text-muted)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <MoreHorizontal size={20} />
          </div>
          <p className="text-sm" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            No replies yet
          </p>
          <p className="text-xs mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Be the first to reply
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-elevated)' }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Reply..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-surface text-text-primary border rounded-[var(--radius-lg)] resize-none transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-text-muted"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-visible)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <button className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-elevated" style={{ color: 'var(--color-text-muted)' }}>
                <Smile size={18} />
              </button>
              <button className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-elevated" style={{ color: 'var(--color-text-muted)' }}>
                <Paperclip size={18} />
              </button>
            </div>
          </div>
          <Button onClick={handleSend} disabled={!inputValue.trim()} size="icon" variant="primary">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
