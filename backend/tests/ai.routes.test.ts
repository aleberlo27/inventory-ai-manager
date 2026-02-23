import Anthropic from '@anthropic-ai/sdk';

// Mock Anthropic before any imports to intercept the module-level client creation
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn() },
  })),
}));

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    warehouse: { findMany: jest.fn(), findFirst: jest.fn() },
    product: { findMany: jest.fn() },
  },
}));

process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

const mockSafeUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date('2024-01-01'),
};

const validToken = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

let mockCreate: jest.Mock;

beforeAll(() => {
  const instance = (Anthropic as unknown as jest.Mock).mock.results[0]?.value;
  mockCreate = instance?.messages?.create as jest.Mock;
});

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockSafeUser);
  (prisma.warehouse.findMany as jest.Mock).mockResolvedValue([]);
});

function makeTextResponse(text: string) {
  return {
    content: [{ type: 'text', text }],
  };
}

describe('POST /ai/chat', () => {
  it('returns 200 with a valid message and auth token', async () => {
    const aiReply = { reply: 'Tienes 10 tornillos M6 en el almacén principal.' };
    mockCreate.mockResolvedValueOnce(makeTextResponse(JSON.stringify(aiReply)));
    (prisma.warehouse.findMany as jest.Mock).mockResolvedValue([
      { id: 'wh-1', name: 'Main', location: 'Madrid' },
    ]);
    (prisma.warehouse.findFirst as jest.Mock).mockResolvedValue({ id: 'wh-1', userId: 'uuid-1' });
    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: '¿Cuántos tornillos M6 tengo?' });

    expect(res.status).toBe(200);
    expect(res.body.data.reply).toBe(aiReply.reply);
  });

  it('returns 400 if message is missing from the body', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 if message is an empty string', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: '   ' });

    expect(res.status).toBe(400);
  });

  it('returns 400 if message exceeds 500 characters', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: 'a'.repeat(501) });

    expect(res.status).toBe(400);
  });

  it('returns 401 when no authentication token is provided', async () => {
    const res = await request(app).post('/ai/chat').send({ message: 'Hello' });

    expect(res.status).toBe(401);
  });

  it('returns 503 when the Anthropic API fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Connection refused'));

    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: 'Hello' });

    expect(res.status).toBe(503);
  });
});
