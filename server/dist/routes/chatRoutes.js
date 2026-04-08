import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
const router = Router();
// All routes require authentication
router.use(authMiddleware);
// Channels
router.get('/channels', chatController.getChannels);
router.post('/channels', validateBody('channel'), chatController.createChannel);
router.get('/channels/:id', chatController.getChannel);
router.patch('/channels/:id', chatController.updateChannel);
router.delete('/channels/:id', chatController.deleteChannel);
router.post('/channels/:id/join', chatController.joinChannel);
router.post('/channels/:id/leave', chatController.leaveChannel);
router.get('/channels/:id/messages', chatController.getChannelMessages);
// Conversations
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id/messages', chatController.getConversationMessages);
// Messages
router.post('/messages', validateBody('message'), chatController.sendMessage);
router.patch('/messages/:id', chatController.editMessage);
router.delete('/messages/:id', chatController.deleteMessage);
router.post('/messages/:id/reactions', chatController.addReaction);
router.post('/messages/:id/pin', chatController.pinMessage);
// Search
router.get('/search/messages', chatController.searchMessages);
export default router;
//# sourceMappingURL=chatRoutes.js.map