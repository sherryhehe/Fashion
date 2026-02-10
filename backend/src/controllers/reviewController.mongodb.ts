import { Request, Response } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Add a review to a product
 */
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment, name } = req.body;

    // Validate required fields
    if (!productId || !rating || !comment || !name) {
      errorResponse(res, 'All fields are required', 400);
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      errorResponse(res, 'Rating must be between 1 and 5', 400);
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Create review
    const review = new Review({
      productId,
      rating,
      comment,
      name,
      date: new Date(),
      verified: false, // Could be true if user is authenticated
    });

    await review.save();

    // Update product's review count and average rating
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      reviewCount: reviews.length,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    });

    successResponse(res, review, 'Review added successfully', 201);
  } catch (error) {
    console.error('Add review error:', error);
    errorResponse(res, 'Failed to add review', 500);
  }
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .sort({ date: -1 }) // Most recent first
      .limit(50); // Limit to 50 reviews

    successResponse(res, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    console.error('Get product reviews error:', error);
    errorResponse(res, 'Failed to get reviews', 500);
  }
};

/**
 * Update a review
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, name } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      errorResponse(res, 'Review not found', 404);
      return;
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (name !== undefined) review.name = name;

    await review.save();

    // Update product's average rating
    const reviews = await Review.find({ productId: review.productId });
    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      reviewCount: reviews.length,
      rating: Math.round(averageRating * 10) / 10,
    });

    successResponse(res, review, 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    errorResponse(res, 'Failed to update review', 500);
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      errorResponse(res, 'Review not found', 404);
      return;
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Update product's review count and average rating
    const reviews = await Review.find({ productId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;

      await Product.findByIdAndUpdate(productId, {
        reviewCount: reviews.length,
        rating: Math.round(averageRating * 10) / 10,
      });
    } else {
      // No reviews left
      await Product.findByIdAndUpdate(productId, {
        reviewCount: 0,
        rating: 0,
      });
    }

    successResponse(res, null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    errorResponse(res, 'Failed to delete review', 500);
  }
};
