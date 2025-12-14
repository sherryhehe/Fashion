#!/bin/bash
# Deploy Admin with PRODUCTION environment

set -e

echo "🚀 Deploying Admin with PRODUCTION config..."
echo ""

# Step 1: Build admin for PRODUCTION locally
echo "================================"
echo "🏗️  Building Admin for PRODUCTION..."
echo "================================"

cd /Users/abdullahjaspal/Documents/Project/ShopProject/admin

# Create production env BEFORE building
cat > .env.production.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api
EOF

echo "Production API URL: https://api.buyshopo.com/api"

# Clean and build
echo "Cleaning old build..."
rm -rf .next

echo "Building with production config..."
npm ci
npm run build

cd ..

# Step 2: Create deployment package (compressed for faster upload)
echo ""
echo "================================"
echo "📦 Packaging Admin..."
echo "================================"

mkdir -p /tmp/shop-admin-prod
rm -rf /tmp/shop-admin-prod/*

cp -r admin/.next /tmp/shop-admin-prod/
cp -r admin/public /tmp/shop-admin-prod/
cp admin/package*.json /tmp/shop-admin-prod/
cp admin/next.config.* /tmp/shop-admin-prod/ 2>/dev/null || true

# Create compressed archive for faster upload (exclude macOS metadata files)
echo "Creating compressed archive..."
cd /tmp
# Clean up any macOS metadata files before archiving
find shop-admin-prod -name '._*' -delete 2>/dev/null || true
find shop-admin-prod -name '.DS_Store' -delete 2>/dev/null || true
tar czf shop-admin-prod.tar.gz shop-admin-prod/
ADMIN_SIZE=$(du -h shop-admin-prod.tar.gz | cut -f1)
echo "Archive size: $ADMIN_SIZE"

# Step 3: Upload to VPS
echo ""
echo "================================"
echo "📤 Uploading to VPS..."
echo "================================"

echo "Removing old admin build..."
sshpass -p '8wANN666BG6xXa2@' ssh -o ConnectTimeout=30 root@31.97.232.219 "rm -rf /var/www/ShopProject/admin"

echo "Uploading compressed admin package (this may take a few minutes)..."
sshpass -p '8wANN666BG6xXa2@' scp -o ConnectTimeout=30 -C /tmp/shop-admin-prod.tar.gz root@31.97.232.219:/tmp/

echo "Extracting on server..."
sshpass -p '8wANN666BG6xXa2@' ssh -o ConnectTimeout=30 root@31.97.232.219 << 'EXTRACT'
cd /var/www/ShopProject
mkdir -p admin
cd /tmp
tar xzf shop-admin-prod.tar.gz
cp -r shop-admin-prod/.next /var/www/ShopProject/admin/
cp -r shop-admin-prod/public /var/www/ShopProject/admin/
cp shop-admin-prod/package*.json /var/www/ShopProject/admin/
cp shop-admin-prod/next.config.* /var/www/ShopProject/admin/ 2>/dev/null || true
rm -rf /tmp/shop-admin-prod /tmp/shop-admin-prod.tar.gz
EXTRACT

# Cleanup local archive
rm -f /tmp/shop-admin-prod.tar.gz
cd /Users/abdullahjaspal/Documents/Project/ShopProject

# Step 4: Deploy on VPS
echo ""
echo "================================"
echo "🚀 Starting Admin on VPS..."
echo "================================"

sshpass -p '8wANN666BG6xXa2@' ssh root@31.97.232.219 << 'ENDSSH'
set -e

cd /var/www/ShopProject/admin

# Create production .env
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api
EOF

# Install dependencies (including dev dependencies for TypeScript config)
echo "Installing dependencies..."
npm ci --silent

# Stop old admin
echo "Stopping old admin..."
pm2 delete shop-admin 2>/dev/null || echo "Admin not running"

# Start fresh
echo "Starting admin..."
pm2 start npm --name shop-admin -- start -- -p 3000
pm2 save

echo ""
echo "✅ Admin deployed!"
pm2 list | grep shop-admin

ENDSSH

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -rf /tmp/shop-admin-prod

# Clean local env file
rm -f /Users/abdullahjaspal/Documents/Project/ShopProject/admin/.env.production.local

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ ADMIN DEPLOYED WITH PRODUCTION CONFIG!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Visit: https://admin.buyshopo.com"
echo ""
echo "⚠️  IMPORTANT:"
echo "  1. Open in INCOGNITO/PRIVATE window"
echo "  2. Or clear all cookies for admin.buyshopo.com"
echo "  3. Hard refresh (Cmd+Shift+R)"
echo ""
echo "🎉 Your latest code with CORRECT API URL is now LIVE!"

