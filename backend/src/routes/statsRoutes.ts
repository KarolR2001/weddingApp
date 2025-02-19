import { Router } from 'express';
import { getAllSystemStats } from '../controllers/systemStatsController';

const router = Router();

// Endpoint do pobierania wszystkich statystyk systemowych
router.get('/', getAllSystemStats);

export default router;
