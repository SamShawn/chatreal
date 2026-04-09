import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as authService from '../services/authService.js';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/index.js';

const prisma = new PrismaClient();

/**
 * Get all users
 * GET /api/v1/users
 */
export const getUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await authService.getUsers();

  res.json({
    success: true,
    data: users,
  });
});

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await authService.getUserById(id);

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * Update user
 * PATCH /api/v1/users/:id
 */
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { username, avatar } = req.body;

  // Only allow users to update themselves (or admin)
  if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Not authorized' });
    return;
  }

  const user = await authService.updateUser(id, { username, avatar });

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * Ban user
 * POST /api/v1/users/:id/ban
 */
export const banUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  const { id } = req.params;
  const { reason } = req.body;

  await authService.banUser(id, req.user.id, reason);

  res.json({
    success: true,
    message: 'User banned',
  });
});

/**
 * Unban user
 * POST /api/v1/users/:id/unban
 */
export const unbanUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  const { id } = req.params;

  await authService.unbanUser(id);

  res.json({
    success: true,
    message: 'User unbanned',
  });
});

/**
 * Get audit logs
 * GET /api/v1/admin/logs
 */
export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  const { limit = 50, page = 1 } = req.query;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  });

  const total = await prisma.auditLog.count();

  res.json({
    success: true,
    data: logs,
    total,
    page: Number(page),
    limit: Number(limit),
  });
});
