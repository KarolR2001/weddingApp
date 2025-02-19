// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { getCategoryNames, getCategoryDetails, getCategoryById } from '../controllers/categoryController';

const router = Router();

router.get('/names', getCategoryNames); // Zwraca tylko nazwy kategorii
router.get('/details', getCategoryDetails); // Zwraca szczegóły wszystkich kategorii
router.get('/:id', getCategoryById); // Zwraca szczegóły jednej kategorii na podstawie ID

export default router;
