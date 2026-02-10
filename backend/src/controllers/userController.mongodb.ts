import { Request, Response } from 'express';
import { User } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all users/customers
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    successResponse(res, users, undefined, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get users error:', error);
    errorResponse(res, 'Failed to get users', 500);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user);
  } catch (error) {
    console.error('Get user error:', error);
    errorResponse(res, 'Failed to get user', 500);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user, 'User status updated successfully');
  } catch (error) {
    console.error('Update user status error:', error);
    errorResponse(res, 'Failed to update user status', 500);
  }
};

