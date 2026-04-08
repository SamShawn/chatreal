import { Response } from 'express';
/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export declare const register: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Login user
 * POST /api/v1/auth/login
 */
export declare const login: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export declare const logout: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export declare const refresh: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get current user
 * GET /api/v1/auth/me
 */
export declare const me: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export declare const updateProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=authController.d.ts.map