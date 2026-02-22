import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import warehouseRoutes from './routes/warehouse.routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/warehouses', warehouseRoutes);

app.use(errorMiddleware);

export default app;
