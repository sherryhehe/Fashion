import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  rating: number;
  comment: string;
  name: string;
  date: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReviewSchema.index({ productId: 1, date: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
