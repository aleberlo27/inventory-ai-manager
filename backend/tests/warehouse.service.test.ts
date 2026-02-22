import {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../src/services/warehouse.service';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    warehouse: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockFindMany = prisma.warehouse.findMany as jest.Mock;
const mockFindFirst = prisma.warehouse.findFirst as jest.Mock;
const mockCreate = prisma.warehouse.create as jest.Mock;
const mockUpdate = prisma.warehouse.update as jest.Mock;
const mockDelete = prisma.warehouse.delete as jest.Mock;

const mockWarehouse = {
  id: 'wh-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage',
  createdAt: new Date('2024-01-01'),
  userId: 'user-1',
  _count: { products: 3 },
};

describe('getAllWarehouses', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return all warehouses for the user with product count', async () => {
    mockFindMany.mockResolvedValue([mockWarehouse]);

    const result = await getAllWarehouses('user-1');

    expect(result).toHaveLength(1);
    expect(result[0]._count.products).toBe(3);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('should return empty array when user has no warehouses', async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getAllWarehouses('user-1');

    expect(result).toEqual([]);
  });
});

describe('getWarehouseById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the warehouse when it exists and belongs to the user', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);

    const result = await getWarehouseById('wh-1', 'user-1');

    expect(result.id).toBe('wh-1');
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wh-1', userId: 'user-1' } }),
    );
  });

  it('should throw 404 if warehouse does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getWarehouseById('wh-999', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 404 if warehouse belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getWarehouseById('wh-1', 'other-user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('createWarehouse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create and return the warehouse', async () => {
    mockCreate.mockResolvedValue(mockWarehouse);

    const result = await createWarehouse('user-1', {
      name: 'Main Warehouse',
      location: 'Madrid',
    });

    expect(result.name).toBe('Main Warehouse');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

describe('updateWarehouse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update and return the warehouse', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);
    mockUpdate.mockResolvedValue({ ...mockWarehouse, name: 'Updated Warehouse' });

    const result = await updateWarehouse('wh-1', 'user-1', { name: 'Updated Warehouse' });

    expect(result.name).toBe('Updated Warehouse');
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 if warehouse does not exist or belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(updateWarehouse('wh-999', 'user-1', { name: 'X' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('deleteWarehouse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should delete the warehouse', async () => {
    mockFindFirst.mockResolvedValue(mockWarehouse);
    mockDelete.mockResolvedValue(mockWarehouse);

    await deleteWarehouse('wh-1', 'user-1');

    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 if warehouse does not exist or belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(deleteWarehouse('wh-999', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
