import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as authService from '../services/authService.js';
import * as chatService from '../services/chatService.js';
/**
 * Initialize Socket.IO handlers
 */
export const initializeSocket = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jwt.verify(token, config.jwtSecret);
            const user = await authService.getUserById(decoded.userId);
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                status: user.status,
                role: user.role,
            };
            next();
        }
        catch (error) {
            console.error('Socket auth error:', error);
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        if (!socket.user)
            return;
        const user = socket.user;
        console.log(`User connected: ${user.username} (${socket.id})`);
        // Attach user to socket
        chatService.attachUserToSocket(socket.id, user);
        // Update user status to online
        authService.updateUserStatus(user.id, 'ONLINE');
        // Notify others of presence
        socket.broadcast.emit('presence:changed', {
            userId: user.id,
            status: 'ONLINE',
            users: chatService.getOnlineUsers(),
        });
        // Join user's personal room for direct messages
        socket.join(`user:${user.id}`);
        // Send confirmation
        socket.emit('auth:success', { user });
        // ===== MESSAGE HANDLERS =====
        /**
         * Send a message
         */
        socket.on('message:send', async (data) => {
            try {
                const { content, type = 'TEXT', conversationId, channelId, replyToId, fileUrl, fileName, fileSize } = data;
                const message = await chatService.saveMessage({
                    content,
                    type,
                    senderId: user.id,
                    channelId,
                    conversationId,
                    replyToId,
                    fileUrl,
                    fileName,
                    fileSize,
                });
                // Broadcast to appropriate room
                if (channelId) {
                    io.to(channelId).emit('message:new', message);
                }
                else if (conversationId) {
                    io.to(conversationId).emit('message:new', message);
                }
            }
            catch (error) {
                console.error('Message send error:', error);
                socket.emit('error', { code: 'MESSAGE_ERROR', message: 'Failed to send message' });
            }
        });
        /**
         * Edit a message
         */
        socket.on('message:edit', async (data) => {
            try {
                const { id, content } = data;
                const message = await chatService.editMessage(id, content);
                // Broadcast to room
                if (message.channelId) {
                    io.to(message.channelId).emit('message:edited', {
                        id,
                        content: message.content,
                        editedAt: message.editedAt,
                    });
                }
                else if (message.conversationId) {
                    io.to(message.conversationId).emit('message:edited', {
                        id,
                        content: message.content,
                        editedAt: message.editedAt,
                    });
                }
            }
            catch (error) {
                console.error('Message edit error:', error);
                socket.emit('error', { code: 'EDIT_ERROR', message: 'Failed to edit message' });
            }
        });
        /**
         * Delete a message
         */
        socket.on('message:delete', async (data) => {
            try {
                const { id } = data;
                await chatService.deleteMessage(id);
                // Broadcast deletion (message will be hidden in UI)
                socket.broadcast.emit('message:deleted', { id });
            }
            catch (error) {
                console.error('Message delete error:', error);
                socket.emit('error', { code: 'DELETE_ERROR', message: 'Failed to delete message' });
            }
        });
        /**
         * Add/remove reaction
         */
        socket.on('message:react', async (data) => {
            try {
                const { id, emoji } = data;
                const reactions = await chatService.toggleReaction(id, user.id, emoji);
                // Broadcast reaction update
                socket.broadcast.emit('message:reaction', { id, reactions });
            }
            catch (error) {
                console.error('Reaction error:', error);
                socket.emit('error', { code: 'REACTION_ERROR', message: 'Failed to add reaction' });
            }
        });
        /**
         * Pin/unpin message
         */
        socket.on('message:pin', async (data) => {
            try {
                const { id } = data;
                const result = await chatService.togglePinMessage(id, user.id);
                socket.broadcast.emit('message:pinned', { id, pinnedAt: result.pinnedAt });
            }
            catch (error) {
                console.error('Pin error:', error);
                socket.emit('error', { code: 'PIN_ERROR', message: 'Failed to pin message' });
            }
        });
        // ===== TYPING HANDLERS =====
        /**
         * Start typing
         */
        socket.on('typing:start', (data) => {
            const { conversationId, channelId } = data;
            const roomId = conversationId || channelId;
            if (!roomId)
                return;
            chatService.startTyping(roomId, user.id);
            // Broadcast typing indicator
            const typingUsers = chatService.getTypingUsers(roomId);
            io.to(roomId).emit('typing:update', { conversationId, channelId, users: typingUsers });
        });
        /**
         * Stop typing
         */
        socket.on('typing:stop', (data) => {
            const { conversationId, channelId } = data;
            const roomId = conversationId || channelId;
            if (!roomId)
                return;
            chatService.stopTyping(roomId, user.id);
            // Broadcast typing indicator
            const typingUsers = chatService.getTypingUsers(roomId);
            io.to(roomId).emit('typing:update', { conversationId, channelId, users: typingUsers });
        });
        // ===== PRESENCE HANDLERS =====
        /**
         * Update presence status
         */
        socket.on('presence:update', async (data) => {
            try {
                const { status } = data;
                await authService.updateUserStatus(user.id, status);
                socket.broadcast.emit('presence:changed', {
                    userId: user.id,
                    status,
                    users: chatService.getOnlineUsers(),
                });
            }
            catch (error) {
                console.error('Presence update error:', error);
            }
        });
        // ===== ROOM HANDLERS =====
        /**
         * Join channel
         */
        socket.on('channel:join', (data) => {
            const { id } = data;
            socket.join(id);
            console.log(`${user.username} joined channel ${id}`);
        });
        /**
         * Leave channel
         */
        socket.on('channel:leave', (data) => {
            const { id } = data;
            socket.leave(id);
            console.log(`${user.username} left channel ${id}`);
        });
        /**
         * Join conversation
         */
        socket.on('conversation:join', (data) => {
            const { id } = data;
            socket.join(id);
        });
        /**
         * Leave conversation
         */
        socket.on('conversation:leave', (data) => {
            const { id } = data;
            socket.leave(id);
        });
        // ===== SEARCH HANDLERS =====
        /**
         * Search messages
         */
        socket.on('search:messages', async (data) => {
            try {
                const { query, conversationId, channelId } = data;
                const result = await chatService.searchMessages(query, {
                    conversationId,
                    channelId,
                });
                socket.emit('search:results', result);
            }
            catch (error) {
                console.error('Search error:', error);
                socket.emit('error', { code: 'SEARCH_ERROR', message: 'Search failed' });
            }
        });
        // ===== DISCONNECT HANDLER =====
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.username} (${socket.id})`);
            // Detach user from socket
            chatService.detachUserFromSocket(socket.id);
            // Update user status to offline
            authService.updateUserStatus(user.id, 'OFFLINE');
            // Notify others
            io.emit('presence:changed', {
                userId: user.id,
                status: 'OFFLINE',
                users: chatService.getOnlineUsers(),
            });
        });
    });
};
//# sourceMappingURL=index.js.map