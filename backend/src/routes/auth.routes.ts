import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, updatePassword);

export default router;
