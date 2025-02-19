import { Router } from 'express';
import {
  getAdminNotifications,
  deleteAdminNotification,
  getAdminNotificationDetails,
  addAdminNotification,
  resendAdminNotification,
  getUserIdsByFilters,
} from '../controllers/adminNotificationController';

const router = Router();

router.get('/notifications', getAdminNotifications);
router.get('/notifications/:id', getAdminNotificationDetails);
router.post('/notifications', addAdminNotification);
router.post('/notifications/resend/:id', resendAdminNotification);
router.delete('/notifications/:id', deleteAdminNotification);
router.get('/ids', getUserIdsByFilters);

export default router;
