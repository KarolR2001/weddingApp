import { Router } from 'express';
import {
  createOrUpdateConversation,
  getAllConversations,
  markConversationAsRead,
  getMessagesForConversation,
  getConversationsByListing
} from '../controllers/conversationController';

const router = Router();

// Routes
router.post('/message', createOrUpdateConversation);
router.get('/:userId', getAllConversations);
router.get('/:conversationId/messages', getMessagesForConversation);
router.put('/:conversationId/read', markConversationAsRead);
router.get('/listing/:listingId/user/:userId', getConversationsByListing);

export default router;
