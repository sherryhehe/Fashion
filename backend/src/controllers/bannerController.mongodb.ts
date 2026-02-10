import { Request, Response } from 'express';
import Banner from '../models/Banner';
import { successResponse, errorResponse } from '../utils/responseHelper';

export async function listBanners(req: Request, res: Response) {
	try {
		const { position, status } = req.query as { position?: string; status?: string };
		const filter: Record<string, any> = {};
		if (position) filter.position = position;
		if (status) filter.status = status;
		const banners = await Banner.find(filter).sort({ createdAt: -1 });
		// Convert MongoDB _id to id for frontend consistency
		const formattedBanners = banners.map(banner => {
			const bannerObj = banner.toObject() as any;
			return {
				...bannerObj,
				id: bannerObj._id.toString(),
				_id: undefined,
			};
		});
		successResponse(res, formattedBanners);
	} catch (error) {
		errorResponse(res, 'Failed to get banners', 500);
	}
}

export async function getBannerById(req: Request, res: Response) {
	try {
		const banner = await Banner.findById(req.params.id);
		if (!banner) return errorResponse(res, 'Banner not found', 404);
		// Convert MongoDB _id to id for frontend consistency
		const bannerObj = banner.toObject() as any;
		const formattedBanner = {
			...bannerObj,
			id: bannerObj._id.toString(),
			_id: undefined,
		};
		successResponse(res, formattedBanner);
	} catch (error) {
		errorResponse(res, 'Failed to get banner', 500);
	}
}

export async function createBanner(req: Request, res: Response) {
	try {
		const banner = await Banner.create(req.body);
		// Convert MongoDB _id to id for frontend consistency
		const bannerObj = banner.toObject() as any;
		const formattedBanner = {
			...bannerObj,
			id: bannerObj._id.toString(),
			_id: undefined,
		};
		successResponse(res, formattedBanner, 'Banner created', 201);
	} catch (error) {
		errorResponse(res, 'Failed to create banner', 400);
	}
}

export async function updateBanner(req: Request, res: Response) {
	try {
		const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!banner) return errorResponse(res, 'Banner not found', 404);
		// Convert MongoDB _id to id for frontend consistency
		const bannerObj = banner.toObject() as any;
		const formattedBanner = {
			...bannerObj,
			id: bannerObj._id.toString(),
			_id: undefined,
		};
		successResponse(res, formattedBanner, 'Banner updated');
	} catch (error) {
		errorResponse(res, 'Failed to update banner', 400);
	}
}

export async function deleteBanner(req: Request, res: Response) {
	try {
		const banner = await Banner.findByIdAndDelete(req.params.id);
		if (!banner) return errorResponse(res, 'Banner not found', 404);
		// Convert MongoDB _id to id for frontend consistency
		const bannerObj = banner.toObject() as any;
		const formattedBanner = {
			...bannerObj,
			id: bannerObj._id.toString(),
			_id: undefined,
		};
		successResponse(res, formattedBanner, 'Banner deleted');
	} catch (error) {
		errorResponse(res, 'Failed to delete banner', 400);
	}
}
