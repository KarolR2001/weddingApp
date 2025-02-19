import { Router } from 'express';
import { addReview } from '../controllers/reviewController';

const router = Router();

// Endpoint do dodawania nowej opinii
router.post('/add', addReview);

export default router;
