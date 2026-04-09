import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

// All routes require authentication
router.use(authMiddleware);

// Users
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);

// Admin only
router.post('/:id/ban', rbacMiddleware('ADMIN'), userController.banUser);
router.post('/:id/unban', rbacMiddleware('ADMIN'), userController.unbanUser);
router.get('/admin/logs', rbacMiddleware('ADMIN'), userController.getAuditLogs);

export default router;
