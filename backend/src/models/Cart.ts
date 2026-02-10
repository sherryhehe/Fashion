import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and product
CartSchema.index({ userId: 1, productId: 1 });

export default mongoose.model<ICart>('Cart', CartSchema);

