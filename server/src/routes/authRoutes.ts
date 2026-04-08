import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

// Public routes
router.post('/register', validateBody('register'), authController.register);
router.post('/login', validateBody('login'), authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.patch('/profile', authMiddleware, authController.updateProfile);

export default router;
