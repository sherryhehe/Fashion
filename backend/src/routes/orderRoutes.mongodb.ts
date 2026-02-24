import express from 'express';
import * as orderController from '../controllers/orderController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/confirm-payment', orderController.confirmOrderPayment);

// Admin only routes (accept both PUT and PATCH for status updates)
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;

