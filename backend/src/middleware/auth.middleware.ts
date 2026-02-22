import { Request, Response, NextFunction } from 'express';
import { validateToken, SafeUser } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided', statusCode: 401 });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = await validateToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token', statusCode: 401 });
  }
}
