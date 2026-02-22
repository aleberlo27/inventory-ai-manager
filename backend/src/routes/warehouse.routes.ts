import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getAll, getOne, create, update, remove } from '../controllers/warehouse.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
