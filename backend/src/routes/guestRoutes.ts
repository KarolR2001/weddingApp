import { Router } from 'express';
import {
  getGuestList,
  addGuest,
  updateGuest,
  removeGuest,
  addGroup,
  removeGroup,
  getGuestGroups,
  importGuestsXlsx,
  downloadTemplateXlsx,
} from '../controllers/guestController';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
const router = Router();
router.get('/template', downloadTemplateXlsx);
router.get('/:coupleId', getGuestList); // Pobranie listy gości
router.post('/add', addGuest); // Dodanie nowego gościa
router.put('/:guestId', updateGuest); // Aktualizacja danych gościa
router.delete('/:guestId', removeGuest); // Usunięcie gościa
router.post('/group/add', addGroup); // Dodanie nowej grupy
router.delete('/group/:groupId', removeGroup); // Usunięcie grupy
router.get('/groups/:coupleId', getGuestGroups);
router.post('/import', uploadMiddleware, importGuestsXlsx);


export default router;
