import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authUserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided.' });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};
