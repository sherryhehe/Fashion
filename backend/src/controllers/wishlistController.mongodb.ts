import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get current user's wishlist with product details
 */
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const items = await Wishlist.find({ userId }).sort({ createdAt: -1 }).lean();

    const productIds = [...new Set(items.map((i: any) => i.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p: any) => [String(p._id), p]));

    const data = items.map((item: any) => ({
      _id: item._id,
      productId: item.productId,
      product: productMap.get(item.productId) || null,
      color: item.color,
      size: item.size,
      addedAt: item.createdAt,
    }));

    successResponse(res, data);
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
    const userId = req.user!.id;
    const rawProductId = req.body.productId;
    const productId = rawProductId != null ? String(rawProductId).trim() : '';
    const { color, size } = req.body;

    if (!productId) {
      errorResponse(res, 'Product ID is required', 400);
      return;
    }

    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      successResponse(res, existing, 'Already in wishlist');
      return;
    }

    const item = await Wishlist.create({
      userId,
      productId,
      color: color || undefined,
      size: size || undefined,
    });

    successResponse(res, item, 'Added to wishlist', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      successResponse(res, null, 'Already in wishlist');
      return;
    }
    console.error('Add to wishlist error:', error);
    errorResponse(res, error.message || 'Failed to add to wishlist', 500);
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = (req.params.productId != null ? String(req.params.productId).trim() : '') || '';
    if (!productId) {
      errorResponse(res, 'Product ID is required', 400);
      return;
    }

    const result = await Wishlist.deleteOne({ userId, productId });

    if (result.deletedCount === 0) {
      successResponse(res, null, 'Item not in wishlist');
      return;
    }

    successResponse(res, null, 'Removed from wishlist');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    errorResponse(res, 'Failed to remove from wishlist', 500);
  }
};

/**
 * Check if product is in wishlist
 */
export const checkInWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const item = await Wishlist.findOne({ userId, productId });
    successResponse(res, !!item);
  } catch (error) {
    console.error('Check wishlist error:', error);
    errorResponse(res, 'Failed to check wishlist', 500);
  }
};
