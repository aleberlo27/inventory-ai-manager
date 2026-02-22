import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import * as productService from '../services/product.service';

// GET /warehouses/:warehouseId/products
export async function getByWarehouse(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await productService.getProductsByWarehouse(
      String(req.params.warehouseId),
      req.user!.id,
    );
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

// GET /products/:id
export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getProductById(String(req.params.id), req.user!.id);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

// POST /warehouses/:warehouseId/products
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, sku, quantity, unit, category, minStock } = req.body as {
      name?: string;
      sku?: string;
      quantity?: number;
      unit?: string;
      category?: string;
      minStock?: number;
    };

    if (!name) throw new AppError('name is required', 400);
    if (!sku) throw new AppError('sku is required', 400);
    if (quantity === undefined || quantity === null) throw new AppError('quantity is required', 400);
    if (typeof quantity !== 'number' || quantity < 0)
      throw new AppError('quantity must be a non-negative number', 400);
    if (!unit) throw new AppError('unit is required', 400);

    const product = await productService.createProduct(String(req.params.warehouseId), req.user!.id, {
      name,
      sku,
      quantity,
      unit,
      category,
      minStock,
    });

    res.status(201).json({ data: product, message: 'Product created successfully' });
  } catch (err) {
    next(err);
  }
}

// PATCH /products/:id
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allowedFields = ['name', 'sku', 'quantity', 'unit', 'category', 'minStock'];
    const hasFields = allowedFields.some(f => f in req.body);
    if (!hasFields) throw new AppError('At least one field must be provided', 400);

    const { quantity } = req.body as { quantity?: number };
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      throw new AppError('quantity must be a non-negative number', 400);
    }

    const product = await productService.updateProduct(
      String(req.params.id),
      req.user!.id,
      req.body as productService.UpdateProductDto,
    );
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

// DELETE /products/:id
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.deleteProduct(String(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /products/search?q=query
export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = String(req.query.q ?? '');
    if (query.length < 2) throw new AppError('Query too short', 400);

    const products = await productService.searchProductsAcrossWarehouses(req.user!.id, query);
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}
