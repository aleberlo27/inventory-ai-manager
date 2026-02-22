import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    warehouse: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

process.env.JWT_SECRET = 'test-secret';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date('2024-01-01'),
};

const mockWarehouse = {
  id: 'wh-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage',
  createdAt: new Date('2024-01-01'),
  userId: 'user-1',
  _count: { products: 3 },
};

const token = jwt.sign({ userId: 'user-1' }, 'test-secret');

const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockFindMany = prisma.warehouse.findMany as jest.Mock;
const mockFindFirst = prisma.warehouse.findFirst as jest.Mock;
const mockCreate = prisma.warehouse.create as jest.Mock;
const mockUpdate = prisma.warehouse.update as jest.Mock;
const mockDelete = prisma.warehouse.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUserFindUnique.mockResolvedValue(mockUser);
});

describe('GET /warehouses', () => {
  it('should return 200 with list of warehouses for the authenticated user', async () => {
    mockFindMany.mockResolvedValue([mockWarehouse]);

    const res = await request(app)
      .get('/warehouses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('wh-1');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/warehouses');
    expect(res.status).toBe(401);
  });
});

describe('GET /warehouses/:id', () => {
  it('should return 200 with the correct warehouse', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);

    const res = await request(app)
      .get('/warehouses/wh-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('wh-1');
  });

  it('should return 404 if warehouse does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/warehouses/not-found')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 if warehouse belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/warehouses/wh-other')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/warehouses/wh-1');
    expect(res.status).toBe(401);
  });
});

describe('POST /warehouses', () => {
  it('should return 201 with valid data', async () => {
    mockCreate.mockResolvedValue(mockWarehouse);

    const res = await request(app)
      .post('/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Main Warehouse', location: 'Madrid' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Main Warehouse');
    expect(res.body.message).toBe('Warehouse created successfully');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send({ location: 'Madrid' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if location is missing', async () => {
    const res = await request(app)
      .post('/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Main Warehouse' });

    expect(res.status).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/warehouses')
      .send({ name: 'Main Warehouse', location: 'Madrid' });

    expect(res.status).toBe(401);
  });
});

describe('PATCH /warehouses/:id', () => {
  it('should return 200 when updating correctly', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);
    mockUpdate.mockResolvedValue({ ...mockWarehouse, name: 'Updated Warehouse' });

    const res = await request(app)
      .patch('/warehouses/wh-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Warehouse' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Warehouse');
    expect(res.body.message).toBe('Warehouse updated successfully');
  });

  it('should return 404 if warehouse does not exist or belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/warehouses/wh-999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).patch('/warehouses/wh-1').send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /warehouses/:id', () => {
  it('should return 204 when deleting correctly', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);
    mockDelete.mockResolvedValue(mockWarehouse);

    const res = await request(app)
      .delete('/warehouses/wh-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 if warehouse does not exist or belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/warehouses/wh-999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).delete('/warehouses/wh-1');
    expect(res.status).toBe(401);
  });
});
