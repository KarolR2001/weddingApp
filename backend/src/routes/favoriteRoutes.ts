import { Router } from 'express';
import { addFavorite, removeFavorite, isFavorite, getFavorites } from '../controllers/favoriteController';

const router = Router();

// Trasa dodawania ulubionych
router.post('/add', addFavorite);

// Trasa usuwania ulubionych
router.post('/remove', removeFavorite);

// Trasa sprawdzania, czy ogłoszenie jest ulubione
router.get('/:userId/:listingId', isFavorite);

router.get('/:userId', getFavorites);

export default router;
