# 🔗 Connect Local Development to Production Database

## ⚠️ WARNING

**Using production database locally is DANGEROUS!**
- You could accidentally modify or delete production data
- Always use read-only access if possible
- Consider creating a staging/test database instead
- Make backups before making any changes

## 📋 Prerequisites

1. Get production MongoDB connection string from server
2. Ensure your IP is whitelisted in MongoDB (if using MongoDB Atlas)
3. Have MongoDB connection credentials

## 🔧 Setup Steps

### Step 1: Get Production MongoDB Connection String

The production MongoDB connection string should be in the server's `.env` file:

```bash
# SSH into production server
ssh root@31.97.232.219

# Check the connection string
cat /var/www/ShopProject/backend/.env | grep MONGODB_URI
```

**Common MongoDB connection formats:**
- **MongoDB Atlas (Cloud):** `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Self-hosted:** `mongodb://username:password@host:27017/database?authSource=admin`
- **Local MongoDB:** `mongodb://localhost:27017/database`

### Step 2: Create Local Environment File

Create or update `backend/local.env`:

```bash
cd backend
cp local.env local.env.backup  # Backup existing config
```

Edit `backend/local.env`:

```env
PORT=8000
NODE_ENV=development

# Production MongoDB connection (USE WITH CAUTION!)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production_db?retryWrites=true&w=majority

# OR for self-hosted MongoDB:
# MONGODB_URI=mongodb://username:password@your-server-ip:27017/production_db?authSource=admin

# JWT (use same as production for testing)
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d

# Admin credentials (should match production)
ADMIN_EMAIL=admin@shopo.com
ADMIN_PASSWORD=admin123

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19000

# Uploads
UPLOAD_DIR=uploads
```

### Step 3: Test Connection

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: production_db_name
🔗 Host: cluster.mongodb.net
```

### Step 4: Verify Data

Check if you can see production data:

```bash
# Using MongoDB Compass or mongo-express
# Or check logs when starting the server
```

## 🛡️ Safety Recommendations

### Option 1: Read-Only Connection (Recommended)

If your MongoDB supports it, use a read-only user:

```env
MONGODB_URI=mongodb+srv://readonly_user:password@cluster.mongodb.net/production_db?readPreference=secondary
```

### Option 2: Use Separate Database

Create a staging database and sync data:

```bash
# Export from production
mongodump --uri="production_uri" --out=./backup

# Import to local/staging
mongorestore --uri="mongodb://localhost:27017/staging_db" ./backup
```

### Option 3: Use Environment-Specific Config

Create different configs:

```bash
# backend/local.env.production (for production DB access)
MONGODB_URI=production_connection_string

# backend/local.env.staging (for staging DB)
MONGODB_URI=staging_connection_string

# backend/local.env.local (for local DB)
MONGODB_URI=mongodb://127.0.0.1:27017/larkon
```

Then load the appropriate one:
```bash
# Use production DB
cp local.env.production local.env

# Use staging DB
cp local.env.staging local.env

# Use local DB
cp local.env.local local.env
```

## 🔍 Troubleshooting

### Connection Refused
- Check if MongoDB allows connections from your IP
- Verify firewall rules
- Check MongoDB Atlas IP whitelist

### Authentication Failed
- Verify username/password
- Check `authSource` parameter
- Ensure user has proper permissions

### SSL/TLS Errors
- For MongoDB Atlas, ensure `mongodb+srv://` protocol is used
- For self-hosted, may need to disable SSL: `?ssl=false`

## 📝 Quick Reference

**Switch to Production DB:**
```bash
# Edit backend/local.env
# Set MONGODB_URI to production connection string
# Restart backend: npm run dev
```

**Switch back to Local DB:**
```bash
# Edit backend/local.env
# Set MONGODB_URI=mongodb://127.0.0.1:27017/larkon
# Restart backend: npm run dev
```

## 🚨 Important Notes

1. **Never commit production credentials to git**
2. **Always use `.env` files (already in `.gitignore`)**
3. **Test changes on staging first**
4. **Make backups before major changes**
5. **Use read-only access when possible**

