import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      errorResponse(res, 'Name, email and password are required', 400);
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'User with this email already exists', 400);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active',
    });

    // Generate token
    const token = generateToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    successResponse(res, {
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      errorResponse(res, 'Email and password are required', 400);
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      errorResponse(res, 'Account is inactive', 403);
      return;
    }

    // Generate token
    const token = generateToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    successResponse(res, {
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 'Failed to get profile', 500);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Failed to update profile', 500);
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      errorResponse(res, 'Current password and new password are required', 400);
      return;
    }

    // Find user
    const user = await User.findById(req.user!.id);
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      errorResponse(res, 'Current password is incorrect', 401);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Failed to change password', 500);
  }
};

/**
 * Forgot password - Generate reset token
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      errorResponse(res, 'Email is required', 400);
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      successResponse(res, null, 'If email exists, reset link has been sent');
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // In a real app, you would send an email here
    // For now, we'll return the token for testing purposes
    successResponse(res, { 
      resetToken, 
      message: 'Reset token generated (in production, this would be sent via email)' 
    }, 'Reset link generated successfully');
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, 'Failed to process forgot password request', 500);
  }
};

/**
 * Reset password - Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      errorResponse(res, 'Reset token and new password are required', 400);
      return;
    }

    // Find user with reset token
    const user = await User.findOne({ 
      resetPasswordToken: resetToken,
      resetPasswordExpiry: { $gt: new Date() } // Check if token is not expired
    });

    if (!user) {
      errorResponse(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Failed to reset password', 500);
  }
};

