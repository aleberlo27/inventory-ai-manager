import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app';
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

process.env.JWT_SECRET = 'test-secret';

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;

const mockSafeUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date('2024-01-01'),
};

beforeEach(() => jest.clearAllMocks());

describe('POST /auth/register', () => {
  it('should return 201 with valid data', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockSafeUser);

    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 400 if a required field is missing', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      name: 'Test User',
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 if password is shorter than 6 characters', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: '123',
      name: 'Test User',
    });
    expect(res.status).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    mockFindUnique.mockResolvedValue({ id: 'uuid-1' });

    const res = await request(app).post('/auth/register').send({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Test User',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  it('should return 200 with valid credentials and a token', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockFindUnique.mockResolvedValue({ ...mockSafeUser, password: hashedPassword });

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should return 401 with wrong email', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app).post('/auth/login').send({
      email: 'wrong@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('should return 401 with wrong password', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10);
    mockFindUnique.mockResolvedValue({ ...mockSafeUser, password: hashedPassword });

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 200 with user data when token is valid', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // login to get a real JWT
    mockFindUnique.mockResolvedValueOnce({ ...mockSafeUser, password: hashedPassword });
    const loginRes = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    const token = loginRes.body.data.token as string;

    // validateToken call inside authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
    expect(res.body.data).not.toHaveProperty('password');
  });
});

describe('PATCH /auth/profile', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).patch('/auth/profile').send({ name: 'New Name' });
    expect(res.status).toBe(401);
  });

  it('should return 200 with updated user data', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');
    const updatedUser = { ...mockSafeUser, name: 'Updated Name' };

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);
    // email check in updateProfile (no email sent, skipped)
    mockUpdate.mockResolvedValue(updatedUser);

    const res = await request(app)
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should return 409 if email is already in use by another user', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);
    // email check: another user already has that email
    mockFindUnique.mockResolvedValueOnce({ id: 'uuid-2', email: 'taken@example.com' });

    const res = await request(app)
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'taken@example.com' });

    expect(res.status).toBe(409);
  });
});

describe('PATCH /auth/password', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app)
      .patch('/auth/password')
      .send({ currentPassword: 'old', newPassword: 'newpass' });
    expect(res.status).toBe(401);
  });

  it('should return 200 when current password is correct', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');
    const hashedPassword = await bcrypt.hash('current123', 10);

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);
    // get user with password in updatePassword
    mockFindUnique.mockResolvedValueOnce({ id: 'uuid-1', password: hashedPassword });
    mockUpdate.mockResolvedValue(undefined);

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'current123', newPassword: 'newpass456' });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Password updated successfully');
  });

  it('should return 401 when current password is incorrect', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');
    const hashedPassword = await bcrypt.hash('correct123', 10);

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);
    // get user with password
    mockFindUnique.mockResolvedValueOnce({ id: 'uuid-1', password: hashedPassword });

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpass456' });

    expect(res.status).toBe(401);
  });

  it('should return 400 when new password is shorter than 6 characters', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'current123', newPassword: '123' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when required fields are missing', async () => {
    const token = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

    // validateToken in authMiddleware
    mockFindUnique.mockResolvedValueOnce(mockSafeUser);

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'current123' });

    expect(res.status).toBe(400);
  });
});
