import { Response } from 'express';
/**
 * Get all channels
 * GET /api/v1/channels
 */
export declare const getChannels: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Create a channel
 * POST /api/v1/channels
 */
export declare const createChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get channel by ID
 * GET /api/v1/channels/:id
 */
export declare const getChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Update channel
 * PATCH /api/v1/channels/:id
 */
export declare const updateChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete channel
 * DELETE /api/v1/channels/:id
 */
export declare const deleteChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Join channel
 * POST /api/v1/channels/:id/join
 */
export declare const joinChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Leave channel
 * POST /api/v1/channels/:id/leave
 */
export declare const leaveChannel: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get conversations
 * GET /api/v1/conversations
 */
export declare const getConversations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Create/get direct conversation
 * POST /api/v1/conversations
 */
export declare const createConversation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get messages for a channel
 * GET /api/v1/channels/:id/messages
 */
export declare const getChannelMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get messages for a conversation
 * GET /api/v1/conversations/:id/messages
 */
export declare const getConversationMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Send message (REST fallback)
 * POST /api/v1/messages
 */
export declare const sendMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Edit message
 * PATCH /api/v1/messages/:id
 */
export declare const editMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete message
 * DELETE /api/v1/messages/:id
 */
export declare const deleteMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Add reaction
 * POST /api/v1/messages/:id/reactions
 */
export declare const addReaction: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Pin message
 * POST /api/v1/messages/:id/pin
 */
export declare const pinMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Search messages
 * GET /api/v1/search/messages
 */
export declare const searchMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=chatController.d.ts.map