import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { authMiddleware } from '../middleware/auth.middleware';
import { chat } from '../controllers/ai.controller';

const router = Router();

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many requests to AI service', statusCode: 429 },
});

router.use(authMiddleware);
router.post('/chat', aiRateLimit, chat);

export default router;
