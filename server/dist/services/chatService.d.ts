import { MessageType } from '@prisma/client';
import type { SocketUser, MessagePayload, ReactionPayload } from '../types/index.js';
/**
 * Attach user to socket
 */
export declare const attachUserToSocket: (socketId: string, user: SocketUser) => void;
/**
 * Detach user from socket
 */
export declare const detachUserFromSocket: (socketId: string) => SocketUser | null;
/**
 * Get user by socket ID
 */
export declare const getUserBySocketId: (socketId: string) => SocketUser | null;
/**
 * Get user by ID
 */
export declare const getUserById: (userId: string) => Promise<SocketUser | null>;
/**
 * Get all online users
 */
export declare const getOnlineUsers: () => SocketUser[];
/**
 * Get online users in a specific room
 */
export declare const getOnlineUsersInRoom: (roomId: string, io: any) => SocketUser[];
/**
 * Start typing indicator
 */
export declare const startTyping: (roomId: string, userId: string) => void;
/**
 * Stop typing indicator
 */
export declare const stopTyping: (roomId: string, userId: string) => void;
/**
 * Get typing users in a room
 */
export declare const getTypingUsers: (roomId: string) => SocketUser[];
/**
 * Convert Prisma message to MessagePayload
 */
export declare const messageToPayload: (message: any) => Promise<MessagePayload>;
/**
 * Save message to database
 */
export declare const saveMessage: (data: {
    content: string;
    contentHtml?: string;
    type: MessageType;
    senderId: string;
    channelId?: string;
    conversationId?: string;
    replyToId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}) => Promise<MessagePayload>;
/**
 * Edit message
 */
export declare const editMessage: (messageId: string, content: string, contentHtml?: string) => Promise<MessagePayload>;
/**
 * Delete message (soft delete)
 */
export declare const deleteMessage: (messageId: string) => Promise<void>;
/**
 * Pin/unpin message
 */
export declare const togglePinMessage: (messageId: string, pinnedById: string) => Promise<{
    pinned: boolean;
    pinnedAt: number;
}>;
/**
 * Add reaction to message
 */
export declare const toggleReaction: (messageId: string, userId: string, emoji: string) => Promise<ReactionPayload[]>;
/**
 * Get message history for a channel
 */
export declare const getChannelMessages: (channelId: string, cursor?: string, limit?: number) => Promise<{
    messages: MessagePayload[];
    nextCursor?: string;
}>;
/**
 * Get message history for a conversation
 */
export declare const getConversationMessages: (conversationId: string, cursor?: string, limit?: number) => Promise<{
    messages: MessagePayload[];
    nextCursor?: string;
}>;
/**
 * Search messages
 */
export declare const searchMessages: (query: string, options?: {
    channelId?: string;
    conversationId?: string;
    limit?: number;
}) => Promise<{
    messages: MessagePayload[];
    total: number;
}>;
//# sourceMappingURL=chatService.d.ts.map