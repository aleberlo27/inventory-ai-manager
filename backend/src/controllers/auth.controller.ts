import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      throw new AppError('Email, password and name are required', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const result = await registerUser({ email, password, name });
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await loginUser({ email, password });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export function getMe(req: Request, res: Response): void {
  res.status(200).json({ data: req.user });
}
