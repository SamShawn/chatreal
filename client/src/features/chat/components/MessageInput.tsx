import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Button } from '../../../components/ui';
import { Send, Smile, Paperclip, AtSign } from 'lucide-react';

interface MessageInputProps {
  placeholder?: string;
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function MessageInput({
  placeholder = 'Type a message...',
  onSend,
  onTypingStart,
  onTypingStop,
}: MessageInputProps): JSX.Element {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setValue(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Typing indicator
    onTypingStart?.();
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      onTypingStop?.();
    }, 2000);
  };

  const handleSend = (): void => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    onTypingStop?.();

    // Reset textarea height
    const textarea = document.querySelector('.message-input-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4" style={{ backgroundColor: 'var(--color-base)' }}>
      <div
        className="relative flex items-end gap-3 px-4 py-3 rounded-[var(--radius-xl)] transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${isFocused ? 'var(--color-accent)' : 'var(--color-border-visible)'}`,
          boxShadow: isFocused ? 'var(--shadow-glow)' : 'none',
        }}
      >
        {/* Left actions */}
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-elevated"
            style={{ color: 'var(--color-text-muted)' }}
            title="Add person"
          >
            <AtSign size={20} />
          </button>
          <button
            className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-elevated"
            style={{ color: 'var(--color-text-muted)' }}
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
          className="message-input-textarea flex-1 bg-transparent text-text-primary placeholder:text-text-muted resize-none focus:outline-none"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            minHeight: '24px',
            maxHeight: '160px',
          }}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-elevated"
            style={{ color: 'var(--color-text-muted)' }}
            title="Emoji"
          >
            <Smile size={20} />
          </button>
          <Button
            onClick={handleSend}
            disabled={!value.trim()}
            size="icon"
            variant="primary"
            className="flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>

      {/* Hint text */}
      <p className="mt-2 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-surface">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}
