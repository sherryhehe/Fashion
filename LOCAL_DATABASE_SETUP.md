# Local MongoDB Database Setup Guide

## Current Configuration

- **Database Name**: `larkon`
- **Connection String**: `mongodb://127.0.0.1:27017/larkon`
- **Config File**: `backend/local.env`
- **MongoDB Status**: ✅ Running

## Quick Start

### 1. Start Your Backend (Connects to Local DB)

```bash
cd backend
npm run dev
```

The backend will automatically:
- Connect to `mongodb://127.0.0.1:27017/larkon`
- Create default admin user if it doesn't exist
- Show database connection status

### 2. View Database Collections

#### Using MongoDB Compass (Recommended - GUI)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass
2. **Install and Open**
3. **Connect**: Use connection string `mongodb://127.0.0.1:27017`
4. **Select Database**: Click on `larkon` database
5. **Browse Collections**: 
   - `users` - All users (admin, customers)
   - `products` - All products
   - `categories` - Product categories
   - `brands` - Brand information
   - `orders` - Customer orders
   - `carts` - Shopping carts
   - `wishlists` - User wishlists
   - `reviews` - Product reviews
   - `banners` - Homepage banners
   - `styles` - Product styles
   - `notifications` - User notifications

#### Using Command Line (mongosh)

```bash
# Connect to database
mongosh mongodb://127.0.0.1:27017/larkon

# View all collections
show collections

# View all products
db.products.find().pretty()

# View all users
db.users.find().pretty()

# View all orders
db.orders.find().pretty()

# Count documents
db.products.countDocuments()
db.users.countDocuments()
db.orders.countDocuments()
```

## Common Database Operations

### View All Products
```javascript
db.products.find().pretty()
```

### View All Users
```javascript
db.users.find().pretty()
```

### View All Orders
```javascript
db.orders.find().pretty()
```

### Find Product by Name
```javascript
db.products.find({ name: /velvet/i })
```

### Find Orders by Status
```javascript
db.orders.find({ status: "pending" })
```

### Update Product Price
```javascript
db.products.updateOne(
  { _id: ObjectId("product_id_here") },
  { $set: { price: 2000 } }
)
```

### Delete All Test Orders
```javascript
db.orders.deleteMany({})
```

### Delete All Products
```javascript
db.products.deleteMany({})
```

### Reset Entire Database (⚠️ Careful!)
```javascript
db.dropDatabase()
```

## Add Sample Data

### Option 1: Use Sample Data Scripts

```bash
cd backend

# Add simple sample data
npx ts-node src/scripts/addSimpleSampleData.ts

# Or add full sample data (if available)
npx ts-node src/scripts/addSampleData.ts
```

### Option 2: Import JSON Files

Your project has sample data files in `backend/sample-data/`:
- `brands.json`
- `categories.json`
- `products.json`
- `styles.json`

You can import them using MongoDB Compass or command line.

## Default Admin User

When you first start the backend, it automatically creates:
- **Email**: `admin@shopo.com` (from `local.env`)
- **Password**: `admin123` (from `local.env`)

You can change these in `backend/local.env`:
```env
ADMIN_EMAIL=admin@shopo.com
ADMIN_PASSWORD=admin123
```

## Testing Tips

### 1. Create Test Users
- Register through mobile app or admin panel
- Or create directly in database using MongoDB Compass

### 2. Create Test Products
- Use admin panel at `http://localhost:3001`
- Or add directly via API/scripts

### 3. Create Test Orders
- Add items to cart in mobile app
- Complete checkout process
- View orders in database

### 4. Reset for Testing
```javascript
// In mongosh
use larkon
db.orders.deleteMany({})
db.carts.deleteMany({})
// Keep users and products for testing
```

## Database Structure

### Collections Overview

1. **users** - User accounts (admin, customers)
2. **products** - Product catalog
3. **categories** - Product categories
4. **brands** - Brand information
5. **orders** - Customer orders
6. **carts** - Shopping carts
7. **wishlists** - User wishlists
8. **reviews** - Product reviews
9. **banners** - Homepage banners
10. **styles** - Product styles
11. **notifications** - User notifications

## Troubleshooting

### MongoDB Not Running
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or manually
mongod --config /opt/homebrew/etc/mongod.conf
```

### Connection Error
- Check if MongoDB is running: `ps aux | grep mongod`
- Verify connection string in `backend/local.env`
- Check MongoDB logs

### Database Not Found
- The database is created automatically on first connection
- Just start your backend server

## Useful MongoDB Commands

```bash
# Show all databases
mongosh --eval "db.adminCommand('listDatabases')"

# Show current database
db.getName()

# Show all collections
show collections

# Count documents in collection
db.products.countDocuments()

# Find one document
db.products.findOne()

# Delete one document
db.products.deleteOne({ _id: ObjectId("...") })

# Update one document
db.products.updateOne(
  { _id: ObjectId("...") },
  { $set: { price: 1500 } }
)
```

## Next Steps

1. **Start Backend**: `cd backend && npm run dev`
2. **Open MongoDB Compass**: Connect to `mongodb://127.0.0.1:27017`
3. **Browse Database**: Explore the `larkon` database
4. **Add Sample Data**: Run sample data scripts if needed
5. **Test Your App**: Use mobile app/admin panel to test features

---

**Note**: This is your local development database. Changes here won't affect production.

