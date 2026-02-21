import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Brand from '../models/Brand';
import Category from '../models/Category';
import Style from '../models/Style';
import Review from '../models/Review';
import Cart from '../models/Cart';
import Wishlist from '../models/Wishlist';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all products with pagination and filters
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      brand,
      style,
      status,
      featured,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query: any = {};

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = brand;
    // Only filter by style if it's provided and not empty
    if (style) {
      const styleValue = Array.isArray(style) ? style[0] : style;
      const trimmedStyle = styleValue.toString().trim();
      if (trimmedStyle !== '') {
        // Exact match - this will only match documents where style exactly equals the value
        query.style = trimmedStyle;
      }
    }
    // Only filter by status if explicitly provided and not 'all'
    if (status && status !== 'all') {
      query.status = status;
    }
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort: promoted products first, then by requested sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { promoted: -1, [sortBy as string]: sortOrder };

    // Debug: Log query parameters and final query
    console.log('Product query params:', { style, category, brand, status, search });
    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    successResponse(res, products, undefined, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, 'Failed to get products', 500);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Get embedded reviews from product document (added via admin form)
    const embeddedReviews = product.reviews || [];
    
    // Fetch reviews from Review collection (added via review API)
    const reviewDocuments = await Review.find({ productId: id })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to 50 reviews
    
    // Convert Review documents to the same format as embedded reviews
    const formattedReviewDocs = reviewDocuments.map((review: any) => ({
      id: review._id.toString(),
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      date: review.date ? new Date(review.date).toISOString().split('T')[0] : new Date(review.createdAt).toISOString().split('T')[0],
      verified: review.verified || false,
    }));

    // Merge embedded reviews with Review collection reviews
    // Embedded reviews (from admin) come first, then Review collection reviews
    const allReviews = [...embeddedReviews, ...formattedReviewDocs];

    // Convert product to plain object and merge reviews
    const productWithReviews = {
      ...product.toObject(),
      reviews: allReviews
    };

    successResponse(res, productWithReviews);
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 'Failed to get product', 500);
  }
};

/**
 * Create new product
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    // Validation
    if (!productData.name || !productData.price || !productData.category || !productData.sku) {
      errorResponse(res, 'Name, price, category, and SKU are required', 400);
      return;
    }

    // Check if SKU exists
    const existingSKU = await Product.findOne({ sku: productData.sku });
    if (existingSKU) {
      errorResponse(res, 'Product with this SKU already exists', 400);
      return;
    }

    // Log reviews for debugging
    if (productData.reviews) {
      console.log('📝 Creating product with reviews:', productData.reviews.length);
      console.log('Reviews data:', JSON.stringify(productData.reviews, null, 2));
    }

    const product = await Product.create(productData);
    
    // Verify reviews were saved
    if (product.reviews) {
      console.log('✅ Reviews saved to product:', product.reviews.length);
    }

    // Update product counts for related entities
    if (product.brand) {
      const count = await Product.countDocuments({ brand: product.brand });
      await Brand.updateOne({ name: product.brand }, { productCount: count });
    }
    if (product.category) {
      const count = await Product.countDocuments({ category: product.category });
      await Category.updateOne({ name: product.category }, { productCount: count });
    }
    if (product.style) {
      const count = await Product.countDocuments({ style: product.style });
      await Style.updateOne({ name: product.style }, { productCount: count });
    }

    successResponse(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Product with this SKU already exists', 400);
    } else {
      errorResponse(res, 'Failed to create product', 500);
    }
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Log reviews for debugging
    if (updates.reviews) {
      console.log('📝 Updating product with reviews:', updates.reviews.length);
      console.log('Reviews data:', JSON.stringify(updates.reviews, null, 2));
    }

    const existing = await Product.findById(id);

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    // Verify reviews were saved
    if (product?.reviews) {
      console.log('✅ Reviews saved to product:', product.reviews.length);
    }

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // If brand/category/style changed, update counts for both old and new
    const changedBrand = existing?.brand !== product.brand;
    const changedCategory = existing?.category !== product.category;
    const changedStyle = existing?.style !== product.style;

    if (changedBrand) {
      if (existing?.brand) {
        const oldCount = await Product.countDocuments({ brand: existing.brand });
        await Brand.updateOne({ name: existing.brand }, { productCount: oldCount });
      }
      if (product.brand) {
        const newCount = await Product.countDocuments({ brand: product.brand });
        await Brand.updateOne({ name: product.brand }, { productCount: newCount });
      }
    }
    if (changedCategory) {
      if (existing?.category) {
        const oldCount = await Product.countDocuments({ category: existing.category });
        await Category.updateOne({ name: existing.category }, { productCount: oldCount });
      }
      if (product.category) {
        const newCount = await Product.countDocuments({ category: product.category });
        await Category.updateOne({ name: product.category }, { productCount: newCount });
      }
    }
    if (changedStyle) {
      if (existing?.style) {
        const oldCount = await Product.countDocuments({ style: existing.style });
        await Style.updateOne({ name: existing.style }, { productCount: oldCount });
      }
      if (product.style) {
        const newCount = await Product.countDocuments({ style: product.style });
        await Style.updateOne({ name: product.style }, { productCount: newCount });
      }
    }

    successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Product with this SKU already exists', 400);
    } else {
      errorResponse(res, 'Failed to update product', 500);
    }
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Update counts for related entities
    if (product?.brand) {
      const count = await Product.countDocuments({ brand: product.brand });
      await Brand.updateOne({ name: product.brand }, { productCount: count });
    }
    if (product?.category) {
      const count = await Product.countDocuments({ category: product.category });
      await Category.updateOne({ name: product.category }, { productCount: count });
    }
    if (product?.style) {
      const count = await Product.countDocuments({ style: product.style });
      await Style.updateOne({ name: product.style }, { productCount: count });
    }

    successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Failed to delete product', 500);
  }
};

/**
 * Search products
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      errorResponse(res, 'Search query is required', 400);
      return;
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ],
      status: 'active',
    })
      .limit(parseInt(limit as string))
      .sort({ promoted: -1, createdAt: -1 })
      .select('name price images category sku');

    successResponse(res, products);
  } catch (error) {
    console.error('Search products error:', error);
    errorResponse(res, 'Failed to search products', 500);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      featured: true,
      status: 'active',
    })
      .limit(parseInt(limit as string))
      .sort({ promoted: -1, createdAt: -1 });

    successResponse(res, products);
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Failed to get featured products', 500);
  }
};

/**
 * Get personalized products for the current user (cart + wishlist first, then featured).
 * Requires authentication.
 */
export const getPersonalizedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 10, 50);
    const userId = req.user!.id;

    const [cartItems, wishlistItems] = await Promise.all([
      Cart.find({ userId }).select('productId').lean(),
      Wishlist.find({ userId }).select('productId').lean(),
    ]);
    const personalIds = [...new Set([
      ...cartItems.map((i: any) => String(i.productId)),
      ...wishlistItems.map((i: any) => String(i.productId)),
    ])].filter(Boolean);

    let products: any[] = [];
    if (personalIds.length > 0) {
      products = await Product.find({
        _id: { $in: personalIds },
        status: 'active',
      })
        .sort({ promoted: -1, createdAt: -1 })
        .limit(limitNum)
        .lean();
    }

    const haveIds = new Set(products.map((p: any) => String(p._id)));
    if (products.length < limitNum) {
      const featured = await Product.find({
        featured: true,
        status: 'active',
        _id: { $nin: Array.from(haveIds) },
      })
        .sort({ promoted: -1, createdAt: -1 })
        .limit(limitNum - products.length)
        .lean();
      products = [...products, ...featured];
    }

    successResponse(res, products);
  } catch (error) {
    console.error('Get personalized products error:', error);
    errorResponse(res, 'Failed to get personalized products', 500);
  }
};

/**
 * Update product status
 */
export const updateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      errorResponse(res, 'Status is required', 400);
      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    successResponse(res, product, 'Product status updated successfully');
  } catch (error) {
    console.error('Update product status error:', error);
    errorResponse(res, 'Failed to update product status', 500);
  }
};

/**
 * Toggle product featured status
 */
export const toggleFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { featured },
      { new: true, runValidators: true }
    );

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    successResponse(res, product, `Product ${featured ? 'featured' : 'unfeatured'} successfully`);
  } catch (error) {
    console.error('Toggle featured error:', error);
    errorResponse(res, 'Failed to update featured status', 500);
  }
};

/**
 * Toggle product promoted status (appears first in search, homepage, categories)
 */
export const togglePromoted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { promoted } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { promoted: !!promoted },
      { new: true, runValidators: true }
    );

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    successResponse(res, product, `Product ${promoted ? 'promoted' : 'unpromoted'} successfully`);
  } catch (error) {
    console.error('Toggle promoted error:', error);
    errorResponse(res, 'Failed to update promoted status', 500);
  }
};

/**
 * Duplicate product (creates a copy with new SKU and "Copy" in name)
 */
export const duplicateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const source = await Product.findById(id).lean();
    if (!source) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    const { _id, __v, createdAt, updatedAt, sku, name, ...rest } = source as any;
    const baseSku = (sku || 'COPY').replace(/\s*\(copy\)$/i, '');
    let newSku = `${baseSku}-copy-${Date.now()}`;
    let attempts = 0;
    while (await Product.findOne({ sku: newSku }) && attempts < 10) {
      newSku = `${baseSku}-copy-${Date.now()}-${++attempts}`;
    }

    const copy = await Product.create({
      ...rest,
      name: (name || 'Product').trim().replace(/\s*\(copy\)\s*$/i, '').trim() + ' (Copy)',
      sku: newSku,
      promoted: false,
    });

    successResponse(res, copy, 'Product duplicated successfully', 201);
  } catch (error: any) {
    console.error('Duplicate product error:', error);
    errorResponse(res, error.message || 'Failed to duplicate product', 500);
  }
};

/**
 * Delete a single review from a product.
 * Handles both: (1) reviews from Review collection (by ObjectId), (2) embedded reviews (by id/_id or numeric index).
 */
export const deleteProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    const embeddedReviews = Array.isArray(product.reviews) ? [...product.reviews] : [];

    if (mongoose.Types.ObjectId.isValid(reviewId) && String(new mongoose.Types.ObjectId(reviewId)) === reviewId) {
      const reviewDoc = await Review.findOne({ _id: reviewId, productId });
      if (reviewDoc) {
        await Review.findByIdAndDelete(reviewId);
        const remainingReviewDocs = await Review.find({ productId }).lean();
        const fromEmbedded = embeddedReviews.map((r: any) => (r.rating || 0));
        const fromCollection = remainingReviewDocs.map((r: any) => r.rating || 0);
        const allRatings = [...fromEmbedded, ...fromCollection];
        product.reviewCount = Math.max(0, allRatings.length);
        product.rating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
        await product.save();
        successResponse(res, product, 'Review deleted successfully');
        return;
      }
    }

    let idx = embeddedReviews.findIndex(
      (r: any) => String(r.id) === reviewId || String(r._id) === reviewId
    );
    if (idx === -1 && /^\d+$/.test(reviewId)) {
      idx = parseInt(reviewId, 10);
      if (idx < 0 || idx >= embeddedReviews.length) idx = -1;
    }
    if (idx === -1) {
      errorResponse(res, 'Review not found', 404);
      return;
    }

    embeddedReviews.splice(idx, 1);
    product.reviews = embeddedReviews;
    product.reviewCount = Math.max(0, (product.reviewCount || 0) - 1);
    product.rating =
      embeddedReviews.length > 0
        ? embeddedReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / embeddedReviews.length
        : 0;
    await product.save();
    successResponse(res, product, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete product review error:', error);
    errorResponse(res, 'Failed to delete review', 500);
  }
};

