import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: 'active' | 'inactive' | 'pending';
  /** Allowed checkout methods for this brand: 'card', 'cash'. Empty or both = allow all. */
  allowedPaymentMethods: string[];
  featured: boolean;
  verified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  totalSales: number;
  commission: number; // Percentage commission on sales
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  businessInfo?: {
    businessType?: string;
    taxId?: string;
    licenseNumber?: string;
    establishedYear?: number;
  };
  bankInfo?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
    iban?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
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
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    allowedPaymentMethods: {
      type: [String],
      enum: ['card', 'cash'],
      default: ['card', 'cash'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 10, // Default 10% commission
      min: 0,
      max: 100,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    businessInfo: {
      businessType: String,
      taxId: String,
      licenseNumber: String,
      establishedYear: Number,
    },
    bankInfo: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      swiftCode: String,
      iban: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
BrandSchema.index({ slug: 1 });
BrandSchema.index({ email: 1 });
BrandSchema.index({ status: 1 });
BrandSchema.index({ featured: 1 });
BrandSchema.index({ verified: 1 });
BrandSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IBrand>('Brand', BrandSchema);

