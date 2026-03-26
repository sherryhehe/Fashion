import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables (prefer local.env if present, same as index-mongodb.ts)
const localEnvPath = path.join(__dirname, '..', '..', 'local.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

const MONGODB_URI = 'mongodb+srv://shopo_admin:G4LSU5NPc12XvLPy@cluster0.zikm9az.mongodb.net/larkon_fashion?retryWrites=true&w=majority&appName=Cluster0';

export const connectMongoDB = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('💡 Make sure MongoDB is running or check your connection string');
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

export default { connectMongoDB, disconnectMongoDB };

