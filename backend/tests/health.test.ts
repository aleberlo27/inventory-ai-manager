import request from 'supertest';
import app from '../src/app';

jest.mock('../src/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn(), create: jest.fn() } },
}));

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
