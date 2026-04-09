import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { AuthenticatedRequest, JWTPayload, SafeUser } from '../types/index.js';

// Extend Express Request type
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
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

      // Attach user info to request (password excluded)
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: '', // Will be fetched if needed
        avatar: null,
        status: 'ONLINE',
        role: decoded.role as SafeUser['role'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      res.status(500).json({ error: 'Authentication error' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: '',
        avatar: null,
        status: 'ONLINE',
        role: decoded.role as SafeUser['role'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch {
      // Token invalid but optional, continue
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const rbacMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
