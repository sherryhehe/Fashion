import express from 'express';
import * as wishlistController from '../controllers/wishlistController.mongodb';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.delete('/clear/all', wishlistController.clearWishlist);

export default router;
