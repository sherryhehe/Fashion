# Recommended Backend Stack for Fashion App

**Projects:** Admin Panel (Next.js) + Mobile App (React Native)  
**Date:** October 10, 2025

---

## 🎯 Recommended Tech Stack

### Backend Framework: **Node.js + Express + TypeScript** ✅

**Why?**
- ✅ Same language as your frontend (JavaScript/TypeScript)
- ✅ Large ecosystem and community
- ✅ Easy to deploy
- ✅ Great for REST APIs
- ✅ You already know it from Next.js

**Alternative:** NestJS (if you want more structure)

---

## 💾 Database: **PostgreSQL** ✅

**Why?**
- ✅ Reliable and battle-tested
- ✅ Great for e-commerce (transactions, relations)
- ✅ Free and open source
- ✅ JSON support (flexible like MongoDB when needed)
- ✅ Better for complex queries

**Alternative:** MongoDB (if you prefer NoSQL)

---

## 🔐 Authentication: **JWT (JSON Web Tokens)** ✅

**Why?**
- ✅ Stateless (good for mobile apps)
- ✅ Works with both admin panel and mobile app
- ✅ Easy to implement
- ✅ Secure when done right

**Libraries:**
- `jsonwebtoken` - for creating/verifying tokens
- `bcrypt` - for password hashing

---

## 📦 Recommended NPM Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.0",
    "pg": "^8.11.3",              // PostgreSQL client
    "sequelize": "^6.35.0",       // ORM (or use Prisma)
    "jsonwebtoken": "^9.0.2",     // JWT auth
    "bcrypt": "^5.1.1",           // Password hashing
    "multer": "^1.4.5-lts.1",    // File uploads
    "cors": "^2.8.5",             // CORS handling
    "dotenv": "^16.3.1",          // Environment variables
    "express-validator": "^7.0.1", // Input validation
    "helmet": "^7.1.0",           // Security headers
    "compression": "^1.7.4",      // Response compression
    "morgan": "^1.10.0"           // Logging
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "nodemon": "^3.0.2",          // Auto-restart
    "ts-node": "^10.9.2"          // TypeScript execution
  }
}
```

---

## 📁 Recommended Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database config
│   │   └── app.ts               # Express app config
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── Product.ts           # Product model
│   │   ├── Order.ts             # Order model
│   │   ├── Category.ts          # Category model
│   │   └── index.ts             # Export all models
│   ├── controllers/
│   │   ├── authController.ts    # Login, register, etc.
│   │   ├── productController.ts # Product CRUD
│   │   ├── orderController.ts   # Order management
│   │   ├── userController.ts    # User management
│   │   └── index.ts
│   ├── routes/
│   │   ├── authRoutes.ts        # /api/auth/*
│   │   ├── productRoutes.ts     # /api/products/*
│   │   ├── orderRoutes.ts       # /api/orders/*
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── validateInput.ts     # Request validation
│   │   ├── errorHandler.ts      # Error handling
│   │   └── upload.ts            # File upload config
│   ├── services/
│   │   ├── emailService.ts      # Email sending
│   │   ├── paymentService.ts    # Payment integration
│   │   └── notificationService.ts # Push notifications
│   ├── utils/
│   │   ├── generateToken.ts     # JWT helpers
│   │   ├── hashPassword.ts      # Password helpers
│   │   └── responseHelper.ts    # API response format
│   └── index.ts                 # Main entry point
├── uploads/                     # Uploaded files (local)
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start Commands

### 1. Initialize Backend Project

```bash
# Create project folder
mkdir fashion-app-backend
cd fashion-app-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express typescript ts-node @types/node @types/express
npm install pg sequelize jsonwebtoken bcrypt multer cors dotenv
npm install express-validator helmet compression morgan
npm install -D nodemon @types/bcrypt @types/jsonwebtoken @types/multer

# Initialize TypeScript
npx tsc --init
```

### 2. Create Basic Express Server

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "watch": "tsc --watch"
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

---

## 🔌 API Endpoint Structure (Recommended)

```
Base URL: http://localhost:8000/api

Authentication:
  POST   /api/auth/register          # User registration
  POST   /api/auth/login             # User login
  POST   /api/auth/logout            # User logout
  GET    /api/auth/me                # Get current user
  POST   /api/auth/refresh           # Refresh token
  POST   /api/auth/forgot-password   # Forgot password
  POST   /api/auth/reset-password    # Reset password

Products:
  GET    /api/products               # List all products
  GET    /api/products/:id           # Get single product
  POST   /api/products               # Create product (admin)
  PUT    /api/products/:id           # Update product (admin)
  DELETE /api/products/:id           # Delete product (admin)
  GET    /api/products/featured      # Featured products
  GET    /api/products/search        # Search products

Categories:
  GET    /api/categories             # List all categories
  POST   /api/categories             # Create category (admin)
  PUT    /api/categories/:id         # Update category (admin)
  DELETE /api/categories/:id         # Delete category (admin)

Orders:
  GET    /api/orders                 # List orders
  GET    /api/orders/:id             # Get order details
  POST   /api/orders                 # Create order
  PATCH  /api/orders/:id/status      # Update order status (admin)
  POST   /api/orders/:id/cancel      # Cancel order

Cart:
  GET    /api/cart                   # Get user's cart
  POST   /api/cart/items             # Add item to cart
  PUT    /api/cart/items/:id         # Update cart item
  DELETE /api/cart/items/:id         # Remove from cart
  DELETE /api/cart                   # Clear cart

Users:
  GET    /api/users                  # List users (admin)
  GET    /api/users/:id              # Get user (admin)
  PUT    /api/users/:id              # Update user
  DELETE /api/users/:id              # Delete user (admin)

Profile:
  GET    /api/profile                # Get user profile
  PUT    /api/profile                # Update profile
  POST   /api/profile/avatar         # Upload avatar

Wishlist:
  GET    /api/wishlist               # Get user's wishlist
  POST   /api/wishlist               # Add to wishlist
  DELETE /api/wishlist/:productId    # Remove from wishlist

Upload:
  POST   /api/upload/image           # Upload single image
  POST   /api/upload/images          # Upload multiple images

Dashboard (Admin):
  GET    /api/dashboard/stats        # Dashboard statistics
  GET    /api/dashboard/sales        # Sales data
  GET    /api/dashboard/charts       # Chart data
```

---

## 📱 Mobile App API Connection

**In your React Native app:**

```typescript
// src/config/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's local IP address for development
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:8000/api'  // Replace with YOUR local IP
  : 'https://api.fashionshop.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Find your local IP:**

```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

## 🗄️ Database Setup (PostgreSQL)

### 1. Install PostgreSQL

```bash
# Mac (with Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

### 2. Create Database

```bash
# Access PostgreSQL
psql postgres

# Create database
CREATE DATABASE fashion_app;

# Create user
CREATE USER fashion_admin WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fashion_app TO fashion_admin;

# Exit
\q
```

### 3. Database Connection

```typescript
// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fashion_app',
  process.env.DB_USER || 'fashion_admin',
  process.env.DB_PASSWORD || 'your_password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;
```

---

## 🔐 Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fashion_app
DB_USER=fashion_admin
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19000

# Email (for later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Stripe - test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📊 Database Tables You'll Need

```sql
-- Users
- id
- name
- email
- password (hashed)
- role (admin, customer)
- avatar
- phone
- created_at
- updated_at

-- Products
- id
- name
- description
- price
- original_price
- discount
- category_id
- brand_id
- sku
- stock
- images (JSON array)
- featured
- status
- created_at
- updated_at

-- Categories
- id
- name
- description
- image
- parent_id
- created_at
- updated_at

-- Orders
- id
- user_id
- order_number
- total
- subtotal
- tax
- shipping_cost
- status
- payment_status
- payment_method
- shipping_address (JSON)
- created_at
- updated_at

-- Order_Items
- id
- order_id
- product_id
- quantity
- price
- total

-- Cart
- id
- user_id
- product_id
- quantity
- created_at
- updated_at

-- Wishlist
- id
- user_id
- product_id
- created_at
```

---

## 🧪 Testing Your API

### Using Postman or Thunder Client (VS Code)

**1. Register User:**
```http
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**2. Login:**
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**3. Get Products (with auth):**
```http
GET http://localhost:8000/api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Development Checklist

### Week 1: Setup & Authentication
- [ ] Setup Node.js + Express + TypeScript
- [ ] Setup PostgreSQL database
- [ ] Create user table
- [ ] Implement registration endpoint
- [ ] Implement login endpoint
- [ ] Implement JWT authentication
- [ ] Test with Postman

### Week 2: Products & Categories
- [ ] Create products table
- [ ] Create categories table
- [ ] Implement product CRUD
- [ ] Implement category CRUD
- [ ] Implement file upload
- [ ] Test with admin panel

### Week 3: Orders & Cart
- [ ] Create orders table
- [ ] Create cart table
- [ ] Implement cart management
- [ ] Implement order creation
- [ ] Implement order status updates
- [ ] Test with mobile app

### Week 4: Testing & Polish
- [ ] Test all endpoints
- [ ] Add input validation
- [ ] Add error handling
- [ ] Security improvements
- [ ] Documentation
- [ ] Performance optimization

---

## 🚀 Quick Commands Reference

```bash
# Start development server
npm run dev

# Start PostgreSQL
brew services start postgresql  # Mac
sudo service postgresql start   # Linux

# Access database
psql -d fashion_app -U fashion_admin

# Check what's running on port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process on port
kill -9 <PID>  # Mac/Linux
```

---

## 💡 Pro Tips

1. **Use TypeScript** - You're already familiar from Next.js
2. **Start Simple** - Don't over-engineer at the beginning
3. **Test Locally First** - Get everything working on localhost
4. **Use Git** - Commit frequently
5. **Environment Variables** - Never commit .env file
6. **Logging** - Use Morgan for request logging
7. **Error Handling** - Centralized error handler
8. **Validation** - Validate all inputs
9. **Security** - Use Helmet for basic security headers

---

## 📞 Need Help?

**Useful Resources:**
- Express.js Docs: https://expressjs.com/
- Sequelize Docs: https://sequelize.org/
- JWT Docs: https://jwt.io/
- PostgreSQL Docs: https://www.postgresql.org/docs/

**Ready to start? Let's build this! 🚀**

