import { Request, Response, NextFunction } from 'express';

import { AppError } from '../middleware/error.middleware';
import { getAllWarehouses } from '../services/warehouse.service';
import { getProductsByWarehouse } from '../services/product.service';
import { askInventoryAssistant, ConversationMessage, InventoryContext } from '../services/ai.service';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationHistory = [] } = req.body as {
      message: unknown;
      conversationHistory: ConversationMessage[];
    };
    const userId = req.user!.id;

    if (!message || typeof message !== 'string') {
      throw new AppError('Message is required', 400);
    }
    if (message.trim().length === 0) {
      throw new AppError('Message cannot be empty', 400);
    }
    if (message.length > 500) {
      throw new AppError('Message too long (max 500 characters)', 400);
    }

    const warehouses = await getAllWarehouses(userId);
    const inventory: InventoryContext = {
      warehouses: await Promise.all(
        warehouses.map(async w => {
          const products = await getProductsByWarehouse(w.id, userId);
          return {
            id: w.id,
            name: w.name,
            location: w.location,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              quantity: p.quantity,
              unit: p.unit,
              minStock: p.minStock,
              ...(p.category !== null && { category: p.category }),
            })),
          };
        }),
      ),
    };

    const aiResponse = await askInventoryAssistant(message, conversationHistory, inventory);

    res.status(200).json({ data: aiResponse });
  } catch (error) {
    next(error);
  }
}
