import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export interface CreateWarehouseDto {
  name: string;
  location: string;
  description?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  location?: string;
  description?: string;
}

export async function getAllWarehouses(userId: string) {
  return prisma.warehouse.findMany({
    where: { userId },
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWarehouseById(id: string, userId: string) {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, userId },
    include: { _count: { select: { products: true } } },
  });
  if (!warehouse) throw new AppError('Warehouse not found', 404);
  return warehouse;
}

export async function createWarehouse(userId: string, data: CreateWarehouseDto) {
  return prisma.warehouse.create({
    data: { ...data, userId },
  });
}

export async function updateWarehouse(id: string, userId: string, data: UpdateWarehouseDto) {
  const existing = await prisma.warehouse.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Warehouse not found', 404);
  return prisma.warehouse.update({ where: { id }, data });
}

export async function deleteWarehouse(id: string, userId: string): Promise<void> {
  const existing = await prisma.warehouse.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Warehouse not found', 404);
  await prisma.warehouse.delete({ where: { id } });
}
