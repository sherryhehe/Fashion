import app from './app-mongodb';
import { connectMongoDB } from './config/mongodb';
import { User } from './models';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables (prefer local.env if present)
const localEnvPath = path.join(__dirname, '..', 'local.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 5000;

// Initialize database with default admin user if needed
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@larkon.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('📝 Creating default admin user...');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });
      
      console.log(`✅ Admin user created: ${adminEmail}`);
      console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    }
    
    // Get counts
    const userCount = await User.countDocuments();
    const { Product, Category, Order } = await import('./models');
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log('✅ Database initialized successfully');
    console.log('📊 Current data counts:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Orders: ${orderCount}`);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Initialize database
    await initializeDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🚀 API URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: MongoDB`);
      console.log('🚀 ===================================\n');
      
      console.log('📱 Mobile App Connection:');
      console.log(`   Update API_URL in your React Native app to:`);
      console.log(`   http://YOUR_LOCAL_IP:${PORT}/api`);
      console.log(`   (Find your IP with: ipconfig or ifconfig)\n`);
      
      console.log('💻 Admin Panel Connection:');
      console.log(`   Update NEXT_PUBLIC_API_URL to:`);
      console.log(`   http://localhost:${PORT}/api\n`);
      
      console.log('🔑 Default Admin Credentials:');
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@larkon.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await import('./config/mongodb').then(m => m.disconnectMongoDB());
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await import('./config/mongodb').then(m => m.disconnectMongoDB());
  process.exit(0);
});

// Start the server
startServer();

