import mongoose, { Schema, Document, Model } from 'mongoose';

export interface BannerDocument extends Document {
	 title: string;
	 subtitle?: string;
	 imageUrl: string;
	 linkUrl?: string;
	 position: 'header' | 'sidebar' | 'footer' | 'homepage';
	 size?: string;
	 status: 'active' | 'inactive' | 'draft';
	 clicks: number;
	 ctr?: number;
	 startDate?: Date;
	 endDate?: Date;
	 createdAt: Date;
	 updatedAt: Date;
}

const BannerSchema = new Schema<BannerDocument>(
	{
		title: { type: String, required: true, trim: true },
		subtitle: { type: String, trim: true },
		imageUrl: { type: String, required: true },
		linkUrl: { type: String },
		position: { type: String, enum: ['header', 'sidebar', 'footer', 'homepage'], required: true },
		size: { type: String },
		status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
		clicks: { type: Number, default: 0 },
		ctr: { type: Number, default: 0 },
		startDate: { type: Date },
		endDate: { type: Date },
	},
	{ timestamps: true }
);

const Banner: Model<BannerDocument> = mongoose.models.Banner || mongoose.model<BannerDocument>('Banner', BannerSchema);
export default Banner;
