import { useState } from 'react';
import { Avatar, Badge } from '../../../components/ui';
import type { Channel, Conversation, User } from '../../../lib/api/endpoints';
import {
  Hash,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Search,
} from 'lucide-react';

interface ChannelSidebarProps {
  channels: Channel[];
  conversations: Conversation[];
  activeChannelId?: string;
  activeConversationId?: string;
  currentUser?: User | null;
  onlineUsers?: User[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectChannel: (channel: Channel) => void;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateChannel: () => void;
}

export function ChannelSidebar({
  channels,
  conversations,
  activeChannelId,
  activeConversationId,
  currentUser,
  onlineUsers = [],
  collapsed,
  onToggleCollapse,
  onSelectChannel,
  onSelectConversation,
  onCreateChannel,
}: ChannelSidebarProps): JSX.Element {
  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);

  const getUserStatus = (userId: string): 'online' | 'away' | 'dnd' | 'offline' => {
    const onlineUser = onlineUsers.find((u) => u.id === userId);
    return (onlineUser?.status?.toLowerCase() || 'offline') as 'online' | 'away' | 'dnd' | 'offline';
  };

  return (
    <aside
      className="h-full flex flex-col"
      style={{
        width: collapsed ? '64px' : '240px',
        backgroundColor: 'var(--color-elevated)',
        borderRight: '1px solid var(--color-border-subtle)',
        transition: 'width var(--duration-normal) var(--ease-out)',
      }}
    >
      {/* Header */}
      <div
        className="h-14 px-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        {!collapsed && (
          <h1 className="font-bold truncate" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
            ChatReal
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-[var(--radius-md)] transition-all hover:bg-surface"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-colors hover:bg-surface"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Search size={16} />
            <span style={{ fontSize: 'var(--text-sm)' }}>Search...</span>
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Channels section */}
        <div className="px-3 mb-2">
          <button
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface transition-colors"
            onClick={() => setShowChannels(!showChannels)}
          >
            {!collapsed && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}
              >
                Channels
              </span>
            )}
            {collapsed ? (
              <Hash size={16} style={{ color: 'var(--color-text-muted)' }} />
            ) : (
              showChannels ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </button>
        </div>

        {showChannels && (
          <div className="space-y-0.5 px-2">
            {channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                collapsed={collapsed}
                onClick={() => onSelectChannel(channel)}
              />
            ))}
            <button
              onClick={onCreateChannel}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-md)] transition-all hover:bg-surface group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px dashed var(--color-border-visible)',
                }}
              >
                <Plus size={14} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              {!collapsed && (
                <span className="text-sm transition-colors" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Add channel
                </span>
              )}
            </button>
          </div>
        )}

        {/* DMs section */}
        <div className="px-3 mt-6 mb-2">
          <button
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface transition-colors"
            onClick={() => setShowDMs(!showDMs)}
          >
            {!collapsed && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}
              >
                Direct Messages
              </span>
            )}
            {collapsed ? (
              <MessageCircle size={16} style={{ color: 'var(--color-text-muted)' }} />
            ) : (
              showDMs ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </button>
        </div>

        {showDMs && (
          <div className="space-y-0.5 px-2">
            {conversations.map((conv) => {
              const otherUser = conv.participants.find((p) => p.id !== currentUser?.id);
              return (
                <DMItem
                  key={conv.id}
                  user={otherUser}
                  isActive={activeConversationId === conv.id}
                  collapsed={collapsed}
                  status={otherUser ? getUserStatus(otherUser.id) : 'offline'}
                  onClick={() => onSelectConversation(conv)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* User section */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3">
          <Avatar
            src={currentUser?.avatar}
            alt={currentUser?.username || 'User'}
            size="sm"
            status={currentUser ? getUserStatus(currentUser.id) : 'offline'}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                {currentUser?.username}
              </p>
              <p className="text-xs truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {currentUser?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1.5 rounded-[var(--radius-sm)] transition-colors hover:bg-surface" style={{ color: 'var(--color-text-secondary)' }}>
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function ChannelItem({ channel, isActive, collapsed, onClick }: ChannelItemProps): JSX.Element {
  const hasUnread = channel.unreadCount && channel.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-md)] transition-all"
      style={{
        backgroundColor: isActive ? 'var(--color-accent-subtle)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
      }}
    >
      <Hash size={16} style={{ color: hasUnread ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span className="truncate text-sm" style={{
            fontSize: 'var(--text-sm)',
            fontWeight: hasUnread ? 'var(--font-semibold)' : 'var(--font-normal)',
            color: hasUnread ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            flex: 1,
            textAlign: 'left' as const,
          }}>
            {channel.name}
          </span>
          {hasUnread && <Badge variant="accent" size="sm">{channel.unreadCount}</Badge>}
        </>
      )}
      {collapsed && hasUnread && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
      )}
    </button>
  );
}

interface DMItemProps {
  user?: User;
  isActive: boolean;
  collapsed: boolean;
  status: 'online' | 'away' | 'dnd' | 'offline';
  onClick: () => void;
}

function DMItem({ user, isActive, collapsed, status, onClick }: DMItemProps): JSX.Element {
  if (!user) return <></>;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-md)] transition-all"
      style={{
        backgroundColor: isActive ? 'var(--color-accent-subtle)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
      }}
    >
      <Avatar src={user.avatar} alt={user.username} size="sm" status={status} />
      {!collapsed && (
        <span className="truncate text-sm" style={{
          fontSize: 'var(--text-sm)',
          fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-normal)',
          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}>
          {user.username}
        </span>
      )}
    </button>
  );
}
