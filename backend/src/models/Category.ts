import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  productCount: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    slug: {
      type: String,
      trim: true,
    },
    parentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0,
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

// Index for faster queries
CategorySchema.index({ name: 1 });
CategorySchema.index({ status: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);

