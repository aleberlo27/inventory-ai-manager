import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export interface CreateProductDto {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  category?: string;
  minStock?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductWithWarehouse {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  category: string | null;
  minStock: number;
  createdAt: Date;
  warehouseId: string;
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getProductsByWarehouse(warehouseId: string, userId: string) {
  const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, userId } });
  if (!warehouse) throw new AppError('Warehouse not found', 404);

  return prisma.product.findMany({
    where: { warehouseId },
    orderBy: { name: 'asc' },
  });
}

export async function getProductById(id: string, userId: string) {
  const product = await prisma.product.findFirst({
    where: { id },
    include: {
      warehouse: { select: { id: true, name: true, location: true, userId: true } },
    },
  });

  if (!product || product.warehouse.userId !== userId) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

export async function createProduct(
  warehouseId: string,
  userId: string,
  data: CreateProductDto,
) {
  const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, userId } });
  if (!warehouse) throw new AppError('Warehouse not found', 404);

  const skuExists = await prisma.product.findFirst({ where: { sku: data.sku, warehouseId } });
  if (skuExists) throw new AppError('SKU already exists in this warehouse', 409);

  return prisma.product.create({ data: { ...data, warehouseId } });
}

export async function updateProduct(id: string, userId: string, data: UpdateProductDto) {
  const existing = await prisma.product.findFirst({
    where: { id },
    include: {
      warehouse: { select: { id: true, userId: true } },
    },
  });

  if (!existing || existing.warehouse.userId !== userId) {
    throw new AppError('Product not found', 404);
  }

  if (data.sku && data.sku !== existing.sku) {
    const skuConflict = await prisma.product.findFirst({
      where: { sku: data.sku, warehouseId: existing.warehouseId },
    });
    if (skuConflict) throw new AppError('SKU already exists in this warehouse', 409);
  }

  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string, userId: string): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: { id },
    include: {
      warehouse: { select: { userId: true } },
    },
  });

  if (!existing || existing.warehouse.userId !== userId) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({ where: { id } });
}

export async function searchProductsAcrossWarehouses(
  userId: string,
  query: string,
): Promise<ProductWithWarehouse[]> {
  return prisma.product.findMany({
    where: {
      warehouse: { userId },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      warehouse: { select: { id: true, name: true, location: true } },
    },
    orderBy: { name: 'asc' },
  }) as Promise<ProductWithWarehouse[]>;
}
