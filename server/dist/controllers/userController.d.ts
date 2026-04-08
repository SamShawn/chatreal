import { Response } from 'express';
/**
 * Get all users
 * GET /api/v1/users
 */
export declare const getUsers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
export declare const getUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Update user
 * PATCH /api/v1/users/:id
 */
export declare const updateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Ban user
 * POST /api/v1/users/:id/ban
 */
export declare const banUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Unban user
 * POST /api/v1/users/:id/unban
 */
export declare const unbanUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get audit logs
 * GET /api/v1/admin/logs
 */
export declare const getAuditLogs: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=userController.d.ts.map