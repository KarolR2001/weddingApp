// src/routes/filterRoutes.ts

import { Router } from 'express';
import { getFiltersByServiceCategory } from '../controllers/filterController';

const router = Router();

// Endpoint do pobierania filtrów dla danej kategorii usług
router.get('/:serviceCategoryId', getFiltersByServiceCategory);

export default router;
