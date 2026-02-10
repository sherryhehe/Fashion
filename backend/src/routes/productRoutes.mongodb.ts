import express from 'express';
import * as productController from '../controllers/productController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);
router.patch('/:id/status', authenticate, requireAdmin, productController.updateProductStatus);
router.patch('/:id/featured', authenticate, requireAdmin, productController.toggleFeatured);

export default router;

