import { Router } from 'express';
import { modifyCalendar } from '../controllers/calendarController';
import { authVendorMiddleware } from '../middleware/authVendorMiddleware';

const router = Router();

router.post('/modify', authVendorMiddleware, modifyCalendar);

export default router;
