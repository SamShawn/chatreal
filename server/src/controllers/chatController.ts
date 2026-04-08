import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as chatService from '../services/chatService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { PrismaClient, ChannelType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all channels
 * GET /api/v1/channels
 */
export const getChannels = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const channels = await prisma.channel.findMany({
    where: { type: { not: ChannelType.DIRECT } },
    include: {
      owner: {
        select: { id: true, username: true, avatar: true },
      },
      _count: {
        select: { memberships: true, messages: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: channels.map((ch) => ({
      ...ch,
      memberCount: ch._count.memberships,
      messageCount: ch._count.messages,
    })),
  });
});

/**
 * Create a channel
 * POST /api/v1/channels
 */
export const createChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { name, description, type = 'PUBLIC' } = req.body;

  const channel = await prisma.channel.create({
    data: {
      name,
      description,
      type: type as ChannelType,
      ownerId: req.user.id,
      memberships: {
        create: {
          userId: req.user.id,
          role: 'OWNER',
        },
      },
    },
    include: {
      owner: {
        select: { id: true, username: true, avatar: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: { channel },
  });
});

/**
 * Get channel by ID
 * GET /api/v1/channels/:id
 */
export const getChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const channel = await prisma.channel.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, username: true, avatar: true },
      },
      memberships: {
        include: {
          user: {
            select: { id: true, username: true, avatar: true, status: true },
          },
        },
      },
    },
  });

  if (!channel) {
    res.status(404).json({ success: false, error: 'Channel not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...channel,
      members: channel.memberships.map((m) => m.user),
    },
  });
});

/**
 * Update channel
 * PATCH /api/v1/channels/:id
 */
export const updateChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  const { name, description } = req.body;

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    res.status(404).json({ success: false, error: 'Channel not found' });
    return;
  }

  // Check permissions (owner or admin)
  const membership = await prisma.membership.findUnique({
    where: { userId_channelId: { userId: req.user.id, channelId: id } },
  });

  if (channel.ownerId !== req.user.id && membership?.role !== 'ADMIN' && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Not authorized' });
    return;
  }

  const updated = await prisma.channel.update({
    where: { id },
    data: { name, description },
    include: {
      owner: {
        select: { id: true, username: true, avatar: true },
      },
    },
  });

  res.json({
    success: true,
    data: { channel: updated },
  });
});

/**
 * Delete channel
 * DELETE /api/v1/channels/:id
 */
export const deleteChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    res.status(404).json({ success: false, error: 'Channel not found' });
    return;
  }

  // Only owner or admin can delete
  if (channel.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Not authorized' });
    return;
  }

  await prisma.channel.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Channel deleted',
  });
});

/**
 * Join channel
 * POST /api/v1/channels/:id/join
 */
export const joinChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    res.status(404).json({ success: false, error: 'Channel not found' });
    return;
  }

  // Check if already a member
  const existing = await prisma.membership.findUnique({
    where: { userId_channelId: { userId: req.user.id, channelId: id } },
  });

  if (existing) {
    res.status(400).json({ success: false, error: 'Already a member' });
    return;
  }

  await prisma.membership.create({
    data: {
      userId: req.user.id,
      channelId: id,
      role: 'MEMBER',
    },
  });

  res.json({
    success: true,
    message: 'Joined channel',
  });
});

/**
 * Leave channel
 * POST /api/v1/channels/:id/leave
 */
export const leaveChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await prisma.membership.delete({
    where: { userId_channelId: { userId: req.user.id, channelId: id } },
  });

  res.json({
    success: true,
    message: 'Left channel',
  });
});

/**
 * Get conversations
 * GET /api/v1/conversations
 */
export const getConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: req.user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, avatar: true, status: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({
    success: true,
    data: conversations.map((conv) => ({
      id: conv.id,
      participants: conv.participants.map((p) => p.user),
      lastMessage: conv.messages[0] || null,
      updatedAt: conv.updatedAt,
    })),
  });
});

/**
 * Create/get direct conversation
 * POST /api/v1/conversations
 */
export const createConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { participantId } = req.body;

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: { userId: req.user.id },
          },
        },
        {
          participants: {
            some: { userId: participantId },
          },
        },
        {
          type: 'DIRECT',
        },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, avatar: true, status: true },
          },
        },
      },
    },
  });

  if (existing) {
    res.json({ success: true, data: existing });
    return;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: req.user.id },
          { userId: participantId },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, avatar: true, status: true },
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: conversation,
  });
});

/**
 * Get messages for a channel
 * GET /api/v1/channels/:id/messages
 */
export const getChannelMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { cursor, limit = 50 } = req.query;

  const result = await chatService.getChannelMessages(id, cursor as string, Number(limit));

  res.json({
    success: true,
    data: result.messages,
    nextCursor: result.nextCursor,
  });
});

/**
 * Get messages for a conversation
 * GET /api/v1/conversations/:id/messages
 */
export const getConversationMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { cursor, limit = 50 } = req.query;

  const result = await chatService.getConversationMessages(id, cursor as string, Number(limit));

  res.json({
    success: true,
    data: result.messages,
    nextCursor: result.nextCursor,
  });
});

/**
 * Send message (REST fallback)
 * POST /api/v1/messages
 */
export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { content, type = 'TEXT', channelId, conversationId, replyToId, fileUrl, fileName, fileSize } = req.body;

  const message = await chatService.saveMessage({
    content,
    type,
    senderId: req.user.id,
    channelId,
    conversationId,
    replyToId,
    fileUrl,
    fileName,
    fileSize,
  });

  res.status(201).json({
    success: true,
    data: { message },
  });
});

/**
 * Edit message
 * PATCH /api/v1/messages/:id
 */
export const editMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  const { content } = req.body;

  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Message not found' });
    return;
  }

  if (existing.senderId !== req.user.id) {
    res.status(403).json({ success: false, error: 'Not authorized' });
    return;
  }

  const message = await chatService.editMessage(id, content);

  res.json({
    success: true,
    data: { message },
  });
});

/**
 * Delete message
 * DELETE /api/v1/messages/:id
 */
export const deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Message not found' });
    return;
  }

  if (existing.senderId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Not authorized' });
    return;
  }

  await chatService.deleteMessage(id);

  res.json({
    success: true,
    message: 'Message deleted',
  });
});

/**
 * Add reaction
 * POST /api/v1/messages/:id/reactions
 */
export const addReaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  const { emoji } = req.body;

  const reactions = await chatService.toggleReaction(id, req.user.id, emoji);

  res.json({
    success: true,
    data: { reactions },
  });
});

/**
 * Pin message
 * POST /api/v1/messages/:id/pin
 */
export const pinMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const result = await chatService.togglePinMessage(id, req.user.id);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Search messages
 * GET /api/v1/search/messages
 */
export const searchMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { q, channelId, conversationId } = req.query;

  if (!q) {
    res.status(400).json({ success: false, error: 'Query required' });
    return;
  }

  const result = await chatService.searchMessages(q as string, {
    channelId: channelId as string,
    conversationId: conversationId as string,
  });

  res.json({
    success: true,
    data: result.messages,
    total: result.total,
  });
});
