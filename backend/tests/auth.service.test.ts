import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, validateToken } from '../src/services/auth.service';
import { AppError } from '../src/middleware/error.middleware';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;

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
