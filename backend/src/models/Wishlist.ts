import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem extends Document {
  userId: string;
  productId: string;
  color?: string;
  size?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistItem>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
    },
    color: { type: String },
    size: { type: String },
  },
  {
    timestamps: true,
  }
);

WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IWishlistItem>('Wishlist', WishlistSchema);
