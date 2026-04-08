import { get, post, patch, del } from './client';
import type { PaginatedResponse } from './client';

// Types
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
  avatar?: string;
  owner: { id: string; username: string; avatar: string };
  memberCount?: number;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: SafeUser[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  contentHtml?: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  sender: SafeUser;
  channelId?: string;
  conversationId?: string;
  threadId?: string;
  replyCount: number;
  editedAt?: number;
  pinnedAt?: number;
  reactions: Reaction[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken?: string;
}

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string }): Promise<AuthResponse> =>
    post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }): Promise<AuthResponse> =>
    post<AuthResponse>('/auth/login', data),

  logout: (): Promise<void> =>
    post<void>('/auth/logout'),

  refresh: (): Promise<AuthResponse> =>
    post<AuthResponse>('/auth/refresh'),

  me: (): Promise<{ user: SafeUser }> =>
    get<{ user: SafeUser }>('/auth/me'),

  updateProfile: (data: { username?: string; avatar?: string }): Promise<{ user: SafeUser }> =>
    patch<{ user: SafeUser }>('/auth/profile', data),
};

// Users API
export const usersApi = {
  getAll: (): Promise<SafeUser[]> =>
    get<SafeUser[]>('/users'),

  getById: (id: string): Promise<{ user: SafeUser }> =>
    get<{ user: SafeUser }>(`/users/${id}`),

  update: (id: string, data: { username?: string; avatar?: string }): Promise<{ user: SafeUser }> =>
    patch<{ user: SafeUser }>(`/users/${id}`, data),

  ban: (id: string, reason?: string): Promise<void> =>
    post<void>(`/users/${id}/ban`, { reason }),

  unban: (id: string): Promise<void> =>
    post<void>(`/users/${id}/unban`),
};

// Channels API
export const channelsApi = {
  getAll: (): Promise<Channel[]> =>
    get<Channel[]>('/channels'),

  getById: (id: string): Promise<{ channel: Channel; members: SafeUser[] }> =>
    get<{ channel: Channel; members: SafeUser[] }>(`/channels/${id}`),

  create: (data: { name: string; description?: string; type?: string }): Promise<{ channel: Channel }> =>
    post<{ channel: Channel }>('/channels', data),

  update: (id: string, data: { name?: string; description?: string }): Promise<{ channel: Channel }> =>
    patch<{ channel: Channel }>(`/channels/${id}`, data),

  delete: (id: string): Promise<void> =>
    del<void>(`/channels/${id}`),

  join: (id: string): Promise<void> =>
    post<void>(`/channels/${id}/join`),

  leave: (id: string): Promise<void> =>
    post<void>(`/channels/${id}/leave`),

  getMessages: (id: string, cursor?: string, limit = 50): Promise<PaginatedResponse<Message>> =>
    get<PaginatedResponse<Message>>(`/channels/${id}/messages`, { cursor, limit }),
};

// Conversations API
export const conversationsApi = {
  getAll: (): Promise<Conversation[]> =>
    get<Conversation[]>('/conversations'),

  create: (participantId: string): Promise<Conversation> =>
    post<Conversation>('/conversations', { participantId }),

  getMessages: (id: string, cursor?: string, limit = 50): Promise<PaginatedResponse<Message>> =>
    get<PaginatedResponse<Message>>(`/conversations/${id}/messages`, { cursor, limit }),
};

// Messages API
export const messagesApi = {
  send: (data: {
    content: string;
    type?: string;
    channelId?: string;
    conversationId?: string;
    replyToId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }): Promise<{ message: Message }> =>
    post<{ message: Message }>('/messages', data),

  edit: (id: string, content: string): Promise<{ message: Message }> =>
    patch<{ message: Message }>(`/messages/${id}`, { content }),

  delete: (id: string): Promise<void> =>
    del<void>(`/messages/${id}`),

  addReaction: (id: string, emoji: string): Promise<{ reactions: Reaction[] }> =>
    post<{ reactions: Reaction[] }>(`/messages/${id}/reactions`, { emoji }),

  pin: (id: string): Promise<{ pinned: boolean }> =>
    post<{ pinned: boolean }>(`/messages/${id}/pin`),
};

// Search API
export const searchApi = {
  messages: (query: string, channelId?: string, conversationId?: string): Promise<Message[]> =>
    get<Message[]>('/search/messages', { q: query, channelId, conversationId }),
};
