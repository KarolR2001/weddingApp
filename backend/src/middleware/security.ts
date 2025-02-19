import helmet from 'helmet';
import csurf from 'csurf';
import { rateLimit } from 'express-rate-limit';

export const securityMiddleware = [
  helmet(), // Zabezpieczenie nagłówków HTTP
  csurf({ cookie: true }), // CSRF token
];

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 75, // Maksymalnie 5 prób logowania na IP
  message: 'Zbyt wiele prób logowania. Spróbuj ponownie później.',
});
