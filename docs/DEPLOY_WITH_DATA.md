# Deploy Code and Data to Production

## Quick Deploy

Deploy both code changes and migrate data in one command:

```bash
./deploy-with-data.sh
```

This script will:
1. ✅ Migrate categories and styles from local MongoDB to production
2. ✅ Build and deploy backend code
3. ✅ Build and deploy admin panel code
4. ✅ Restart services on production server

## What Gets Deployed

### Data Migration
- **Categories** from local MongoDB → Production MongoDB Atlas
- **Styles** from local MongoDB → Production MongoDB Atlas
- Updates existing items if they have the same name/slug
- Creates new items if they don't exist

### Code Deployment
- **Backend:** All TypeScript changes, routes, controllers, middleware
- **Admin Panel:** All React/Next.js changes, components, pages
- **Dependencies:** Installed on production server

## Step-by-Step Process

### Step 1: Data Migration

The script will:
1. Connect to your local MongoDB (127.0.0.1:27017)
2. Connect to production MongoDB Atlas
3. Copy all categories and styles
4. Show progress and summary

**You'll be prompted:** "Continue with data migration? (y/n)"

### Step 2: Backend Deployment

The script will:
1. Build TypeScript: `npm run build`
2. Create archive with `dist/`, `package.json`, `uploads/`
3. Upload to production server
4. Extract and install dependencies
5. Restart PM2 process: `pm2 reload shop-backend`

### Step 3: Admin Panel Deployment

The script will:
1. Build Next.js with production API URL
2. Create archive with `.next/`, `public/`, config files
3. Upload to production server
4. Extract and install dependencies (--force for platform compatibility)
5. Restart PM2 process: `pm2 restart shop-admin`

## Prerequisites

1. ✅ MongoDB Atlas cluster is resumed and running
2. ✅ Local MongoDB has categories and styles to migrate
3. ✅ Backend code is ready (no TypeScript errors)
4. ✅ Admin code is ready (no build errors)
5. ✅ SSH access to production server (password: `8wANN666BG6xXa2@`)

## Manual Steps (Alternative)

If you prefer to do it step by step:

### 1. Migrate Data First

```bash
cd backend
./migrate-to-production.sh
```

### 2. Deploy Backend

```bash
./deploy-backend-direct.sh
```

### 3. Deploy Admin

```bash
./deploy-admin-production.sh
```

## Verification

After deployment, verify everything works:

### Check Services
```bash
ssh root@31.97.232.219 "pm2 list"
```

### Check Backend Health
```bash
curl https://api.buyshopo.com/api/health
```

### Check Admin Panel
Open: https://admin.buyshopo.com

### Check Data
1. Login to admin panel
2. Navigate to Categories page
3. Navigate to Styles page
4. Verify your migrated data is there

## Troubleshooting

### Migration Fails

**Error:** "Cannot connect to MongoDB Atlas"
- Check if cluster is resumed: https://cloud.mongodb.com
- Wait 2-3 minutes after resuming

**Error:** "No data found"
- Verify local MongoDB has categories/styles
- Check you're connected to correct database

### Backend Deployment Fails

**Error:** "Build failed"
- Fix TypeScript errors: `cd backend && npm run build`
- Check for missing dependencies

**Error:** "PM2 process not found"
- Script will create new process automatically
- Check logs: `pm2 logs shop-backend`

### Admin Deployment Fails

**Error:** "Build failed"
- Fix Next.js errors: `cd admin && npm run build`
- Check for missing dependencies

**Error:** "Platform not supported"
- Script uses `--force` flag to handle this
- If still fails, check Node.js version on server

### Services Not Responding

**Check PM2 status:**
```bash
ssh root@31.97.232.219 "pm2 list"
```

**Check logs:**
```bash
ssh root@31.97.232.219 "pm2 logs --lines 50"
```

**Restart services:**
```bash
ssh root@31.97.232.219 "pm2 restart shop-backend shop-admin"
```

## Important Notes

### ⚠️ Data Safety

- Migration **updates** existing items with same name/slug
- It does **NOT** delete anything from production
- Always verify data after migration

### 🔄 Zero Downtime

- Backend uses `pm2 reload` (zero downtime)
- Admin uses `pm2 restart` (brief downtime ~5-10 seconds)

### 📦 Uploads Directory

- Local uploads in `backend/uploads/` are **NOT** deployed
- Production uploads stay on server at `/var/www/ShopProject/backend/uploads/`
- Only code changes are deployed

### 🔐 Credentials

- VPS Password: `8wANN666BG6xXa2@`
- MongoDB Atlas: Connection string in `backend/local.env`

## After Deployment

1. ✅ Verify admin panel loads: https://admin.buyshopo.com
2. ✅ Verify API responds: https://api.buyshopo.com/api/health
3. ✅ Check categories and styles are migrated
4. ✅ Test creating/editing items
5. ✅ Test image uploads

## Rollback (If Needed)

If something goes wrong:

```bash
# SSH to server
ssh root@31.97.232.219

# Restore backend backup
cd /var/www/ShopProject/backend
ls -la dist.backup.*  # Find latest backup
mv dist.backup.YYYYMMDD_HHMMSS dist

# Restore admin backup
cd /var/www/ShopProject/admin
ls -la .next.backup.*  # Find latest backup
mv .next.backup.YYYYMMDD_HHMMSS .next

# Restart services
pm2 restart shop-backend shop-admin
```

