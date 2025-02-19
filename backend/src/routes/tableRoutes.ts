import { Router } from 'express';
import {
  addTable,
  getTablesWithGuests,
  editTable,
  removeTable,
  assignGuestToTable,
  removeGuestFromTable,
  getGuestsWithoutTable,
} from '../controllers/tableController';
import { authCoupleMiddleware } from '../middleware/authCoupleMiddleware';

const router = Router();

// Endpointy dla stołów
router.post('/add', authCoupleMiddleware, addTable);
router.get('/:coupleId', authCoupleMiddleware, getTablesWithGuests);
router.put('/:tableId', authCoupleMiddleware, editTable);
router.delete('/:tableId', authCoupleMiddleware, removeTable);

// Endpointy dla przypisywania gości
router.post('/assign', authCoupleMiddleware, assignGuestToTable);
router.post('/remove-assignment', authCoupleMiddleware, removeGuestFromTable);
router.get('/guests/:coupleId/without-table', authCoupleMiddleware, getGuestsWithoutTable);

export default router;
