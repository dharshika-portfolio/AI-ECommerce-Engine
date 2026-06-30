import { Router } from 'express';
import { createOrder } from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createOrder);

export default router;
