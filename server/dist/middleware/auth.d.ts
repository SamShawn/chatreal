import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, SafeUser } from '../types/index.js';
declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}
/**
 * JWT Authentication Middleware
 * Verifies the JWT token and attaches user to request
 */
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional auth middleware - doesn't fail if no token
 */
export declare const optionalAuthMiddleware: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Role-based access control middleware
 */
export declare const rbacMiddleware: (...allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map