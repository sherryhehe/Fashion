import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  productId: string;
  size?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
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
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
