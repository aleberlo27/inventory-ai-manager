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

  // eslint-disable-next-line sonarjs/no-unused-vars
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user.id) };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileData): Promise<SafeUser> {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new AppError('Email already in use', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, avatar: true, createdAt: true },
  });
  return user;
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });
  if (!user) throw new AppError('User not found', 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect', 401);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
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
