import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as bannerController from '../controllers/bannerController.mongodb';

const router = express.Router();

// Public list and get
router.get('/', bannerController.listBanners);
router.get('/:id', bannerController.getBannerById);

// Admin-only write operations
router.post('/', authenticate, requireAdmin, bannerController.createBanner);
router.put('/:id', authenticate, requireAdmin, bannerController.updateBanner);
router.delete('/:id', authenticate, requireAdmin, bannerController.deleteBanner);

export default router;
