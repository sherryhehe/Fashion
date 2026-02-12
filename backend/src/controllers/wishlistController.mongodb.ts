import { Response } from 'express';
import { Wishlist, Product } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get user's wishlist
 */
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();

    // Populate product details
    const wishlistWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        return {
          ...item,
          product,
        };
      })
    );

    successResponse(res, wishlistWithProducts);
  } catch (error) {
    console.error('Get wishlist error:', error);
    errorResponse(res, 'Failed to get wishlist', 500);
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, color, size } = req.body;

    if (!productId) {
      errorResponse(res, 'Product ID is required', 400);
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Check if item already in wishlist
    const existingItem = await Wishlist.findOne({
      userId: req.user!.id,
      productId,
    });

    if (existingItem) {
      // Update color/size if provided
      if (color) existingItem.color = color;
      if (size) existingItem.size = size;
      await existingItem.save();
      
      const itemWithProduct = {
        ...existingItem.toObject(),
        product,
      };
      
      successResponse(res, itemWithProduct, 'Wishlist updated successfully');
    } else {
      const wishlistItem = await Wishlist.create({
        userId: req.user!.id,
        productId,
        size,
        color,
      });
      
      const itemWithProduct = {
        ...wishlistItem.toObject(),
        product,
      };
      
      successResponse(res, itemWithProduct, 'Added to wishlist successfully', 201);
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    errorResponse(res, 'Failed to add to wishlist', 500);
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      productId,
      userId: req.user!.id,
    });

    if (!wishlistItem) {
      errorResponse(res, 'Wishlist item not found', 404);
      return;
    }

    successResponse(res, null, 'Removed from wishlist successfully');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    errorResponse(res, 'Failed to remove from wishlist', 500);
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      userId: req.user!.id,
      productId,
    });

    successResponse(res, !!wishlistItem);
  } catch (error) {
    console.error('Check wishlist error:', error);
    errorResponse(res, 'Failed to check wishlist', 500);
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Wishlist.deleteMany({ userId: req.user!.id });
    successResponse(res, null, 'Wishlist cleared successfully');
  } catch (error) {
    console.error('Clear wishlist error:', error);
    errorResponse(res, 'Failed to clear wishlist', 500);
  }
};
