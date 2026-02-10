import express from 'express';
import * as notificationController from '../controllers/notificationController.mongodb';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Notification management
router.get('/', notificationController.getAllNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.get('/:id', notificationController.getNotificationById);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);
router.post('/:id/send', notificationController.sendNotification);

export default router;

