import express from 'express';
import * as homeCategoryController from '../controllers/homeCategoryController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public: active categories for app (with products)
router.get('/app', homeCategoryController.getActiveForApp);

// Admin
router.get('/', authenticate, requireAdmin, homeCategoryController.getAll);
router.get('/:id', authenticate, requireAdmin, homeCategoryController.getById);
router.post('/', authenticate, requireAdmin, homeCategoryController.create);
router.put('/:id', authenticate, requireAdmin, homeCategoryController.update);
router.delete('/:id', authenticate, requireAdmin, homeCategoryController.remove);

export default router;
