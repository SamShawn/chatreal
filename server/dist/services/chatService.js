import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// In-memory storage for real-time data (consider Redis for production)
const userSockets = new Map(); // userId -> socketIds
const socketUsers = new Map(); // socketId -> SocketUser
const typingUsers = new Map(); // roomId -> (userId -> timeout)
/**
 * Attach user to socket
 */
export const attachUserToSocket = (socketId, user) => {
    socketUsers.set(socketId, user);
    const socketIds = userSockets.get(user.id) || [];
    if (!socketIds.includes(socketId)) {
        socketIds.push(socketId);
        userSockets.set(user.id, socketIds);
    }
};
/**
 * Detach user from socket
 */
export const detachUserFromSocket = (socketId) => {
    const user = socketUsers.get(socketId);
    if (!user)
        return null;
    socketUsers.delete(socketId);
    const socketIds = userSockets.get(user.id) || [];
    const index = socketIds.indexOf(socketId);
    if (index !== -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
            userSockets.delete(user.id);
        }
        else {
            userSockets.set(user.id, socketIds);
        }
    }
    return user;
};
/**
 * Get user by socket ID
 */
export const getUserBySocketId = (socketId) => {
    return socketUsers.get(socketId) || null;
};
/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        return null;
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: user.status,
        role: user.role,
    };
};
/**
 * Get all online users
 */
export const getOnlineUsers = () => {
    const users = new Map();
    for (const user of socketUsers.values()) {
        users.set(user.id, user);
    }
    return Array.from(users.values());
};
/**
 * Get online users in a specific room
 */
export const getOnlineUsersInRoom = (roomId, io) => {
    const sockets = io.sockets.adapter.rooms.get(roomId);
    if (!sockets)
        return [];
    const users = [];
    for (const socketId of sockets) {
        const user = socketUsers.get(socketId);
        if (user)
            users.push(user);
    }
    return users;
};
/**
 * Start typing indicator
 */
export const startTyping = (roomId, userId) => {
    const roomTyping = typingUsers.get(roomId) || new Map();
    typingUsers.set(roomId, roomTyping);
    // Clear existing timeout
    const existing = roomTyping.get(userId);
    if (existing)
        clearTimeout(existing);
    // Auto-stop after 5 seconds
    const timeout = setTimeout(() => {
        stopTyping(roomId, userId);
    }, 5000);
    roomTyping.set(userId, timeout);
};
/**
 * Stop typing indicator
 */
export const stopTyping = (roomId, userId) => {
    const roomTyping = typingUsers.get(roomId);
    if (!roomTyping)
        return;
    const timeout = roomTyping.get(userId);
    if (timeout) {
        clearTimeout(timeout);
        roomTyping.delete(userId);
    }
};
/**
 * Get typing users in a room
 */
export const getTypingUsers = (roomId) => {
    const roomTyping = typingUsers.get(roomId);
    if (!roomTyping)
        return [];
    const users = [];
    for (const userId of roomTyping.keys()) {
        const sockets = userSockets.get(userId);
        if (sockets && sockets.length > 0) {
            const user = socketUsers.get(sockets[0]);
            if (user)
                users.push(user);
        }
    }
    return users;
};
/**
 * Convert Prisma message to MessagePayload
 */
export const messageToPayload = async (message) => {
    // Get sender info
    const sender = await getUserById(message.senderId);
    if (!sender) {
        throw new Error('Sender not found');
    }
    // Get reactions with user counts
    const reactions = await prisma.reaction.groupBy({
        by: ['emoji'],
        where: { messageId: message.id },
        _count: { userId: true },
    });
    const reactionPayloads = await Promise.all(reactions.map(async (r) => {
        const users = await prisma.reaction.findMany({
            where: { messageId: message.id, emoji: r.emoji },
            select: { userId: true },
        });
        return {
            emoji: r.emoji,
            count: r._count.userId,
            userIds: users.map((u) => u.userId),
        };
    }));
    return {
        id: message.id,
        content: message.content,
        contentHtml: message.contentHtml,
        type: message.type,
        sender,
        channelId: message.channelId,
        conversationId: message.conversationId,
        threadId: message.threadId,
        replyCount: message.replyCount || 0,
        editedAt: message.editedAt ? message.editedAt.getTime() : null,
        pinnedAt: message.pinnedAt ? message.pinnedAt.getTime() : null,
        reactions: reactionPayloads,
        createdAt: message.createdAt.getTime(),
        updatedAt: message.updatedAt.getTime(),
        deletedAt: message.deletedAt ? message.deletedAt.getTime() : null,
    };
};
/**
 * Save message to database
 */
export const saveMessage = async (data) => {
    // Handle reply
    let threadId;
    if (data.replyToId) {
        const replyTo = await prisma.message.findUnique({
            where: { id: data.replyToId },
        });
        if (replyTo) {
            threadId = replyTo.threadId || replyTo.id;
            // Increment reply count
            await prisma.message.update({
                where: { id: replyTo.id },
                data: { replyCount: { increment: 1 } },
            });
        }
    }
    const message = await prisma.message.create({
        data: {
            content: data.content,
            contentHtml: data.contentHtml,
            type: data.type,
            senderId: data.senderId,
            channelId: data.channelId,
            conversationId: data.conversationId,
            threadId,
        },
    });
    return messageToPayload(message);
};
/**
 * Edit message
 */
export const editMessage = async (messageId, content, contentHtml) => {
    const message = await prisma.message.update({
        where: { id: messageId },
        data: {
            content,
            contentHtml,
            editedAt: new Date(),
        },
    });
    return messageToPayload(message);
};
/**
 * Delete message (soft delete)
 */
export const deleteMessage = async (messageId) => {
    await prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
    });
};
/**
 * Pin/unpin message
 */
export const togglePinMessage = async (messageId, pinnedById) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });
    if (!message)
        throw new Error('Message not found');
    const pinned = !message.pinnedAt;
    await prisma.message.update({
        where: { id: messageId },
        data: {
            pinnedAt: pinned ? new Date() : null,
            pinnedById: pinned ? pinnedById : null,
        },
    });
    return { pinned, pinnedAt: pinned ? Date.now() : 0 };
};
/**
 * Add reaction to message
 */
export const toggleReaction = async (messageId, userId, emoji) => {
    const existing = await prisma.reaction.findUnique({
        where: {
            userId_messageId_emoji: { userId, messageId, emoji },
        },
    });
    if (existing) {
        // Remove reaction
        await prisma.reaction.delete({
            where: { id: existing.id },
        });
    }
    else {
        // Add reaction
        await prisma.reaction.create({
            data: { userId, messageId, emoji },
        });
    }
    // Return updated reactions
    const reactions = await prisma.reaction.groupBy({
        by: ['emoji'],
        where: { messageId },
        _count: { userId: true },
    });
    const reactionPayloads = await Promise.all(reactions.map(async (r) => {
        const users = await prisma.reaction.findMany({
            where: { messageId, emoji: r.emoji },
            select: { userId: true },
        });
        return {
            emoji: r.emoji,
            count: r._count.userId,
            userIds: users.map((u) => u.userId),
        };
    }));
    return reactionPayloads;
};
/**
 * Get message history for a channel
 */
export const getChannelMessages = async (channelId, cursor, limit = 50) => {
    const messages = await prisma.message.findMany({
        where: {
            channelId,
            deletedAt: null,
            threadId: null, // Only top-level messages
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });
    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;
    const payloads = await Promise.all(results.map(messageToPayload));
    payloads.reverse(); // Oldest first for display
    return { messages: payloads, nextCursor };
};
/**
 * Get message history for a conversation
 */
export const getConversationMessages = async (conversationId, cursor, limit = 50) => {
    const messages = await prisma.message.findMany({
        where: {
            conversationId,
            deletedAt: null,
            threadId: null,
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });
    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;
    const payloads = await Promise.all(results.map(messageToPayload));
    payloads.reverse();
    return { messages: payloads, nextCursor };
};
/**
 * Search messages
 */
export const searchMessages = async (query, options) => {
    const where = {
        deletedAt: null,
        content: { contains: query, mode: 'insensitive' },
    };
    if (options?.channelId)
        where.channelId = options.channelId;
    if (options?.conversationId)
        where.conversationId = options.conversationId;
    const messages = await prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
    });
    const payloads = await Promise.all(messages.map(messageToPayload));
    return { messages: payloads, total: payloads.length };
};
//# sourceMappingURL=chatService.js.map