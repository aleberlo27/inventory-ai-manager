import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getByWarehouse, create } from '../controllers/product.controller';

// mergeParams allows access to :warehouseId from the parent router
const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getByWarehouse);
router.post('/', create);

export default router;
