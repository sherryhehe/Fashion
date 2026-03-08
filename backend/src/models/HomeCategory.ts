import mongoose, { Document, Schema } from 'mongoose';

export interface IHomeCategory extends Document {
  name: string;
  slug: string;
  order: number;
  productIds: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const HomeCategorySchema = new Schema<IHomeCategory>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    productIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

HomeCategorySchema.index({ status: 1, order: 1 });

export default mongoose.model<IHomeCategory>('HomeCategory', HomeCategorySchema);
