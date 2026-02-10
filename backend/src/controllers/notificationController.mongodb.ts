import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all notifications
 */
export const getAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, type, targetAudience } = req.query;
    
    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (targetAudience) filter.targetAudience = targetAudience;

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    successResponse(res, notifications);
  } catch (error) {
    console.error('Get all notifications error:', error);
    errorResponse(res, 'Failed to fetch notifications', 500);
  }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id)
      .populate('createdBy', 'name email');

    if (!notification) {
      errorResponse(res, 'Notification not found', 404);
      return;
    }

    successResponse(res, notification);
  } catch (error) {
    console.error('Get notification by ID error:', error);
    errorResponse(res, 'Failed to fetch notification', 500);
  }
};

/**
 * Create notification
 */
export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      message,
      type,
      targetAudience,
      targetUsers,
      targetSegment,
      image,
      actionUrl,
      actionText,
      discountCode,
      discountPercentage,
      expiryDate,
      priority,
      scheduled,
      scheduledTime,
    } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      errorResponse(res, 'Title, message, and type are required', 400);
      return;
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type,
      targetAudience: targetAudience || 'all',
      targetUsers: targetAudience === 'specific' ? targetUsers : undefined,
      targetSegment,
      image,
      actionUrl,
      actionText,
      discountCode,
      discountPercentage,
      expiryDate,
      priority: priority || 'normal',
      scheduled: scheduled || false,
      scheduledTime: scheduled ? scheduledTime : undefined,
      status: scheduled ? 'scheduled' : 'sent', // Auto-send if not scheduled
      sentAt: scheduled ? undefined : new Date(),
      createdBy: req.user!.id,
    });

    // TODO: In production, integrate with Firebase Cloud Messaging or OneSignal
    // to actually send push notifications to mobile app users
    
    // For now, just mark as sent
    if (!scheduled) {
      // Simulate sending (in production, call push notification service)
      notification.sentCount = targetAudience === 'all' ? 1000 : targetUsers?.length || 0; // Mock count
      await notification.save();
    }

    successResponse(res, notification, 'Notification created successfully', 201);
  } catch (error) {
    console.error('Create notification error:', error);
    errorResponse(res, 'Failed to create notification', 500);
  }
};

/**
 * Update notification
 */
export const updateNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notification = await Notification.findById(id);

    if (!notification) {
      errorResponse(res, 'Notification not found', 404);
      return;
    }

    // Can't edit sent notifications
    if (notification.status === 'sent') {
      errorResponse(res, 'Cannot edit sent notifications', 400);
      return;
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    successResponse(res, updatedNotification, 'Notification updated successfully');
  } catch (error) {
    console.error('Update notification error:', error);
    errorResponse(res, 'Failed to update notification', 500);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      errorResponse(res, 'Notification not found', 404);
      return;
    }

    successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    errorResponse(res, 'Failed to delete notification', 500);
  }
};

/**
 * Send scheduled notification
 */
export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      errorResponse(res, 'Notification not found', 404);
      return;
    }

    if (notification.status === 'sent') {
      errorResponse(res, 'Notification already sent', 400);
      return;
    }

    // TODO: In production, integrate with push notification service
    // For now, just mark as sent
    notification.status = 'sent';
    notification.sentAt = new Date();
    notification.sentCount = notification.targetAudience === 'all' ? 1000 : notification.targetUsers?.length || 0;
    await notification.save();

    successResponse(res, notification, 'Notification sent successfully');
  } catch (error) {
    console.error('Send notification error:', error);
    errorResponse(res, 'Failed to send notification', 500);
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSent = await Notification.countDocuments({ status: 'sent' });
    const totalScheduled = await Notification.countDocuments({ status: 'scheduled' });
    const totalDrafts = await Notification.countDocuments({ status: 'draft' });
    
    const recentNotifications = await Notification.find({ status: 'sent' })
      .sort({ sentAt: -1 })
      .limit(5)
      .select('title sentCount viewedCount clickedCount sentAt');

    // Calculate engagement rate
    const allSent = await Notification.find({ status: 'sent' });
    const totalSentCount = allSent.reduce((sum, n) => sum + n.sentCount, 0);
    const totalViewedCount = allSent.reduce((sum, n) => sum + n.viewedCount, 0);
    const totalClickedCount = allSent.reduce((sum, n) => sum + n.clickedCount, 0);

    const stats = {
      totalSent,
      totalScheduled,
      totalDrafts,
      totalSentCount,
      totalViewedCount,
      totalClickedCount,
      viewRate: totalSentCount > 0 ? ((totalViewedCount / totalSentCount) * 100).toFixed(2) : 0,
      clickRate: totalViewedCount > 0 ? ((totalClickedCount / totalViewedCount) * 100).toFixed(2) : 0,
      recentNotifications,
    };

    successResponse(res, stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    errorResponse(res, 'Failed to fetch notification statistics', 500);
  }
};

