import { Request, Response } from 'express';
import Brand from '../models/Brand';
import Product from '../models/Product';
import { successResponse, errorResponse } from '../utils/responseHelper';

/**
 * Get all brands
 */
export const getAllBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, featured, verified, search } = req.query;
    
    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (verified !== undefined) filter.verified = verified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let brands = await Brand.find(filter)
      .select('-bankInfo') // Exclude sensitive bank info
      .sort({ createdAt: -1 })
      .lean();
    
    // Ensure banner field is always present (null if doesn't exist)
    brands = brands.map((brand: any) => ({
      ...brand,
      banner: brand.banner || null,
    }));

    // Compute live product counts grouped by brand name
    const productCounts = await Product.aggregate([
      { $match: { brand: { $nin: [null, ''] } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } }
    ]);
    const brandNameToCount = new Map<string, number>(
      productCounts.map((pc: any) => [pc._id as string, pc.count as number])
    );

    const brandsWithCounts = brands.map(b => ({
      ...b,
      productCount: brandNameToCount.get(b.name) || 0,
    }));
    
    successResponse(res, brandsWithCounts);
  } catch (error) {
    console.error('Get all brands error:', error);
    errorResponse(res, 'Failed to fetch brands', 500);
  }
};

/**
 * Get brand by ID
 */
export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('📥 GET BRAND BY ID REQUEST');
    console.log('Brand ID:', id);

    const brand = await Brand.findById(id).select('-bankInfo');

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    const brandObj: any = brand.toObject();
    
    // Ensure banner field is always present (null if doesn't exist)
    if (brandObj.banner === undefined || brandObj.banner === null || brandObj.banner === '') {
      brandObj.banner = null;
    }
    
    console.log('✅ BRAND FOUND');
    console.log('Brand Banner:', brandObj.banner);
    console.log('Full Brand Data:', JSON.stringify(brandObj, null, 2));

    successResponse(res, brandObj);
  } catch (error) {
    console.error('Get brand by ID error:', error);
    errorResponse(res, 'Failed to fetch brand', 500);
  }
};

/**
 * Create brand
 */
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 CREATE BRAND REQUEST RECEIVED');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Banner in request body:', req.body.banner);

    const {
      name,
      slug,
      email,
      phone,
      website,
      logo,
      banner,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      status,
      commission,
      socialMedia,
      businessInfo,
    } = req.body;

    console.log('Extracted banner:', banner);

    // Validate required fields
    if (!name || !email) {
      errorResponse(res, 'Name and email are required', 400);
      return;
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if email already exists
    const existingBrandByEmail = await Brand.findOne({ email });
    if (existingBrandByEmail) {
      errorResponse(res, 'Brand with this email already exists', 400);
      return;
    }

    // Check if slug already exists
    const existingBrandBySlug = await Brand.findOne({ slug: finalSlug });
    if (existingBrandBySlug) {
      errorResponse(res, 'Brand with this slug already exists', 400);
      return;
    }

    // Create brand
    const brandData: any = {
      name,
      slug: finalSlug,
      email,
      phone,
      website,
      logo,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      status: status || 'pending',
      commission: commission || 10,
      socialMedia,
      businessInfo,
    };

    // Only add banner if it exists (avoid undefined fields)
    if (banner && banner.trim() !== '') {
      brandData.banner = banner;
      console.log('✅ Banner will be saved:', banner);
    } else {
      console.log('ℹ️ No banner provided or banner is empty');
    }

    console.log('📦 Brand data to create:', JSON.stringify(brandData, null, 2));

    const brand = await Brand.create(brandData);

    console.log('✅ BRAND CREATED SUCCESSFULLY');
    console.log('Created Brand Banner:', brand.banner);
    console.log('Created Brand:', JSON.stringify(brand.toObject(), null, 2));

    successResponse(res, brand, 'Brand created successfully', 201);
  } catch (error) {
    console.error('Create brand error:', error);
    errorResponse(res, 'Failed to create brand', 500);
  }
};

/**
 * Update brand
 */
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📥 UPDATE BRAND REQUEST RECEIVED');
    console.log('Brand ID:', id);
    console.log('Update Data:', JSON.stringify(updateData, null, 2));
    console.log('Banner in updateData:', updateData.banner);

    const brand = await Brand.findById(id);

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== brand.email) {
      const existingBrand = await Brand.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existingBrand) {
        errorResponse(res, 'Brand with this email already exists', 400);
        return;
      }
    }

    // Check if slug is being changed and if it's already taken
    if (updateData.slug && updateData.slug !== brand.slug) {
      const existingBrand = await Brand.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existingBrand) {
        errorResponse(res, 'Brand with this slug already exists', 400);
        return;
      }
    }

    // Build update data, explicitly handling banner
    const finalUpdateData = { ...updateData };
    
    // Explicitly handle banner field
    if (updateData.banner !== undefined) {
      if (updateData.banner && updateData.banner.trim() !== '') {
        finalUpdateData.banner = updateData.banner;
        console.log('✅ Banner will be updated:', updateData.banner);
      } else {
        // If banner is empty string or null, remove it
        finalUpdateData.banner = null;
        console.log('ℹ️ Banner will be cleared');
      }
    } else {
      console.log('ℹ️ Banner not in update data, keeping existing value');
    }

    console.log('📦 Final update data:', JSON.stringify(finalUpdateData, null, 2));

    // Update brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { $set: finalUpdateData },
      { new: true, runValidators: true }
    ).select('-bankInfo');

    console.log('✅ BRAND UPDATED SUCCESSFULLY');
    console.log('Updated Brand Banner:', updatedBrand?.banner);
    console.log('Updated Brand:', JSON.stringify(updatedBrand?.toObject(), null, 2));

    successResponse(res, updatedBrand, 'Brand updated successfully');
  } catch (error) {
    console.error('Update brand error:', error);
    errorResponse(res, 'Failed to update brand', 500);
  }
};

/**
 * Delete brand
 */
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    successResponse(res, null, 'Brand deleted successfully');
  } catch (error) {
    console.error('Delete brand error:', error);
    errorResponse(res, 'Failed to delete brand', 500);
  }
};

/**
 * Get featured brands
 */
export const getFeaturedBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find({ featured: true, status: 'active' })
      .select('-bankInfo')
      .sort({ totalSales: -1 })
      .limit(10);
    
    successResponse(res, brands);
  } catch (error) {
    console.error('Get featured brands error:', error);
    errorResponse(res, 'Failed to fetch featured brands', 500);
  }
};

/**
 * Get top brands
 */
export const getTopBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const brands = await Brand.find({ status: 'active' })
      .select('-bankInfo')
      .sort({ totalSales: -1, rating: -1 })
      .limit(limit);
    
    successResponse(res, brands);
  } catch (error) {
    console.error('Get top brands error:', error);
    errorResponse(res, 'Failed to fetch top brands', 500);
  }
};

/**
 * Update brand status
 */
export const updateBrandStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'pending'].includes(status)) {
      errorResponse(res, 'Invalid status', 400);
      return;
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).select('-bankInfo');

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    successResponse(res, brand, 'Brand status updated successfully');
  } catch (error) {
    console.error('Update brand status error:', error);
    errorResponse(res, 'Failed to update brand status', 500);
  }
};

/**
 * Toggle brand featured status
 */
export const toggleBrandFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    brand.featured = !brand.featured;
    await brand.save();

    successResponse(res, brand, `Brand ${brand.featured ? 'added to' : 'removed from'} featured`);
  } catch (error) {
    console.error('Toggle brand featured error:', error);
    errorResponse(res, 'Failed to toggle brand featured status', 500);
  }
};

/**
 * Update brand verification status
 */
export const updateBrandVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { verified } = req.body as { verified: boolean };

    if (typeof verified !== 'boolean') {
      errorResponse(res, 'verified must be a boolean', 400);
      return;
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      { $set: { verified } },
      { new: true, runValidators: true }
    ).select('-bankInfo');

    if (!brand) {
      errorResponse(res, 'Brand not found', 404);
      return;
    }

    successResponse(res, brand, `Brand ${verified ? 'verified' : 'unverified'} successfully`);
  } catch (error) {
    console.error('Update brand verification error:', error);
    errorResponse(res, 'Failed to update brand verification status', 500);
  }
};

