export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
  productCount?: number;
}

export interface CreateWarehouseDto {
  name: string;
  location: string;
  description?: string;
}

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;
