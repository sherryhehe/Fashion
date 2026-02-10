import { Request, Response } from 'express';
import Style from '../models/Style';
import { successResponse, errorResponse } from '../utils/responseHelper';

/**
 * Get all styles
 */
export const getAllStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, featured, popular } = req.query;
    
    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (popular !== undefined) filter.popular = popular === 'true';

    const styles = await Style.find(filter).sort({ createdAt: -1 });
    
    successResponse(res, styles);
  } catch (error) {
    console.error('Get all styles error:', error);
    errorResponse(res, 'Failed to fetch styles', 500);
  }
};

/**
 * Get style by ID
 */
export const getStyleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('📥 GET STYLE BY ID REQUEST');
    console.log('Style ID:', id);

    const style = await Style.findById(id);

    if (!style) {
      errorResponse(res, 'Style not found', 404);
      return;
    }

    const styleObj: any = style.toObject();
    
    // Ensure image and icon fields are always present (null if doesn't exist)
    if (styleObj.image === undefined || styleObj.image === null || styleObj.image === '') {
      styleObj.image = null;
    }
    if (styleObj.icon === undefined || styleObj.icon === null || styleObj.icon === '') {
      styleObj.icon = null;
    }
    
    console.log('✅ STYLE FOUND');
    console.log('Style Image:', styleObj.image);
    console.log('Style Icon:', styleObj.icon);
    console.log('Full Style Data:', JSON.stringify(styleObj, null, 2));

    successResponse(res, styleObj);
  } catch (error) {
    console.error('Get style by ID error:', error);
    errorResponse(res, 'Failed to fetch style', 500);
  }
};

/**
 * Create style
 */
export const createStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 CREATE STYLE REQUEST RECEIVED');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Image in request body:', req.body.image);
    console.log('Icon in request body:', req.body.icon);

    const { name, slug, description, image, icon, status, featured, popular } = req.body;

    // Validate required fields
    if (!name) {
      errorResponse(res, 'Name is required', 400);
      return;
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug already exists
    const existingStyle = await Style.findOne({ slug: finalSlug });
    if (existingStyle) {
      errorResponse(res, 'Style with this slug already exists', 400);
      return;
    }

    // Create style
    const styleData: any = {
      name,
      slug: finalSlug,
      description,
      status: status || 'active',
      featured: featured || false,
      popular: popular || false,
      productCount: 0,
    };

    // Only add image/icon if they exist
    if (image && image.trim() !== '') {
      styleData.image = image;
      console.log('✅ Image will be saved:', image);
    } else {
      console.log('ℹ️ No image provided');
    }

    if (icon && icon.trim() !== '') {
      styleData.icon = icon;
      console.log('✅ Icon will be saved:', icon);
    } else {
      console.log('ℹ️ No icon provided');
    }

    console.log('📦 Style data to create:', JSON.stringify(styleData, null, 2));

    const style = await Style.create(styleData);

    console.log('✅ STYLE CREATED SUCCESSFULLY');
    console.log('Created Style Image:', style.image);
    console.log('Created Style Icon:', style.icon);

    successResponse(res, style, 'Style created successfully', 201);
  } catch (error) {
    console.error('Create style error:', error);
    errorResponse(res, 'Failed to create style', 500);
  }
};

/**
 * Update style
 */
export const updateStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📥 UPDATE STYLE REQUEST RECEIVED');
    console.log('Style ID:', id);
    console.log('Update Data:', JSON.stringify(updateData, null, 2));
    console.log('Image in updateData:', updateData.image);
    console.log('Icon in updateData:', updateData.icon);

    const style = await Style.findById(id);

    if (!style) {
      errorResponse(res, 'Style not found', 404);
      return;
    }

    // Check if slug is being changed and if it's already taken
    if (updateData.slug && updateData.slug !== style.slug) {
      const existingStyle = await Style.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existingStyle) {
        errorResponse(res, 'Style with this slug already exists', 400);
        return;
      }
    }

    // Build update data, explicitly handling image and icon
    const finalUpdateData = { ...updateData };
    
    // Explicitly handle image field
    if (updateData.image !== undefined) {
      if (updateData.image && updateData.image.trim() !== '') {
        finalUpdateData.image = updateData.image;
        console.log('✅ Image will be updated:', updateData.image);
      } else {
        finalUpdateData.image = null;
        console.log('ℹ️ Image will be cleared');
      }
    } else {
      console.log('ℹ️ Image not in update data, keeping existing value');
    }

    // Explicitly handle icon field
    if (updateData.icon !== undefined) {
      if (updateData.icon && updateData.icon.trim() !== '') {
        finalUpdateData.icon = updateData.icon;
        console.log('✅ Icon will be updated:', updateData.icon);
      } else {
        finalUpdateData.icon = null;
        console.log('ℹ️ Icon will be cleared');
      }
    } else {
      console.log('ℹ️ Icon not in update data, keeping existing value');
    }

    console.log('📦 Final update data:', JSON.stringify(finalUpdateData, null, 2));

    // Update fields
    if (finalUpdateData.name !== undefined) style.name = finalUpdateData.name;
    if (finalUpdateData.slug !== undefined) style.slug = finalUpdateData.slug;
    if (finalUpdateData.description !== undefined) style.description = finalUpdateData.description;
    if (finalUpdateData.image !== undefined) style.image = finalUpdateData.image;
    if (finalUpdateData.icon !== undefined) style.icon = finalUpdateData.icon;
    if (finalUpdateData.status !== undefined) style.status = finalUpdateData.status;
    if (finalUpdateData.featured !== undefined) style.featured = finalUpdateData.featured;
    if (finalUpdateData.popular !== undefined) style.popular = finalUpdateData.popular;

    await style.save();

    console.log('✅ STYLE UPDATED SUCCESSFULLY');
    console.log('Updated Style Image:', style.image);
    console.log('Updated Style Icon:', style.icon);

    successResponse(res, style, 'Style updated successfully');
  } catch (error) {
    console.error('Update style error:', error);
    errorResponse(res, 'Failed to update style', 500);
  }
};

/**
 * Delete style
 */
export const deleteStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const style = await Style.findByIdAndDelete(id);

    if (!style) {
      errorResponse(res, 'Style not found', 404);
      return;
    }

    successResponse(res, null, 'Style deleted successfully');
  } catch (error) {
    console.error('Delete style error:', error);
    errorResponse(res, 'Failed to delete style', 500);
  }
};

/**
 * Get featured styles
 */
export const getFeaturedStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const styles = await Style.find({ featured: true, status: 'active' }).sort({ createdAt: -1 });
    
    successResponse(res, styles);
  } catch (error) {
    console.error('Get featured styles error:', error);
    errorResponse(res, 'Failed to fetch featured styles', 500);
  }
};

/**
 * Get popular styles
 */
export const getPopularStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const styles = await Style.find({ popular: true, status: 'active' })
      .sort({ productCount: -1 })
      .limit(10);
    
    successResponse(res, styles);
  } catch (error) {
    console.error('Get popular styles error:', error);
    errorResponse(res, 'Failed to fetch popular styles', 500);
  }
};

