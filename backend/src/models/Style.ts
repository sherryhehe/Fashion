import mongoose, { Schema, Document } from 'mongoose';

export interface IStyle extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  status: 'active' | 'inactive';
  featured: boolean;
  popular: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StyleSchema = new Schema<IStyle>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    icon: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
StyleSchema.index({ slug: 1 });
StyleSchema.index({ status: 1 });
StyleSchema.index({ featured: 1 });

export default mongoose.model<IStyle>('Style', StyleSchema);

