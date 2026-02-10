/**
 * Script to add sample data to the database
 * This will populate the database with realistic sample data for development
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Style from '../models/Style';

// Sample Categories Data
const sampleCategories = [
  {
    name: 'Accessories',
    description: 'Beautiful accessories to complete your look',
    image: '/uploads/accessories.jpg',
    status: 'active',
    productCount: 0,
  },
  {
    name: 'Bags',
    description: 'Stylish bags for every occasion',
    image: '/uploads/bags.jpg',
    status: 'active',
    productCount: 0,
  },
  {
    name: 'Shoes',
    description: 'Comfortable and stylish footwear',
    image: '/uploads/shoes.jpg',
    status: 'active',
    productCount: 0,
  },
  {
    name: 'Makeup',
    description: 'Premium makeup and beauty products',
    image: '/uploads/makeup.jpg',
    status: 'active',
    productCount: 0,
  },
  {
    name: 'Clothes',
    description: 'Fashionable clothing for all seasons',
    image: '/uploads/clothes.jpg',
    status: 'active',
    productCount: 0,
  },
  {
    name: 'Jewelry',
    description: 'Elegant jewelry and ornaments',
    image: '/uploads/jewelry.jpg',
    status: 'active',
    productCount: 0,
  },
];

// Sample Styles Data
const sampleStyles = [
  {
    name: 'Casual',
    slug: 'casual',
    description: 'Relaxed and comfortable everyday style',
    image: '/uploads/casual.jpg',
    status: 'active',
    featured: true,
    popular: true,
    productCount: 0,
  },
  {
    name: 'Desi',
    slug: 'desi',
    description: 'Traditional Pakistani and South Asian fashion',
    image: '/uploads/desi.jpg',
    status: 'active',
    featured: true,
    popular: true,
    productCount: 0,
  },
  {
    name: 'Streetwear',
    slug: 'streetwear',
    description: 'Urban and trendy street fashion',
    image: '/uploads/streetwear.jpg',
    status: 'active',
    featured: true,
    popular: true,
    productCount: 0,
  },
  {
    name: 'Formal',
    slug: 'formal',
    description: 'Elegant formal wear for special occasions',
    image: '/uploads/formal.jpg',
    status: 'active',
    featured: false,
    popular: false,
    productCount: 0,
  },
];

// Sample Brands Data
const sampleBrands = [
  {
    name: 'KhussaKraft',
    slug: 'khussakraft',
    email: 'info@khussakraft.com',
    phone: '+92-300-1234567',
    description: 'Handmade Pakistani khussa and traditional footwear',
    logo: '/uploads/khussakraft-logo.jpg',
    website: 'https://khussakraft.com',
    address: 'Lahore, Pakistan',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    status: 'active',
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 15,
    productCount: 0,
    totalSales: 0,
    commission: 10,
  },
  {
    name: 'UrbanStreet',
    slug: 'urbanstreet',
    email: 'hello@urbanstreet.com',
    phone: '+92-300-7654321',
    description: 'Streetwear for Gen-Z fashion enthusiasts',
    logo: '/uploads/urbanstreet-logo.jpg',
    website: 'https://urbanstreet.com',
    address: 'Karachi, Pakistan',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    status: 'active',
    featured: true,
    verified: true,
    rating: 4.8,
    reviewCount: 12,
    productCount: 0,
    totalSales: 0,
    commission: 12,
  },
  {
    name: 'Khaddi',
    slug: 'khaddi',
    email: 'contact@khaddi.com',
    phone: '+92-300-9876543',
    description: 'Traditional Pakistani clothing and textiles',
    logo: '/uploads/khaddi-logo.jpg',
    website: 'https://khaddi.com',
    address: 'Islamabad, Pakistan',
    city: 'Islamabad',
    state: 'Federal',
    country: 'Pakistan',
    status: 'active',
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 18,
    productCount: 0,
    totalSales: 0,
    commission: 15,
  },
  {
    name: 'SilkHouse',
    slug: 'silkhouse',
    email: 'info@silkhouse.com',
    phone: '+92-300-1111111',
    description: 'Premium silk and luxury fabrics',
    logo: '/uploads/silkhouse-logo.jpg',
    website: 'https://silkhouse.com',
    address: 'Faisalabad, Pakistan',
    city: 'Faisalabad',
    state: 'Punjab',
    country: 'Pakistan',
    status: 'active',
    featured: false,
    verified: true,
    rating: 4.7,
    reviewCount: 8,
    productCount: 0,
    totalSales: 0,
    commission: 8,
  },
];

// Sample Products Data
const sampleProducts = [
  {
    name: 'Velvet Shawl',
    description: 'Luxurious velvet shawl perfect for special occasions. Made with premium quality velvet fabric.',
    price: 1800,
    originalPrice: 2200,
    discount: 18,
    category: 'Accessories',
    brand: 'SilkHouse',
    style: 'Desi',
    sku: 'VELVET-SHAWL-001',
    stock: 50,
    images: ['/uploads/velvet-shawl-1.jpg', '/uploads/velvet-shawl-2.jpg'],
    featured: true,
    status: 'active',
    specifications: {
      Material: 'Premium Velvet',
      Color: 'Maroon',
      Size: 'One Size',
      Care: 'Dry Clean Only'
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
    tags: ['velvet', 'shawl', 'luxury', 'desi']
  },
  {
    name: 'Chunky Sneakers',
    description: 'Trendy chunky sneakers perfect for streetwear style. Comfortable and stylish.',
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    category: 'Shoes',
    brand: 'UrbanStreet',
    style: 'Streetwear',
    sku: 'CHUNKY-SNEAKERS-001',
    stock: 30,
    images: ['/uploads/chunky-sneakers-1.jpg', '/uploads/chunky-sneakers-2.jpg'],
    featured: true,
    status: 'active',
    specifications: {
      Material: 'Canvas & Rubber',
      Color: 'White',
      Size: 'Multiple Sizes',
      Care: 'Machine Washable'
    },
    variations: [
      { size: '8', color: 'White', price: 2500, stock: 10 },
      { size: '9', color: 'White', price: 2500, stock: 10 },
      { size: '10', color: 'White', price: 2500, stock: 10 }
    ],
    rating: 4.8,
    reviewCount: 15,
    features: [
      'Comfortable cushioning',
      'Durable construction',
      'Trendy chunky design',
      'Versatile styling'
    ],
    tags: ['sneakers', 'streetwear', 'chunky', 'casual']
  },
  {
    name: 'Silk Dupatta',
    description: 'Beautiful silk dupatta with intricate embroidery. Perfect for traditional wear.',
    price: 1500,
    originalPrice: 1800,
    discount: 17,
    category: 'Accessories',
    brand: 'SilkHouse',
    style: 'Desi',
    sku: 'SILK-DUPATTA-001',
    stock: 40,
    images: ['/uploads/silk-dupatta-1.jpg', '/uploads/silk-dupatta-2.jpg'],
    featured: true,
    status: 'active',
    specifications: {
      Material: 'Pure Silk',
      Color: 'Pink',
      Size: 'One Size',
      Care: 'Dry Clean Only'
    },
    variations: [
      { size: 'One Size', color: 'Pink', price: 1500, stock: 20 },
      { size: 'One Size', color: 'Red', price: 1500, stock: 20 }
    ],
    rating: 4.9,
    reviewCount: 8,
    features: [
      'Pure silk material',
      'Intricate embroidery',
      'Traditional design',
      'Luxury feel'
    ],
    tags: ['silk', 'dupatta', 'traditional', 'embroidery']
  },
  {
    name: 'Handmade Khussa',
    description: 'Traditional handmade khussa with beautiful leather work. Authentic Pakistani craftsmanship.',
    price: 3200,
    originalPrice: 3800,
    discount: 16,
    category: 'Shoes',
    brand: 'KhussaKraft',
    style: 'Desi',
    sku: 'HANDMADE-KHUSSA-001',
    stock: 25,
    images: ['/uploads/handmade-khussa-1.jpg', '/uploads/handmade-khussa-2.jpg'],
    featured: true,
    status: 'active',
    specifications: {
      Material: 'Leather',
      Color: 'Brown',
      Size: 'Multiple Sizes',
      Care: 'Leather Care'
    },
    variations: [
      { size: '8', color: 'Brown', price: 3200, stock: 8 },
      { size: '9', color: 'Brown', price: 3200, stock: 8 },
      { size: '10', color: 'Brown', price: 3200, stock: 9 }
    ],
    rating: 4.9,
    reviewCount: 12,
    features: [
      'Handmade craftsmanship',
      'Premium leather',
      'Traditional design',
      'Comfortable fit'
    ],
    tags: ['khussa', 'handmade', 'leather', 'traditional']
  },
  {
    name: 'Mini Crossbody Bag',
    description: 'Stylish mini crossbody bag perfect for everyday use. Compact yet spacious.',
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    category: 'Bags',
    brand: 'UrbanStreet',
    style: 'Casual',
    sku: 'MINI-CROSSBODY-001',
    stock: 35,
    images: ['/uploads/mini-crossbody-1.jpg', '/uploads/mini-crossbody-2.jpg'],
    featured: false,
    status: 'active',
    specifications: {
      Material: 'Canvas',
      Color: 'Black',
      Size: 'One Size',
      Care: 'Spot Clean'
    },
    variations: [
      { size: 'One Size', color: 'Black', price: 1200, stock: 20 },
      { size: 'One Size', color: 'Brown', price: 1200, stock: 15 }
    ],
    rating: 4.7,
    reviewCount: 6,
    features: [
      'Compact design',
      'Adjustable strap',
      'Multiple compartments',
      'Durable material'
    ],
    tags: ['crossbody', 'mini', 'casual', 'everyday']
  },
  {
    name: 'Gold Jhumka',
    description: 'Elegant gold jhumka earrings with traditional design. Perfect for special occasions.',
    price: 2800,
    originalPrice: 3200,
    discount: 13,
    category: 'Jewelry',
    brand: 'Khaddi',
    style: 'Desi',
    sku: 'GOLD-JHUMKA-001',
    stock: 20,
    images: ['/uploads/gold-jhumka-1.jpg', '/uploads/gold-jhumka-2.jpg'],
    featured: false,
    status: 'active',
    specifications: {
      Material: 'Gold Plated',
      Color: 'Gold',
      Size: 'One Size',
      Care: 'Clean with Soft Cloth'
    },
    variations: [
      { size: 'One Size', color: 'Gold', price: 2800, stock: 20 }
    ],
    rating: 4.8,
    reviewCount: 9,
    features: [
      'Gold plated finish',
      'Traditional design',
      'Comfortable to wear',
      'Elegant appearance'
    ],
    tags: ['jhumka', 'gold', 'traditional', 'jewelry']
  },
  {
    name: 'Button Down Shirt',
    description: 'Classic button down shirt in premium cotton. Perfect for both casual and formal wear.',
    price: 3000,
    originalPrice: 3500,
    discount: 14,
    category: 'Clothes',
    brand: 'UrbanStreet',
    style: 'Casual',
    sku: 'BUTTON-SHIRT-001',
    stock: 45,
    images: ['/uploads/button-shirt-1.jpg', '/uploads/button-shirt-2.jpg'],
    featured: false,
    status: 'active',
    specifications: {
      Material: 'Cotton',
      Color: 'White',
      Size: 'Multiple Sizes',
      Care: 'Machine Washable'
    },
    variations: [
      { size: 'M', color: 'White', price: 3000, stock: 15 },
      { size: 'L', color: 'White', price: 3000, stock: 15 },
      { size: 'XL', color: 'White', price: 3000, stock: 15 }
    ],
    rating: 4.6,
    reviewCount: 7,
    features: [
      'Premium cotton',
      'Classic design',
      'Comfortable fit',
      'Versatile styling'
    ],
    tags: ['shirt', 'button', 'cotton', 'casual']
  },
  {
    name: 'Leather Jacket',
    description: 'Stylish leather jacket perfect for streetwear. High quality leather with modern design.',
    price: 8500,
    originalPrice: 9500,
    discount: 11,
    category: 'Clothes',
    brand: 'UrbanStreet',
    style: 'Streetwear',
    sku: 'LEATHER-JACKET-001',
    stock: 15,
    images: ['/uploads/leather-jacket-1.jpg', '/uploads/leather-jacket-2.jpg'],
    featured: true,
    status: 'active',
    specifications: {
      Material: 'Genuine Leather',
      Color: 'Black',
      Size: 'Multiple Sizes',
      Care: 'Leather Care'
    },
    variations: [
      { size: 'M', color: 'Black', price: 8500, stock: 5 },
      { size: 'L', color: 'Black', price: 8500, stock: 5 },
      { size: 'XL', color: 'Black', price: 8500, stock: 5 }
    ],
    rating: 4.9,
    reviewCount: 18,
    features: [
      'Genuine leather',
      'Modern design',
      'Comfortable fit',
      'Durable construction'
    ],
    tags: ['jacket', 'leather', 'streetwear', 'premium']
  }
];

const addSampleData = async () => {
  try {
    console.log('🔄 Adding sample data to database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/larkon-fashion');

    // Clear existing sample data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing sample data...');
    await Category.deleteMany({ name: { $in: sampleCategories.map(c => c.name) } });
    await Style.deleteMany({ name: { $in: sampleStyles.map(s => s.name) } });
    await Brand.deleteMany({ name: { $in: sampleBrands.map(b => b.name) } });
    await Product.deleteMany({ name: { $in: sampleProducts.map(p => p.name) } });

    // Add Categories
    console.log('📁 Adding categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Added ${createdCategories.length} categories`);

    // Add Styles
    console.log('🎨 Adding styles...');
    const createdStyles = await Style.insertMany(sampleStyles);
    console.log(`✅ Added ${createdStyles.length} styles`);

    // Add Brands
    console.log('🏪 Adding brands...');
    const createdBrands = await Brand.insertMany(sampleBrands);
    console.log(`✅ Added ${createdBrands.length} brands`);

    // Add Products
    console.log('📦 Adding products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${createdProducts.length} products`);

    // Update category and brand product counts
    console.log('📊 Updating product counts...');
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category.name });
      await Category.updateOne({ _id: category._id }, { productCount: count });
    }

    for (const brand of createdBrands) {
      const count = await Product.countDocuments({ brand: brand.name });
      await Brand.updateOne({ _id: brand._id }, { productCount: count });
    }

    for (const style of createdStyles) {
      const count = await Product.countDocuments({ style: style.name });
      await Style.updateOne({ _id: style._id }, { productCount: count });
    }

    console.log('🎉 Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Styles: ${createdStyles.length}`);
    console.log(`   - Brands: ${createdBrands.length}`);
    console.log(`   - Products: ${createdProducts.length}`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
};

// Run the script
addSampleData();
