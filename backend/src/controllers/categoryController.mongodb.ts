import { Request, Response } from 'express';
import { Category } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    successResponse(res, categories);
  } catch (error) {
    console.error('Get categories error:', error);
    errorResponse(res, 'Failed to get categories', 500);
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    successResponse(res, category);
  } catch (error) {
    console.error('Get category error:', error);
    errorResponse(res, 'Failed to get category', 500);
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categoryData = req.body;

    if (!categoryData.name) {
      errorResponse(res, 'Category name is required', 400);
      return;
    }

    const category = await Category.create(categoryData);
    successResponse(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Category with this name already exists', 400);
    } else {
      errorResponse(res, 'Failed to create category', 500);
    }
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    successResponse(res, category, 'Category updated successfully');
  } catch (error: any) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Category with this name already exists', 400);
    } else {
      errorResponse(res, 'Failed to update category', 500);
    }
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    errorResponse(res, 'Failed to delete category', 500);
  }
};

