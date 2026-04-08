import { User, Channel, Message, Conversation, Membership } from '@prisma/client';
export type { User, Channel, Message, Conversation, Membership };
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
export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: SafeUser;
}
export interface SocketUser {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
    role: string;
}
export interface ClientToServerEvents {
    'auth:login': (data: {
        token: string;
    }) => void;
    'auth:logout': () => void;
    'presence:update': (data: {
        status: 'ONLINE' | 'AWAY' | 'DND';
    }) => void;
    'presence:list': () => void;
    'message:send': (data: SendMessagePayload) => void;
    'message:edit': (data: {
        id: string;
        content: string;
    }) => void;
    'message:delete': (data: {
        id: string;
    }) => void;
    'message:react': (data: {
        id: string;
        emoji: string;
    }) => void;
    'message:pin': (data: {
        id: string;
    }) => void;
    'message:unpin': (data: {
        id: string;
    }) => void;
    'typing:start': (data: {
        conversationId?: string;
        channelId?: string;
    }) => void;
    'typing:stop': (data: {
        conversationId?: string;
        channelId?: string;
    }) => void;
    'conversation:join': (data: {
        id: string;
    }) => void;
    'conversation:leave': (data: {
        id: string;
    }) => void;
    'channel:join': (data: {
        id: string;
    }) => void;
    'channel:leave': (data: {
        id: string;
    }) => void;
    'search:messages': (data: {
        query: string;
        conversationId?: string;
        channelId?: string;
    }) => void;
}
export interface ServerToClientEvents {
    'auth:success': (data: {
        user: SocketUser;
    }) => void;
    'auth:error': (data: {
        message: string;
    }) => void;
    'presence:changed': (data: {
        userId: string;
        status: string;
        users: SocketUser[];
    }) => void;
    'message:new': (data: MessagePayload) => void;
    'message:edited': (data: {
        id: string;
        content: string;
        editedAt: number;
    }) => void;
    'message:deleted': (data: {
        id: string;
    }) => void;
    'message:reaction': (data: {
        id: string;
        reactions: ReactionPayload[];
    }) => void;
    'message:pinned': (data: {
        id: string;
        pinnedAt: number;
    }) => void;
    'typing:update': (data: {
        conversationId?: string;
        channelId?: string;
        users: TypingUser[];
    }) => void;
    'conversation:updated': (data: Partial<Conversation> & {
        id: string;
    }) => void;
    'conversation:member:joined': (data: {
        conversationId: string;
        user: SocketUser;
    }) => void;
    'conversation:member:left': (data: {
        conversationId: string;
        userId: string;
    }) => void;
    'channel:updated': (data: Partial<Channel> & {
        id: string;
    }) => void;
    'channel:member:joined': (data: {
        channelId: string;
        user: SocketUser;
        membership: Membership;
    }) => void;
    'channel:member:left': (data: {
        channelId: string;
        userId: string;
    }) => void;
    'search:results': (data: {
        messages: MessagePayload[];
        total: number;
    }) => void;
    'error': (data: {
        code: string;
        message: string;
    }) => void;
    'info': (data: {
        message: string;
    }) => void;
}
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
//# sourceMappingURL=index.d.ts.map