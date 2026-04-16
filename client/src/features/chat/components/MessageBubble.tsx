import { useState } from 'react';
import { useUIStore } from '../../../stores/uiStore';
import { Avatar } from '../../../components/ui';
import type { Message } from '../../../lib/api/endpoints';
import {
  SmilePlus,
  Pin,
  Edit2,
  Trash2,
  MoreHorizontal,
  CornerUpRight,
} from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps): JSX.Element {
  const [showActions, setShowActions] = useState(false);
  const openThread = useUIStore((state) => state.openThread);

  const handleOpenThread = (): void => {
    openThread(message.id);
  };

  return (
    <div
      className="group relative flex gap-4 px-4 py-2 -mx-4 hover:bg-[var(--color-surface)] rounded-lg transition-all duration-[var(--duration-fast)]"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar
        src={message.sender.avatar}
        alt={message.sender.username}
        size="md"
      />

      <div className="flex-1 min-w-0">
        {/* Header: username + timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="font-semibold text-[var(--color-text-primary)]"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {message.sender.username}
          </span>
          <span
            className="text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)]"
          >
            {formatTime(message.createdAt)}
          </span>
          {message.editedAt && (
            <span className="text-xs text-[var(--color-text-muted)]">(edited)</span>
          )}
        </div>

        {/* Message content bubble */}
        <div
          className={`
            relative px-4 py-2.5 rounded-[18px] max-w-[72%]
            ${isOwn
              ? 'text-white rounded-br-sm'
              : 'bg-[var(--color-surface)] border border-[var(--color-border-visible)] text-[var(--color-text-primary)] rounded-bl-sm'
            }
          `}
          style={isOwn ? {
            background: 'var(--color-accent-gradient)',
            borderBottomLeftRadius: '4px',
          } : undefined}
        >
          {/* Own messages have accent gradient left border */}
          {isOwn && (
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[18px]"
              style={{ background: 'var(--color-accent)' }}
            />
          )}

          {message.type === 'TEXT' && (
            <p
              className="text-[var(--text-sm)] leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: isOwn ? 'white' : 'var(--color-text-primary)' }}
            >
              {message.content}
            </p>
          )}

          {message.type === 'IMAGE' && message.content && (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-md rounded-lg mt-2"
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          )}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                className="badge-base inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors hover:bg-[var(--color-accent-subtle)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border-visible)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
            <button
              className="badge-base inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors hover:bg-[var(--color-accent-subtle)]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-visible)',
                color: 'var(--color-text-muted)',
              }}
            >
              <SmilePlus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Action toolbar — appears on hover */}
      <div
        className={`
          absolute top-2 right-4 flex items-center gap-0.5 p-1 rounded-lg
          transition-all duration-[var(--duration-fast)]
          ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
        `}
        style={{
          backgroundColor: 'var(--color-elevated)',
          border: '1px solid var(--color-border-visible)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <button
          className="p-1.5 rounded-md hover:bg-[var(--color-surface)] transition-colors"
          title="Add reaction"
        >
          <SmilePlus size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-[var(--color-surface)] transition-colors"
          title="Reply in thread"
          onClick={handleOpenThread}
        >
          <CornerUpRight size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        {isOwn && (
          <>
            <button className="p-1.5 rounded-md hover:bg-[var(--color-surface)] transition-colors" title="Edit">
              <Edit2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-[var(--color-surface)] transition-colors" title="Delete">
              <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
            </button>
          </>
        )}
        <button className="p-1.5 rounded-md hover:bg-[var(--color-surface)] transition-colors" title="More">
          <MoreHorizontal size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </div>
  );
}