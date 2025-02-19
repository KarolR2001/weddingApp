import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: JwtPayload | string;
}

export const authVendorMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ message: 'Brak tokenu. Zaloguj się, aby uzyskać dostęp.' });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (decoded.userType !== 'vendor') {
      res.status(403).json({ message: 'Brak uprawnień do tego zasobu.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Nieprawidłowy token.' });
  }
};
