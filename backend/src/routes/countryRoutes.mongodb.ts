import express from 'express';
import * as countryController from '../controllers/countryController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public: app needs eligible countries for registration
router.get('/', countryController.getAllCountries);

// Admin only
router.post('/', authenticate, requireAdmin, countryController.addCountry);
router.patch('/:code', authenticate, requireAdmin, countryController.updateCountry);
router.delete('/:code', authenticate, requireAdmin, countryController.removeCountry);

export default router;
