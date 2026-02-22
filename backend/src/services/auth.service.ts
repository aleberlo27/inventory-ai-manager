import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already exists', 409);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, password: hashedPassword, name: data.name },
    select: { id: true, email: true, name: true, avatar: true, createdAt: true },
  });

  return { user, token: generateToken(user.id) };
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true, email: true, password: true, name: true, avatar: true, createdAt: true },
  });
  if (!user) throw new AppError('Invalid credentials', 401);

  const isValid = await bcrypt.compare(credentials.password, user.password);
  if (!isValid) throw new AppError('Invalid credentials', 401);

  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user.id) };
}

export async function validateToken(token: string): Promise<SafeUser> {
  let payload: { userId: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch {
    throw new AppError('Invalid token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, avatar: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 401);
  return user;
}
