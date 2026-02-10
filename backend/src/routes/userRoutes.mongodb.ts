import express from 'express';
import * as userController from '../controllers/userController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All user routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/status', userController.updateUserStatus);

export default router;

