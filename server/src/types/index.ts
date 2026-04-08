import { User, Channel, Message, Conversation, Membership } from '@prisma/client';

// Re-export Prisma types
export type { User, Channel, Message, Conversation, Membership };

// User with computed fields (without password)
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
  createdAt: Date;
  updatedAt: Date;
}

// User creation
export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
}

// Login
export interface LoginInput {
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// API Request with user
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

// Socket data attached to socket connection
export interface SocketUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
  role: string;
}

// Socket events
export interface ClientToServerEvents {
  // Authentication
  'auth:login': (data: { token: string }) => void;
  'auth:logout': () => void;

  // Presence
  'presence:update': (data: { status: 'ONLINE' | 'AWAY' | 'DND' }) => void;
  'presence:list': () => void;

  // Messaging
  'message:send': (data: SendMessagePayload) => void;
  'message:edit': (data: { id: string; content: string }) => void;
  'message:delete': (data: { id: string }) => void;
  'message:react': (data: { id: string; emoji: string }) => void;
  'message:pin': (data: { id: string }) => void;
  'message:unpin': (data: { id: string }) => void;

  // Typing
  'typing:start': (data: { conversationId?: string; channelId?: string }) => void;
  'typing:stop': (data: { conversationId?: string; channelId?: string }) => void;

  // Conversations
  'conversation:join': (data: { id: string }) => void;
  'conversation:leave': (data: { id: string }) => void;

  // Channels
  'channel:join': (data: { id: string }) => void;
  'channel:leave': (data: { id: string }) => void;

  // Search
  'search:messages': (data: { query: string; conversationId?: string; channelId?: string }) => void;
}

export interface ServerToClientEvents {
  // Auth
  'auth:success': (data: { user: SocketUser }) => void;
  'auth:error': (data: { message: string }) => void;

  // Presence
  'presence:changed': (data: { userId: string; status: string; users: SocketUser[] }) => void;

  // Messages
  'message:new': (data: MessagePayload) => void;
  'message:edited': (data: { id: string; content: string; editedAt: number }) => void;
  'message:deleted': (data: { id: string }) => void;
  'message:reaction': (data: { id: string; reactions: ReactionPayload[] }) => void;
  'message:pinned': (data: { id: string; pinnedAt: number }) => void;

  // Typing
  'typing:update': (data: { conversationId?: string; channelId?: string; users: TypingUser[] }) => void;

  // Conversations
  'conversation:updated': (data: Partial<Conversation> & { id: string }) => void;
  'conversation:member:joined': (data: { conversationId: string; user: SocketUser }) => void;
  'conversation:member:left': (data: { conversationId: string; userId: string }) => void;

  // Channels
  'channel:updated': (data: Partial<Channel> & { id: string }) => void;
  'channel:member:joined': (data: { channelId: string; user: SocketUser; membership: Membership }) => void;
  'channel:member:left': (data: { channelId: string; userId: string }) => void;

  // Search
  'search:results': (data: { messages: MessagePayload[]; total: number }) => void;

  // System
  'error': (data: { code: string; message: string }) => void;
  'info': (data: { message: string }) => void;
}

// Payload types
export interface SendMessagePayload {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  conversationId?: string;
  channelId?: string;
  replyToId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface MessagePayload {
  id: string;
  content: string;
  contentHtml?: string | null;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  sender: SocketUser;
  channelId?: string | null;
  conversationId?: string | null;
  threadId?: string | null;
  replyCount: number;
  editedAt?: number | null;
  pinnedAt?: number | null;
  reactions: ReactionPayload[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface ReactionPayload {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface TypingUser {
  id: string;
  username: string;
  avatar: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string;
}
