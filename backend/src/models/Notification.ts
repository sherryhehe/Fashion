import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'discount' | 'sale' | 'new_product' | 'order_update' | 'general';
  targetAudience: 'all' | 'specific';
  targetUsers?: string[]; // Array of user IDs if targetAudience is 'specific'
  targetSegment?: 'active' | 'inactive' | 'new' | 'vip'; // User segment
  image?: string;
  actionUrl?: string; // Deep link or URL to open when clicked
  actionText?: string; // Button text like "Shop Now", "View Deal"
  discountCode?: string; // If it's a discount notification
  discountPercentage?: number;
  expiryDate?: Date; // When the notification/offer expires
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled: boolean;
  scheduledTime?: Date; // When to send if scheduled
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: Date;
  sentCount: number; // Number of users who received it
  viewedCount: number; // Number of users who viewed it
  clickedCount: number; // Number of users who clicked
  createdBy: mongoose.Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['discount', 'sale', 'new_product', 'order_update', 'general'],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all',
    },
    targetUsers: [{
      type: String,
    }],
    targetSegment: {
      type: String,
      enum: ['active', 'inactive', 'new', 'vip'],
    },
    image: {
      type: String,
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
      maxlength: 50,
    },
    discountCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    expiryDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    scheduled: {
      type: Boolean,
      default: false,
    },
    scheduledTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft',
    },
    sentAt: {
      type: Date,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    viewedCount: {
      type: Number,
      default: 0,
    },
    clickedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ scheduledTime: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

