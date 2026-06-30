import { Router } from 'express';
import { calculateCartTotal } from '../controllers/cart.controller';

const router = Router();

router.post('/total', calculateCartTotal);

export default router;
