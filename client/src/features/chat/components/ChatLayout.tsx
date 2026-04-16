import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';
import socketClient from '../../../lib/socket/client';
import { useChatStore } from '../../../store/chatStore';
import { useUIStore } from '../../../stores/uiStore';
import { channelsApi, conversationsApi, type Channel, type Conversation, type Message } from '../../../lib/api/endpoints';
import { Avatar, Button } from '../../../components/ui';
import { usePresence } from '../hooks/usePresence';
import { useResponsive } from '../hooks/useResponsive';
import { ThreadPanel } from './ThreadPanel';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChannelSidebar } from './ChannelSidebar';
import { CreateChannelModal } from '../../channels/components/CreateChannelModal';
import {
  Search,
  MoreVertical,
} from 'lucide-react';

export function ChatLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const threadMessageId = useUIStore((state) => state.threadMessageId);
  const closeThread = useUIStore((state) => state.closeThread);
  const openModal = useUIStore((state) => state.openModal);

  // Enable presence tracking
  usePresence();

  // Enable responsive detection
  useResponsive();

  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Find thread parent message
  const threadMessage = messages.find((m) => m.id === threadMessageId) || null;

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

  const roomName = activeChannel ? `#${activeChannel.name}` : activeConversation
    ? (activeConversation.participants.find((p) => p.id !== user?.id)?.username || 'Direct Messages')
    : 'Select a channel';

  return (
    <div
      className="h-screen flex"
      style={{ backgroundColor: 'var(--color-base)' }}
    >
      {/* Sidebar - using ChannelSidebar component */}
      <ChannelSidebar
        channels={channels}
        conversations={conversations}
        activeChannel={activeChannel}
        activeConversation={activeConversation}
        onSelectChannel={selectChannel}
        onSelectConversation={selectConversation}
        currentUser={user}
        onlineUsers={onlineUsers}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        resolvedTheme={resolvedTheme}
      />

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: 'var(--color-elevated)',
          borderLeft: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Header */}
        <header
          className="h-14 px-6 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-elevated)',
          }}
        >
          <div className="flex items-center gap-3">
            {activeChannel && (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {/* Hash icon would go here */}
              </span>
            )}
            <h2
              className="font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {roomName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-64 pl-9 pr-4 py-2 text-sm rounded-lg transition-all duration-[var(--duration-fast)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
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
              <div
                className="spinner"
                style={{
                  borderColor: 'var(--color-border-default)',
                  borderTopColor: 'var(--color-accent)',
                }}
              />
            </div>
          ) : messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                {/* MessageCircle icon placeholder */}
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>No messages yet</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Be the first to send a message!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender.id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - using MessageInput component */}
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={handleKeyPress}
          onSend={sendMessage}
          placeholder={`Message ${roomName}`}
        />
      </main>

      {/* Thread Panel */}
      {threadMessage && (
        <ThreadPanel
          parentMessage={threadMessage}
          onClose={closeThread}
        />
      )}

      {/* Modals */}
      <CreateChannelModal />
    </div>
  );
}