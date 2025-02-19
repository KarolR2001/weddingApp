import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead } from '../controllers/notificationController';

const router = Router();

// Pobieranie wszystkich powiadomień dla użytkownika
router.get('/:userId', getUserNotifications);

// Oznaczanie powiadomienia jako przeczytane
router.post('/mark-as-read', markNotificationAsRead);

export default router;
