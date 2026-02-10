import express from 'express';
import * as reviewController from '../controllers/reviewController.mongodb';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required for now)
router.post('/', reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes (require authentication)
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

export default router;
