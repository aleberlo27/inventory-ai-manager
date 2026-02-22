import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getAll, getOne, create, update, remove } from '../controllers/warehouse.controller';
import productRoutes from './product.routes';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

// Nested product routes: GET /warehouses/:warehouseId/products
//                        POST /warehouses/:warehouseId/products
router.use('/:warehouseId/products', productRoutes);

export default router;
