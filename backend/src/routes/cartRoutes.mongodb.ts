import express from 'express';
import * as cartController from '../controllers/cartController.mongodb';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/clear/all', cartController.clearCart);

export default router;

