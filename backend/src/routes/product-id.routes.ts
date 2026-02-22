import { Router } from 'express';
import { search, getOne, update, remove } from '../controllers/product.controller';

const router = Router();

// /search must come before /:id to avoid "search" being treated as an id
router.get('/search', search);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
