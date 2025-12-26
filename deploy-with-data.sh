#!/bin/bash

# Deploy code and migrate data to production
# This script:
# 1. Migrates categories and styles from local to production MongoDB
# 2. Deploys backend code to production
# 3. Deploys admin panel code to production

set -e

VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASSWORD="8wANN666BG6xXa2@"
BACKEND_DIR="/var/www/ShopProject/backend"
ADMIN_DIR="/var/www/ShopProject/admin"

echo "🚀 Deploying Code and Data to Production"
echo "=========================================="
echo ""

# Step 1: Migrate Data
echo "📦 Step 1: Migrating Categories and Styles to Production..."
echo ""

cd "$(dirname "$0")/backend"

if [ ! -f "migrate-local-to-production.js" ]; then
  echo "❌ Migration script not found!"
  exit 1
fi

echo "⚠️  This will copy categories and styles from local MongoDB to production MongoDB Atlas"
read -p "Continue with data migration? (y/n): " migrate_confirm

if [ "$migrate_confirm" = "y" ] || [ "$migrate_confirm" = "Y" ]; then
  echo ""
  echo "🔄 Running migration..."
  node migrate-local-to-production.js
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Data migration completed!"
  else
    echo ""
    echo "❌ Data migration failed!"
    read -p "Continue with code deployment anyway? (y/n): " continue_deploy
    if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
      exit 1
    fi
  fi
else
  echo "⏭️  Skipping data migration"
fi

echo ""
echo "=========================================="
echo ""

# Step 2: Deploy Backend
echo "📦 Step 2: Deploying Backend to Production..."
echo ""

cd "$(dirname "$0")"

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Backend build failed!"
  exit 1
fi

# Create archive
echo "📦 Creating backend archive..."
cd ..
tar -czf backend-deploy.tar.gz \
  backend/dist \
  backend/package.json \
  backend/package-lock.json \
  backend/uploads \
  --exclude='backend/uploads/*' \
  --exclude='backend/node_modules' 2>/dev/null || true

# Upload to server
echo "📤 Uploading backend to server..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no backend-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Extract and install on server
echo "🔧 Installing backend on server..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << ENDSSH
cd $BACKEND_DIR

# Backup current dist
if [ -d "dist" ]; then
  mv dist dist.backup.\$(date +%Y%m%d_%H%M%S)
fi

# Extract new files
tar -xzf /tmp/backend-deploy.tar.gz -C $BACKEND_DIR --strip-components=1

# Install dependencies
npm ci --production

# Restart PM2 process
if pm2 list | grep -q "shop-backend"; then
  pm2 reload shop-backend
else
  pm2 start dist/index-mongodb.js --name shop-backend --cwd $BACKEND_DIR
fi

pm2 save

# Cleanup
rm -f /tmp/backend-deploy.tar.gz

echo "✅ Backend deployed successfully"
ENDSSH

# Cleanup local archive
rm -f backend-deploy.tar.gz

echo ""
echo "✅ Backend deployment completed!"
echo ""

# Step 3: Deploy Admin Panel
echo "📦 Step 3: Deploying Admin Panel to Production..."
echo ""

cd "$(dirname "$0")"

# Build admin with production API URL
echo "🔨 Building admin panel..."
cd admin

# Set production API URL for build
export NEXT_PUBLIC_API_URL="https://api.buyshopo.com/api"

npm run build

if [ $? -ne 0 ]; then
  echo "❌ Admin build failed!"
  exit 1
fi

# Create archive
echo "📦 Creating admin archive..."
cd ..
tar -czf admin-deploy.tar.gz \
  admin/.next \
  admin/package.json \
  admin/package-lock.json \
  admin/public \
  admin/next.config.ts \
  --exclude='admin/node_modules' \
  --exclude='admin/.next/cache' 2>/dev/null || true

# Upload to server
echo "📤 Uploading admin panel to server..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no admin-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Extract and install on server
echo "🔧 Installing admin panel on server..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << ENDSSH
cd $ADMIN_DIR

# Backup current .next
if [ -d ".next" ]; then
  mv .next .next.backup.\$(date +%Y%m%d_%H%M%S)
fi

# Extract new files
tar -xzf /tmp/admin-deploy.tar.gz -C $ADMIN_DIR --strip-components=1

# Remove old node_modules and package-lock.json to avoid platform issues
rm -rf node_modules package-lock.json

# Install dependencies (force for platform compatibility)
npm install --production --force

# Restart PM2 process
if pm2 list | grep -q "shop-admin"; then
  pm2 restart shop-admin
else
  pm2 start npm --name shop-admin --cwd $ADMIN_DIR -- start
fi

pm2 save

# Cleanup
rm -f /tmp/admin-deploy.tar.gz

echo "✅ Admin panel deployed successfully"
ENDSSH

# Cleanup local archive
rm -f admin-deploy.tar.gz

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ Data migrated (categories & styles)"
echo "   ✅ Backend deployed"
echo "   ✅ Admin panel deployed"
echo ""
echo "🌐 Check your live sites:"
echo "   Admin: https://admin.buyshopo.com"
echo "   API: https://api.buyshopo.com/api/health"
echo ""
echo "💡 If you see issues:"
echo "   ssh root@$VPS_HOST 'pm2 logs --lines 50'"

