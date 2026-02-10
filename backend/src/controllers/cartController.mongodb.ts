import { Request, Response } from 'express';
import { Cart, Product } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cartItems = await Cart.find({ userId: req.user!.id });
    
    // Populate with product details
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item.toObject(),
          product,
        };
      })
    );

    successResponse(res, cartWithProducts);
  } catch (error) {
    console.error('Get cart error:', error);
    errorResponse(res, 'Failed to get cart', 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

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

    // Check if item already in cart
    const existingItem = await Cart.findOne({
      userId: req.user!.id,
      productId,
      size,
      color,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      successResponse(res, existingItem, 'Cart updated successfully');
    } else {
      const cartItem = await Cart.create({
        userId: req.user!.id,
        productId,
        quantity,
        size,
        color,
      });
      successResponse(res, cartItem, 'Added to cart successfully', 201);
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    errorResponse(res, 'Failed to add to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      errorResponse(res, 'Quantity must be at least 1', 400);
      return;
    }

    const cartItem = await Cart.findOneAndUpdate(
      { _id: id, userId: req.user!.id },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      errorResponse(res, 'Cart item not found', 404);
      return;
    }

    successResponse(res, cartItem, 'Cart item updated successfully');
  } catch (error) {
    console.error('Update cart error:', error);
    errorResponse(res, 'Failed to update cart', 500);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findOneAndDelete({
      _id: id,
      userId: req.user!.id,
    });

    if (!cartItem) {
      errorResponse(res, 'Cart item not found', 404);
      return;
    }

    successResponse(res, null, 'Removed from cart successfully');
  } catch (error) {
    console.error('Remove from cart error:', error);
    errorResponse(res, 'Failed to remove from cart', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Cart.deleteMany({ userId: req.user!.id });
    successResponse(res, null, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    errorResponse(res, 'Failed to clear cart', 500);
  }
};

