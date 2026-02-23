import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  validateToken,
  updateProfile,
  updatePassword,
} from '../src/services/auth.service';
import { AppError } from '../src/middleware/error.middleware';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;

process.env.JWT_SECRET = 'test-secret';

const mockSafeUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date('2024-01-01'),
};

describe('registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should register a new user and return user + token', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockSafeUser);

    const result = await registerUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should throw 409 if email already exists', async () => {
    mockFindUnique.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });

    await expect(
      registerUser({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should hash the password before saving', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockSafeUser);

    await registerUser({ email: 'test@example.com', password: 'password123', name: 'Test User' });

    const savedPassword = mockCreate.mock.calls[0][0].data.password as string;
    expect(savedPassword).not.toBe('password123');
    const isHashed = await bcrypt.compare('password123', savedPassword);
    expect(isHashed).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return user + token with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockFindUnique.mockResolvedValue({ ...mockSafeUser, password: hashedPassword });

    const result = await loginUser({ email: 'test@example.com', password: 'password123' });

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw 401 if email is not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'notfound@example.com', password: 'password123' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 401 if password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10);
    mockFindUnique.mockResolvedValue({ ...mockSafeUser, password: hashedPassword });

    await expect(
      loginUser({ email: 'test@example.com', password: 'wrong-password' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('validateToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return user for a valid token', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');
    mockFindUnique.mockResolvedValue(mockSafeUser);

    const user = await validateToken(token);

    expect(user.id).toBe('uuid-1');
    expect(user.email).toBe('test@example.com');
  });

  it('should throw 401 for an invalid token', async () => {
    await expect(validateToken('invalid.token.here')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 401 if user no longer exists', async () => {
    const token = jwt.sign({ userId: 'uuid-gone' }, 'test-secret');
    mockFindUnique.mockResolvedValue(null);

    await expect(validateToken(token)).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('updateProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the updated user when email is not in use', async () => {
    const updated = { ...mockSafeUser, name: 'New Name' };
    mockFindUnique.mockResolvedValue(null); // email not in use
    mockUpdate.mockResolvedValue(updated);

    const result = await updateProfile('uuid-1', { name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(result).not.toHaveProperty('password');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'uuid-1' } }),
    );
  });

  it('should throw 409 if email is already used by another user', async () => {
    mockFindUnique.mockResolvedValue({ id: 'uuid-2', email: 'taken@example.com' });

    await expect(
      updateProfile('uuid-1', { email: 'taken@example.com' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should allow updating to the same email as the current user', async () => {
    const updated = { ...mockSafeUser };
    mockFindUnique.mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });
    mockUpdate.mockResolvedValue(updated);

    const result = await updateProfile('uuid-1', { email: 'test@example.com' });

    expect(result.email).toBe('test@example.com');
  });
});

describe('updatePassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update the password hash when current password is correct', async () => {
    const hashedPassword = await bcrypt.hash('current123', 10);
    mockFindUnique.mockResolvedValue({ id: 'uuid-1', password: hashedPassword });
    mockUpdate.mockResolvedValue(undefined);

    await updatePassword('uuid-1', 'current123', 'newpass456');

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const savedPassword = mockUpdate.mock.calls[0][0].data.password as string;
    const isHashed = await bcrypt.compare('newpass456', savedPassword);
    expect(isHashed).toBe(true);
  });

  it('should throw 401 if current password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correct123', 10);
    mockFindUnique.mockResolvedValue({ id: 'uuid-1', password: hashedPassword });

    await expect(updatePassword('uuid-1', 'wrongpass', 'newpass456')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 400 if new password is shorter than 6 characters', async () => {
    await expect(updatePassword('uuid-1', 'current123', '123')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
