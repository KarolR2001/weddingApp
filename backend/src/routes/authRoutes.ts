import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { register, login, verifyUser, checkVerificationStatus, googleCallback, completeGoogleRegistration } from '../controllers/authController';
import { sendEmail } from '../controllers/emailController';

const router = Router();

// Trasy autoryzacyjne
router.post('/register', (req, res) => register(req, res));
router.get('/verify', (req, res) => verifyUser(req, res));
router.get('/check-verification', checkVerificationStatus);
router.post('/login', login);
router.post('/send-email', sendEmail);

// Rozpoczęcie logowania z Google (bez userType)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Callback po autoryzacji Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// Finalizacja rejestracji Google
router.post('/google/complete', completeGoogleRegistration);

export default router;