import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as authService from '../services/authService.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, username, password } = req.body;

  const result = await authService.registerUser({ email, username, password });

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await authService.logoutUser(req.user.id);
  }

  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, error: 'No refresh token' });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const user = await authService.getUserById(req.user.id);

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
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { username, avatar } = req.body;
  const user = await authService.updateUser(req.user.id, { username, avatar });

  res.json({
    success: true,
    data: { user },
  });
});
