/**
 * Simple script to add sample data to the database
 */

import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Style from '../models/Style';

const addSimpleSampleData = async () => {
  try {
    console.log('🔄 Adding simple sample data...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/larkon-fashion');

    // Add a simple category
    const category = await Category.create({
      name: 'Accessories',
      description: 'Beautiful accessories',
      status: 'active',
      productCount: 0,
    });
    console.log('✅ Added category:', category.name);

    // Add a simple brand
    const brand = await Brand.create({
      name: 'KhussaKraft',
      slug: 'khussakraft',
      email: 'info@khussakraft.com',
      description: 'Handmade Pakistani khussa',
      status: 'active',
      featured: true,
      verified: true,
      rating: 4.9,
      reviewCount: 15,
      productCount: 0,
      totalSales: 0,
      commission: 10,
    });
    console.log('✅ Added brand:', brand.name);

    // Add a simple style
    const style = await Style.create({
      name: 'Casual',
      slug: 'casual',
      description: 'Relaxed style',
      status: 'active',
      featured: true,
      popular: true,
      productCount: 0,
    });
    console.log('✅ Added style:', style.name);

    // Add a simple product
    const product = await Product.create({
      name: 'Velvet Shawl',
      description: 'Luxurious velvet shawl perfect for special occasions',
      price: 1800,
      originalPrice: 2200,
      discount: 18,
      category: 'Accessories',
      brand: 'KhussaKraft',
      style: 'Casual',
      sku: 'VELVET-SHAWL-001',
      stock: 50,
      images: ['/uploads/velvet-shawl-1.jpg'],
      featured: true,
      status: 'active',
      specifications: {
        Material: 'Premium Velvet',
        Color: 'Maroon',
        Size: 'One Size',
      },
      variations: [
        { size: 'One Size', color: 'Maroon', price: 1800, stock: 25 },
        { size: 'One Size', color: 'Navy', price: 1800, stock: 25 }
      ],
      rating: 4.9,
      reviewCount: 11,
      features: [
        'Premium velvet material',
        'Elegant design',
        'Perfect for special occasions',
        'Comfortable to wear'
      ],
      tags: ['velvet', 'shawl', 'luxury']
    });
    console.log('✅ Added product:', product.name);

    console.log('🎉 Simple sample data added successfully!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
};

// Run the script
addSimpleSampleData();
