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
      findFirst: jest.fn(),
    },
    product: {
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
  userId: 'user-1',
};

const mockProduct = {
  id: 'prod-1',
  name: 'Widget A',
  sku: 'SKU-001',
  quantity: 100,
  unit: 'units',
  category: 'Electronics',
  minStock: 10,
  createdAt: new Date('2024-01-01'),
  warehouseId: 'wh-1',
};

const mockProductWithWarehouse = {
  ...mockProduct,
  warehouse: { id: 'wh-1', name: 'Main Warehouse', location: 'Madrid', userId: 'user-1' },
};

const token = jwt.sign({ userId: 'user-1' }, 'test-secret');

const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockWarehouseFindFirst = prisma.warehouse.findFirst as jest.Mock;
const mockProductFindMany = prisma.product.findMany as jest.Mock;
const mockProductFindFirst = prisma.product.findFirst as jest.Mock;
const mockProductCreate = prisma.product.create as jest.Mock;
const mockProductUpdate = prisma.product.update as jest.Mock;
const mockProductDelete = prisma.product.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUserFindUnique.mockResolvedValue(mockUser);
});

// ─── GET /warehouses/:warehouseId/products ────────────────────────────────────

describe('GET /warehouses/:warehouseId/products', () => {
  it('should return 200 with the list of products for the warehouse', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockProductFindMany.mockResolvedValue([mockProduct]);

    const res = await request(app)
      .get('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].sku).toBe('SKU-001');
  });

  it('should return 404 if the warehouse does not exist or belongs to another user', async () => {
    mockWarehouseFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/warehouses/wh-999/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/warehouses/wh-1/products');
    expect(res.status).toBe(401);
  });
});

// ─── POST /warehouses/:warehouseId/products ───────────────────────────────────

describe('POST /warehouses/:warehouseId/products', () => {
  const validBody = { name: 'Widget B', sku: 'SKU-002', quantity: 50, unit: 'units' };

  it('should return 201 with valid data', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockProductFindFirst.mockResolvedValue(null); // no SKU conflict
    mockProductCreate.mockResolvedValue({ ...mockProduct, ...validBody });

    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.sku).toBe('SKU-002');
    expect(res.body.message).toBe('Product created successfully');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'SKU-002', quantity: 50, unit: 'units' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if sku is missing', async () => {
    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Widget B', quantity: 50, unit: 'units' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if quantity is missing', async () => {
    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Widget B', sku: 'SKU-002', unit: 'units' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if quantity is negative', async () => {
    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Widget B', sku: 'SKU-002', quantity: -5, unit: 'units' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if unit is missing', async () => {
    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Widget B', sku: 'SKU-002', quantity: 50 });

    expect(res.status).toBe(400);
  });

  it('should return 409 if SKU already exists in the warehouse', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockProductFindFirst.mockResolvedValue(mockProduct); // SKU conflict

    const res = await request(app)
      .post('/warehouses/wh-1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Widget B', sku: 'SKU-001', quantity: 50, unit: 'units' });

    expect(res.status).toBe(409);
  });

  it('should return 404 if the warehouse does not exist', async () => {
    mockWarehouseFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/warehouses/wh-999/products')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).post('/warehouses/wh-1/products').send(validBody);
    expect(res.status).toBe(401);
  });
});

// ─── PATCH /products/:id ──────────────────────────────────────────────────────

describe('PATCH /products/:id', () => {
  it('should return 200 updating the product correctly', async () => {
    mockProductFindFirst.mockResolvedValue(mockProductWithWarehouse);
    mockProductUpdate.mockResolvedValue({ ...mockProduct, quantity: 200 });

    const res = await request(app)
      .patch('/products/prod-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 200 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(200);
  });

  it('should return 400 if quantity is negative', async () => {
    const res = await request(app)
      .patch('/products/prod-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: -1 });

    expect(res.status).toBe(400);
  });

  it('should return 404 if product does not exist or belongs to another user', async () => {
    mockProductFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/products/prod-999')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).patch('/products/prod-1').send({ quantity: 1 });
    expect(res.status).toBe(401);
  });
});

// ─── DELETE /products/:id ─────────────────────────────────────────────────────

describe('DELETE /products/:id', () => {
  it('should return 204 deleting the product correctly', async () => {
    mockProductFindFirst.mockResolvedValue(mockProductWithWarehouse);
    mockProductDelete.mockResolvedValue(mockProduct);

    const res = await request(app)
      .delete('/products/prod-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 if product does not exist', async () => {
    mockProductFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/products/prod-999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).delete('/products/prod-1');
    expect(res.status).toBe(401);
  });
});

// ─── GET /products/search?q=query ────────────────────────────────────────────

describe('GET /products/search?q=query', () => {
  const mockSearchResult = [
    { ...mockProduct, warehouse: { id: 'wh-1', name: 'Main Warehouse', location: 'Madrid' } },
  ];

  it('should return 200 with matching products', async () => {
    mockProductFindMany.mockResolvedValue(mockSearchResult);

    const res = await request(app)
      .get('/products/search?q=widget')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Widget A');
  });

  it('should return 400 if query has fewer than 2 characters', async () => {
    const res = await request(app)
      .get('/products/search?q=a')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('should return 400 if query is empty', async () => {
    const res = await request(app)
      .get('/products/search?q=')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/products/search?q=widget');
    expect(res.status).toBe(401);
  });
});
