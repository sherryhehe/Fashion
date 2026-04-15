import mongoose from 'mongoose';
import Product from '../models/Product';

const runBackfill = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/larkon-fashion';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const result = await Product.updateMany(
      {
        $or: [
          { shippingFees: { $exists: false } },
          { shippingTime: { $exists: false } },
          { notes: { $exists: false } },
        ],
      },
      {
        $set: {
          shippingFees: 0,
          shippingTime: '',
          notes: '',
        },
      }
    );

    console.log(`Backfill complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

runBackfill();
