import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';
import socketClient from '../../../lib/socket/client';
import { channelsApi, conversationsApi, type Channel, type Conversation, type Message } from '../../../lib/api/endpoints';
import { Avatar, Button } from '../../../components/ui';
import {
  Hash,
  MessageCircle,
  Search,
  LogOut,
  Moon,
  Sun,
  Plus,
  ChevronDown,
  ChevronRight,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Pin,
  SmilePlus,
  Edit2,
  Trash2,
} from 'lucide-react';

export function ChatLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [channelsData, conversationsData] = await Promise.all([
          channelsApi.getAll(),
          conversationsApi.getAll(),
        ]);
        setChannels(channelsData);
        setConversations(conversationsData);

        // Auto-select first channel if available
        if (channelsData.length > 0) {
          selectChannel(channelsData[0]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Socket event listeners
  useEffect(() => {
    socketClient.connect();

    const handleMessageNew = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleMessageEdited = ({ id, content, editedAt }: { id: string; content: string; editedAt: number }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, content, editedAt } : msg
        )
      );
    };

    const handleMessageDeleted = ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const handleTypingUpdate = (_data: { channelId?: string; conversationId?: string; users: unknown[] }) => {
      // Could show typing indicator
    };

    socketClient.on('message:new', handleMessageNew as (data: unknown) => void);
    socketClient.on('message:edited', handleMessageEdited as (data: unknown) => void);
    socketClient.on('message:deleted', handleMessageDeleted as (data: unknown) => void);
    socketClient.on('typing:update', handleTypingUpdate as (data: unknown) => void);

    return () => {
      socketClient.off('message:new', handleMessageNew as (data: unknown) => void);
      socketClient.off('message:edited', handleMessageEdited as (data: unknown) => void);
      socketClient.off('message:deleted', handleMessageDeleted as (data: unknown) => void);
      socketClient.off('typing:update', handleTypingUpdate as (data: unknown) => void);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChannel = async (channel: Channel): Promise<void> => {
    setActiveChannel(channel);
    setActiveConversation(null);
    setIsLoading(true);

    try {
      const result = await channelsApi.getMessages(channel.id);
      if (result && 'messages' in result) {
        setMessages(result.messages as Message[]);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }

    // Join socket room
    socketClient.emit('channel:join', { id: channel.id });
  };

  const selectConversation = async (conversation: Conversation): Promise<void> => {
    setActiveConversation(conversation);
    setActiveChannel(null);
    setIsLoading(true);

    try {
      const result = await conversationsApi.getMessages(conversation.id);
      if (result && 'messages' in result) {
        setMessages(result.messages as Message[]);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }

    // Join socket room
    socketClient.emit('conversation:join', { id: conversation.id });
  };

  const sendMessage = (): void => {
    if (!inputValue.trim()) return;

    const payload: Record<string, unknown> = {
      content: inputValue.trim(),
      type: 'TEXT',
    };

    if (activeChannel) {
      payload.channelId = activeChannel.id;
    } else if (activeConversation) {
      payload.conversationId = activeConversation.id;
    }

    socketClient.emit('message:send', payload as Parameters<typeof socketClient.emit>[1]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  const roomName = activeChannel ? `#${activeChannel.name}` : 'Direct Messages';
  const roomIcon = activeChannel ? <Hash size={18} /> : <MessageCircle size={18} />;

  return (
    <div className="h-screen flex bg-primary">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-gray-800 flex flex-col transition-all duration-200`}
      >
        {/* Workspace Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-700">
          {!sidebarCollapsed && (
            <h1 className="font-bold text-white">ChatReal</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </button>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Channels Header */}
          <div
            className="px-4 flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setShowChannels(!showChannels)}
          >
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Channels
              </span>
            )}
            {!sidebarCollapsed && (
              <button className="p-1 rounded hover:bg-gray-700">
                <Plus size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Channel List */}
          {showChannels && (
            <div className="space-y-1 px-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => selectChannel(channel)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    activeChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Hash size={16} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{channel.name}</span>}
                </button>
              ))}
            </div>
          )}

          {/* DMs Header */}
          <div
            className="px-4 flex items-center justify-between mt-6 mb-2 cursor-pointer"
            onClick={() => setShowDMs(!showDMs)}
          >
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Direct Messages
              </span>
            )}
          </div>

          {/* DM List */}
          {showDMs && (
            <div className="space-y-1 px-2">
              {conversations.map((conv) => {
                const otherUser = conv.participants.find((p) => p.id !== user?.id);
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <Avatar
                      src={otherUser?.avatar}
                      alt={otherUser?.username}
                      size="sm"
                      status={otherUser?.status === 'ONLINE' ? 'online' : 'offline'}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{otherUser?.username}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              size="sm"
              status="online"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun size={16} className="text-gray-400" />
                  ) : (
                    <Moon size={16} className="text-gray-400" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-secondary">
        {/* Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            {roomIcon}
            <h2 className="font-semibold text-gray-900">{roomName}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-64 pl-9 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Actions */}
            <Button variant="ghost" size="icon">
              <MoreVertical size={18} />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={48} className="mb-4 opacity-20" />
              <p>No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.sender.id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${roomName}`}
                className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-lg resize-none focus:ring-2 focus:ring-primary/20"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-200 transition-colors">
                  <Smile size={20} className="text-gray-400" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-200 transition-colors">
                  <Paperclip size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="flex-shrink-0"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Message Item Component
interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

function MessageItem({ message, isOwn }: MessageItemProps): JSX.Element {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="group flex gap-4 hover:bg-gray-50/50 -mx-4 px-4 py-2 rounded-lg transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar
        src={message.sender.avatar}
        alt={message.sender.username}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900">
            {message.sender.username}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
          {message.editedAt && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

        <div className={`mt-1 ${isOwn ? 'text-white' : 'text-gray-700'}`}>
          {message.type === 'TEXT' && <p>{message.content}</p>}
          {message.type === 'IMAGE' && message.content && (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-md rounded-lg mt-2"
            />
          )}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">{reaction.count}</span>
              </button>
            ))}
            <button className="inline-flex items-center px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors">
              <SmilePlus size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Add reaction">
            <SmilePlus size={16} className="text-gray-500" />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Pin message">
            <Pin size={16} className="text-gray-500" />
          </button>
          {isOwn && (
            <>
              <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Edit">
                <Edit2 size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Delete">
                <Trash2 size={16} className="text-gray-500" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
