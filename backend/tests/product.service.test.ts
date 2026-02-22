import {
  getProductsByWarehouse,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductsAcrossWarehouses,
} from '../src/services/product.service';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
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

const mockWarehouseFindFirst = prisma.warehouse.findFirst as jest.Mock;
const mockFindMany = prisma.product.findMany as jest.Mock;
const mockFindFirst = prisma.product.findFirst as jest.Mock;
const mockCreate = prisma.product.create as jest.Mock;
const mockUpdate = prisma.product.update as jest.Mock;
const mockDelete = prisma.product.delete as jest.Mock;

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

beforeEach(() => jest.clearAllMocks());

// ─── getProductsByWarehouse ───────────────────────────────────────────────────

describe('getProductsByWarehouse()', () => {
  it('should return products ordered by name when warehouse belongs to user', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockFindMany.mockResolvedValue([mockProduct]);

    const result = await getProductsByWarehouse('wh-1', 'user-1');

    expect(result).toHaveLength(1);
    expect(result[0].sku).toBe('SKU-001');
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { warehouseId: 'wh-1' }, orderBy: { name: 'asc' } }),
    );
  });

  it('should throw 404 if warehouse does not exist', async () => {
    mockWarehouseFindFirst.mockResolvedValue(null);

    await expect(getProductsByWarehouse('wh-999', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('should throw 404 if warehouse belongs to another user', async () => {
    mockWarehouseFindFirst.mockResolvedValue(null);

    await expect(getProductsByWarehouse('wh-1', 'other-user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── getProductById ───────────────────────────────────────────────────────────

describe('getProductById()', () => {
  it('should return the product with warehouse data', async () => {
    mockFindFirst.mockResolvedValue(mockProductWithWarehouse);

    const result = await getProductById('prod-1', 'user-1');

    expect(result.id).toBe('prod-1');
    expect(result.warehouse).toBeDefined();
    expect(result.warehouse.name).toBe('Main Warehouse');
  });

  it('should throw 404 if product does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getProductById('prod-999', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw 404 if product belongs to another user', async () => {
    mockFindFirst.mockResolvedValue({
      ...mockProductWithWarehouse,
      warehouse: { ...mockWarehouse, userId: 'other-user' },
    });

    await expect(getProductById('prod-1', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── createProduct ────────────────────────────────────────────────────────────

describe('createProduct()', () => {
  const createDto = {
    name: 'Widget B',
    sku: 'SKU-002',
    quantity: 50,
    unit: 'units',
  };

  it('should create and return the product', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockFindFirst.mockResolvedValue(null); // no SKU conflict
    mockCreate.mockResolvedValue({ ...mockProduct, ...createDto });

    const result = await createProduct('wh-1', 'user-1', createDto);

    expect(result.sku).toBe('SKU-002');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 if warehouse does not belong to user', async () => {
    mockWarehouseFindFirst.mockResolvedValue(null);

    await expect(createProduct('wh-1', 'other-user', createDto)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw 409 if SKU already exists in that warehouse', async () => {
    mockWarehouseFindFirst.mockResolvedValue(mockWarehouse);
    mockFindFirst.mockResolvedValue(mockProduct); // SKU conflict

    await expect(createProduct('wh-1', 'user-1', { ...createDto, sku: 'SKU-001' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ─── updateProduct ────────────────────────────────────────────────────────────

describe('updateProduct()', () => {
  it('should update and return the product', async () => {
    mockFindFirst.mockResolvedValue(mockProductWithWarehouse);
    mockUpdate.mockResolvedValue({ ...mockProduct, quantity: 200 });

    const result = await updateProduct('prod-1', 'user-1', { quantity: 200 });

    expect(result.quantity).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 if product does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(updateProduct('prod-999', 'user-1', { quantity: 1 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 404 if product belongs to another user', async () => {
    mockFindFirst.mockResolvedValue({
      ...mockProductWithWarehouse,
      warehouse: { ...mockWarehouse, userId: 'other-user' },
    });

    await expect(updateProduct('prod-1', 'user-1', { quantity: 1 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 409 if new SKU already exists in the same warehouse', async () => {
    // First call: find the product (returns product with matching userId)
    mockFindFirst
      .mockResolvedValueOnce(mockProductWithWarehouse)
      // Second call: check SKU conflict → found a different product with new SKU
      .mockResolvedValueOnce({ ...mockProduct, id: 'prod-2', sku: 'SKU-NEW' });

    await expect(updateProduct('prod-1', 'user-1', { sku: 'SKU-NEW' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ─── deleteProduct ────────────────────────────────────────────────────────────

describe('deleteProduct()', () => {
  it('should delete the product', async () => {
    mockFindFirst.mockResolvedValue(mockProductWithWarehouse);
    mockDelete.mockResolvedValue(mockProduct);

    await deleteProduct('prod-1', 'user-1');

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
  });

  it('should throw 404 if product does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(deleteProduct('prod-999', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('should throw 404 if product belongs to another user', async () => {
    mockFindFirst.mockResolvedValue({
      ...mockProductWithWarehouse,
      warehouse: { ...mockWarehouse, userId: 'other-user' },
    });

    await expect(deleteProduct('prod-1', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── searchProductsAcrossWarehouses ──────────────────────────────────────────

describe('searchProductsAcrossWarehouses()', () => {
  const mockSearchProduct = {
    ...mockProduct,
    warehouse: { id: 'wh-1', name: 'Main Warehouse', location: 'Madrid' },
  };

  it('should find products by name (case-insensitive)', async () => {
    mockFindMany.mockResolvedValue([mockSearchProduct]);

    const result = await searchProductsAcrossWarehouses('user-1', 'widget');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Widget A');
    expect(mockFindMany).toHaveBeenCalled();
  });

  it('should find products by SKU', async () => {
    mockFindMany.mockResolvedValue([mockSearchProduct]);

    const result = await searchProductsAcrossWarehouses('user-1', 'SKU-001');

    expect(result).toHaveLength(1);
    expect(result[0].sku).toBe('SKU-001');
  });

  it('should return empty array when no products match', async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await searchProductsAcrossWarehouses('user-1', 'nonexistent');

    expect(result).toEqual([]);
  });

  it('should include warehouse info in results', async () => {
    mockFindMany.mockResolvedValue([mockSearchProduct]);

    const result = await searchProductsAcrossWarehouses('user-1', 'widget');

    expect(result[0].warehouse).toBeDefined();
    expect(result[0].warehouse.name).toBe('Main Warehouse');
  });
});
