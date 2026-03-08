import express from 'express';
import * as settingsController from '../controllers/settingsController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/payment', authenticate, settingsController.getPaymentSettings);
router.patch('/payment', authenticate, requireAdmin, settingsController.updatePaymentSettings);

export default router;
