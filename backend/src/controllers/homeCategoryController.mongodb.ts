import { Request, Response } from 'express';
import HomeCategory from '../models/HomeCategory';
import Product from '../models/Product';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get active home categories for app (public) - with products populated, sorted by order
 */
export const getActiveForApp = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await HomeCategory.find({ status: 'active' })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    const productIds = categories.flatMap((c: any) => c.productIds || []);
    const products = await Product.find(
      { _id: { $in: productIds }, status: 'active' }
    ).lean();
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
    const withProducts = categories.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      order: cat.order,
      products: (cat.productIds || [])
        .map((id: any) => productMap.get(id?.toString?.() || id))
        .filter(Boolean),
    }));
    successResponse(res, withProducts);
  } catch (error) {
    console.error('Get active home categories error:', error);
    errorResponse(res, 'Failed to fetch home categories', 500);
  }
};

/**
 * Get all home categories (admin)
 */
export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await HomeCategory.find().sort({ order: 1, createdAt: 1 });
    successResponse(res, categories);
  } catch (error) {
    console.error('Get home categories error:', error);
    errorResponse(res, 'Failed to fetch home categories', 500);
  }
};

/**
 * Get one by ID (admin)
 */
export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await HomeCategory.findById(id);
    if (!category) {
      errorResponse(res, 'Home category not found', 404);
      return;
    }
    successResponse(res, category);
  } catch (error) {
    console.error('Get home category error:', error);
    errorResponse(res, 'Failed to fetch home category', 500);
  }
};

/**
 * Create (admin)
 */
export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, order, productIds, status } = req.body;
    if (!name) {
      errorResponse(res, 'Name is required', 400);
      return;
    }
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await HomeCategory.create({
      name,
      slug: finalSlug,
      order: order ?? 0,
      productIds: productIds || [],
      status: status || 'active',
    });
    successResponse(res, category, 'Home category created', 201);
  } catch (error) {
    console.error('Create home category error:', error);
    errorResponse(res, 'Failed to create home category', 500);
  }
};

/**
 * Update (admin)
 */
export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, order, productIds, status } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (order !== undefined) updates.order = order;
    if (productIds !== undefined) updates.productIds = productIds;
    if (status !== undefined) updates.status = status;
    const category = await HomeCategory.findByIdAndUpdate(id, updates, { new: true });
    if (!category) {
      errorResponse(res, 'Home category not found', 404);
      return;
    }
    successResponse(res, category, 'Home category updated');
  } catch (error) {
    console.error('Update home category error:', error);
    errorResponse(res, 'Failed to update home category', 500);
  }
};

/**
 * Delete (admin)
 */
export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await HomeCategory.findByIdAndDelete(id);
    if (!category) {
      errorResponse(res, 'Home category not found', 404);
      return;
    }
    successResponse(res, { deleted: true }, 'Home category deleted');
  } catch (error) {
    console.error('Delete home category error:', error);
    errorResponse(res, 'Failed to delete home category', 500);
  }
};
