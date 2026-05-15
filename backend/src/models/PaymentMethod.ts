import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  instructions: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
