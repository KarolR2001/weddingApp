import { Router } from 'express';
import { 
  updateUser, 
  getUserDetails, 
  updateNotificationSetting, 
  updateUserStatus ,
  getUsers
} from '../controllers/userController';
import { authUserMiddleware } from '../middleware/authUserMiddleware';

const router = Router();

// Ścieżka do pobierania listy użytkowników z paginacją
router.get('/', getUsers);

// Aktualizacja danych użytkownika
router.put('/update', authUserMiddleware, updateUser);

// Pobranie szczegółowych danych użytkownika
router.get('/:userId/details', authUserMiddleware, getUserDetails);

// Aktualizacja ustawień powiadomień użytkownika
router.put('/update-setting', authUserMiddleware, updateNotificationSetting);

// Zmiana statusu użytkownika
router.put('/status', authUserMiddleware, updateUserStatus);

export default router;
