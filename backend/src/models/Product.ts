import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  style?: string;
  sku: string;
  stock: number;
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  specifications: Record<string, any>;
  variations: any[];
  features?: string[];
  tags?: string[];
  rating: number;
  reviewCount: number;
  reviews?: Array<{
    id: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
    verified?: boolean;
  }>;
  salesCount?: number;
  views?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
    },
    style: {
      type: String,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    variations: {
      type: Schema.Types.Mixed,
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    reviews: {
      type: [{
        id: Number,
        name: String,
        rating: Number,
        comment: String,
        date: String,
        verified: {
          type: Boolean,
          default: false,
        },
      }],
      default: [],
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    seo: {
      type: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: String,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ sku: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);

