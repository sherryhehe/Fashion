import express from 'express';
import * as dashboardController from '../controllers/dashboardController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All dashboard routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-chart', dashboardController.getSalesChartData);

export default router;

