import express from 'express';
import * as brandController from '../controllers/brandController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/featured', brandController.getFeaturedBrands);
router.get('/top', brandController.getTopBrands);

// Protected routes - require authentication
router.get('/', authenticate, brandController.getAllBrands);
router.get('/:id', authenticate, brandController.getBrandById);

// Admin only routes
router.post('/', authenticate, requireAdmin, brandController.createBrand);
router.put('/:id', authenticate, requireAdmin, brandController.updateBrand);
router.delete('/:id', authenticate, requireAdmin, brandController.deleteBrand);
router.patch('/:id/status', authenticate, requireAdmin, brandController.updateBrandStatus);
router.patch('/:id/featured', authenticate, requireAdmin, brandController.toggleBrandFeatured);
router.patch('/:id/verify', authenticate, requireAdmin, brandController.updateBrandVerification);

export default router;

