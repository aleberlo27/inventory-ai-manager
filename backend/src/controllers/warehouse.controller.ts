import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import * as warehouseService from '../services/warehouse.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const warehouses = await warehouseService.getAllWarehouses(req.user!.id);
    res.json({ data: warehouses });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const warehouse = await warehouseService.getWarehouseById(String(req.params.id), req.user!.id);
    res.json({ data: warehouse });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, location, description } = req.body as {
      name?: string;
      location?: string;
      description?: string;
    };

    if (!name) throw new AppError('name is required', 400);
    if (!location) throw new AppError('location is required', 400);

    const warehouse = await warehouseService.createWarehouse(req.user!.id, {
      name,
      location,
      description,
    });
    res.status(201).json({ data: warehouse, message: 'Warehouse created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hasFields = ['name', 'location', 'description'].some((f) => f in req.body);
    if (!hasFields) throw new AppError('At least one field must be provided', 400);

    const { name, location, description } = req.body as {
      name?: string;
      location?: string;
      description?: string;
    };

    const warehouse = await warehouseService.updateWarehouse(String(req.params.id), req.user!.id, {
      name,
      location,
      description,
    });
    res.json({ data: warehouse, message: 'Warehouse updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await warehouseService.deleteWarehouse(String(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
