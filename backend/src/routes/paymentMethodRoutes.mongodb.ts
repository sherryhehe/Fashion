import express from 'express';
import * as paymentMethodController from '../controllers/paymentMethodController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public: active methods visible to app (mobile can call this)
router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/:id', paymentMethodController.getPaymentMethodById);

// Admin only
router.post('/', authenticate, requireAdmin, paymentMethodController.createPaymentMethod);
router.put('/:id', authenticate, requireAdmin, paymentMethodController.updatePaymentMethod);
router.delete('/:id', authenticate, requireAdmin, paymentMethodController.deletePaymentMethod);

export default router;
