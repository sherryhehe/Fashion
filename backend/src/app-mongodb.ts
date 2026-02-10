import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler';

// Import MongoDB routes
import authRoutes from './routes/authRoutes.mongodb';
import productRoutes from './routes/productRoutes.mongodb';
import categoryRoutes from './routes/categoryRoutes.mongodb';
import styleRoutes from './routes/styleRoutes.mongodb';
import brandRoutes from './routes/brandRoutes.mongodb';
import notificationRoutes from './routes/notificationRoutes.mongodb';
import cartRoutes from './routes/cartRoutes.mongodb';
import orderRoutes from './routes/orderRoutes.mongodb';
import dashboardRoutes from './routes/dashboardRoutes.mongodb';
import userRoutes from './routes/userRoutes.mongodb';
import uploadRoutes from './routes/uploadRoutes';
import reviewRoutes from './routes/reviewRoutes.mongodb';
import bannerRoutes from './routes/bannerRoutes.mongodb';

// Load environment variables (prefer local.env if present)
const localEnvPath = path.join(__dirname, '..', 'local.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

// Create Express app
const app: Application = express();

// CORS configuration
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:19000';
const allowedOrigins = allowedOriginsRaw.split(',').map(origin => origin.trim()).filter(Boolean);

// Always include production URLs
const productionOrigins = [
  'https://admin.buyshopo.com',
  'https://api.buyshopo.com',
  'https://buyshopo.com',
  'https://admin.buyshopo.com/api',
];

const allAllowedOrigins = [...productionOrigins];

console.log('🌐 CORS Allowed Origins:', allAllowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const originAllowed = allAllowedOrigins.includes(origin) || 
                         origin.startsWith('http://192.168.') || 
                         origin.startsWith('http://localhost:') ||
                         origin.startsWith('https://localhost:');
    
    if (originAllowed) {
      return callback(null, true);
    }
    
    console.warn('⚠️  CORS blocked origin:', origin);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware with increased limits for file uploads
// Note: For multipart/form-data (file uploads), these limits don't apply
// Multer handles file size limits separately
app.use(express.json({ limit: '50mb' })); // Increased for large JSON payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased for URL-encoded data

// Serve uploaded files statically at root
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes - must come before the /api/uploads route handler
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);

// Serve uploaded files through API route (for reverse proxy compatibility)
// This must come after all other API routes to avoid conflicts
// Use middleware to catch all /api/uploads requests
app.use('/api/uploads', (req, res, next) => {
  // Get the file path from the request (everything after /api/uploads)
  const requestedPath = req.path.startsWith('/api/uploads') 
    ? req.path.replace('/api/uploads', '') 
    : req.path;
  
  // Remove leading slash if present
  const cleanPath = requestedPath.startsWith('/') ? requestedPath.slice(1) : requestedPath;
  
  const filePath = path.join(__dirname, '../uploads', cleanPath);
  const resolvedPath = path.resolve(filePath);
  const uploadsDir = path.resolve(path.join(__dirname, '../uploads'));
  
  console.log('📁 File request:', {
    originalPath: req.originalUrl,
    reqPath: req.path,
    requestedPath: requestedPath,
    cleanPath: cleanPath,
    resolvedPath: resolvedPath,
    uploadsDir: uploadsDir,
    exists: fs.existsSync(resolvedPath)
  });
  
  // Security: prevent directory traversal
  if (!resolvedPath.startsWith(uploadsDir)) {
    console.error('❌ Security: Path traversal attempt');
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    console.error('❌ File not found:', resolvedPath);
    return res.status(404).json({
      success: false,
      error: 'File not found',
      requested: cleanPath,
      resolved: resolvedPath,
      uploadsDir: uploadsDir
    });
  }
  
  // Check if it's a file (not directory)
  const stats = fs.statSync(resolvedPath);
  if (!stats.isFile()) {
    return res.status(404).json({
      success: false,
      error: 'Not a file'
    });
  }
  
  // Set content type
  const ext = path.extname(resolvedPath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  if (contentTypes[ext]) {
    res.setHeader('Content-Type', contentTypes[ext]);
  }
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  
  // Serve the file
  console.log('✅ Serving file:', resolvedPath);
  res.sendFile(resolvedPath, (err) => {
    if (err) {
      console.error('❌ Error serving file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error serving file',
          message: err.message
        });
      }
    } else {
      console.log('✅ File served successfully:', cleanPath);
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Larkon Fashion API is running (MongoDB)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MongoDB',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Larkon Fashion API (MongoDB)',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      upload: '/api/upload',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;

