// src/routes/authRoutes.ts

import { Router } from 'express';
import { register, login, verifyUser, checkVerificationStatus } from '../controllers/authController';
import { sendEmail } from '../controllers/emailController';

const router = Router();

// Trasy autoryzacyjne
// Rejestracja użytkownika
router.post('/register', (req, res) => {
    register(req, res);
  });
  
  // Weryfikacja użytkownika
  router.get('/verify', (req, res) => {
    verifyUser(req, res);
  });
  router.get('/check-verification', checkVerificationStatus);
router.post('/login', login);
router.post('/send-email', sendEmail);

export default router;
