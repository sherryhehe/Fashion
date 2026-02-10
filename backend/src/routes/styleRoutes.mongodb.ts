import express from 'express';
import * as styleController from '../controllers/styleController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/featured', styleController.getFeaturedStyles);
router.get('/popular', styleController.getPopularStyles);

// Protected routes - require authentication
router.get('/', authenticate, styleController.getAllStyles);
router.get('/:id', authenticate, styleController.getStyleById);

// Admin only routes
router.post('/', authenticate, requireAdmin, styleController.createStyle);
router.put('/:id', authenticate, requireAdmin, styleController.updateStyle);
router.delete('/:id', authenticate, requireAdmin, styleController.deleteStyle);

export default router;

