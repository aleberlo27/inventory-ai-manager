export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  category?: string;
  minStock: number;
  warehouseId: string;
  warehouseName?: string;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  category?: string;
  minStock?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export type StockStatus = 'ok' | 'low' | 'empty';

export type ProductWithStock = Product & { stockStatus: StockStatus };
