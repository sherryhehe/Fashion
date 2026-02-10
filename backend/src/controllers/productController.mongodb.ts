import { Request, Response } from 'express';
import Product from '../models/Product';
import Brand from '../models/Brand';
import Category from '../models/Category';
import Style from '../models/Style';
import Review from '../models/Review';
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

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sortBy as string]: sortOrder };

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
      .sort({ createdAt: -1 });

    successResponse(res, products);
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Failed to get featured products', 500);
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

