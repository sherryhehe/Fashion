#!/bin/bash
# Deploy Backend from LOCAL code (builds and uploads local files)

set -e

echo "🚀 Deploying Backend from LOCAL code..."
echo ""

# Step 1: Build backend locally
echo "================================"
echo "🏗️  Building Backend..."
echo "================================"

cd /Users/abdullahjaspal/Documents/Project/ShopProject/backend

echo "Installing dependencies..."
npm ci --silent

echo "Building TypeScript..."
npm run build

cd ..

# Step 2: Create deployment package
echo ""
echo "================================"
echo "📦 Packaging Backend..."
echo "================================"

mkdir -p /tmp/shop-backend-prod
rm -rf /tmp/shop-backend-prod/*

cp -r backend/dist /tmp/shop-backend-prod/
cp backend/package*.json /tmp/shop-backend-prod/

# Create compressed archive
echo "Creating compressed archive..."
cd /tmp
find shop-backend-prod -name '._*' -delete 2>/dev/null || true
find shop-backend-prod -name '.DS_Store' -delete 2>/dev/null || true
tar czf shop-backend-prod.tar.gz shop-backend-prod/
BACKEND_SIZE=$(du -h shop-backend-prod.tar.gz | cut -f1)
echo "Archive size: $BACKEND_SIZE"

# Step 3: Upload to VPS
echo ""
echo "================================"
echo "📤 Uploading to VPS..."
echo "================================"

echo "Uploading compressed backend package..."
sshpass -p '8wANN666BG6xXa2@' scp -o ConnectTimeout=30 -C /tmp/shop-backend-prod.tar.gz root@31.97.232.219:/tmp/

echo "Extracting on server..."
sshpass -p '8wANN666BG6xXa2@' ssh -o ConnectTimeout=30 root@31.97.232.219 << 'EXTRACT'
cd /var/www/ShopProject/backend

# Backup important files
if [ -f .env ]; then
    cp .env /tmp/backend-env-backup 2>/dev/null || true
fi
if [ -d uploads ]; then
    cp -r uploads /tmp/backend-uploads-backup 2>/dev/null || true
fi

# Extract new files
cd /tmp
tar xzf shop-backend-prod.tar.gz

# Copy files to backend directory
cp -r shop-backend-prod/dist/* /var/www/ShopProject/backend/dist/
cp shop-backend-prod/package*.json /var/www/ShopProject/backend/

# Restore backups
if [ -f /tmp/backend-env-backup ]; then
    cp /tmp/backend-env-backup /var/www/ShopProject/backend/.env 2>/dev/null || true
fi
if [ -d /tmp/backend-uploads-backup ]; then
    cp -r /tmp/backend-uploads-backup/* /var/www/ShopProject/backend/uploads/ 2>/dev/null || true
fi

rm -rf /tmp/shop-backend-prod /tmp/shop-backend-prod.tar.gz
EXTRACT

# Cleanup local archive
rm -f /tmp/shop-backend-prod.tar.gz
cd /Users/abdullahjaspal/Documents/Project/ShopProject

# Step 4: Deploy on VPS
echo ""
echo "================================"
echo "🚀 Starting Backend on VPS..."
echo "================================"

sshpass -p '8wANN666BG6xXa2@' ssh root@31.97.232.219 << 'ENDSSH'
set -e

cd /var/www/ShopProject/backend

# Create/update .env if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << 'EOF'
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/larkon
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://admin.buyshopo.com,https://buyshopo.com
UPLOAD_DIR=uploads
ADMIN_EMAIL=admin@larkon.com
ADMIN_PASSWORD=admin123
EOF
fi

# Install dependencies (production only)
echo "Installing dependencies..."
npm ci --production --silent

# Reload backend
echo "Reloading backend..."
pm2 reload shop-backend || pm2 start dist/index-mongodb.js --name shop-backend --cwd /var/www/ShopProject/backend
pm2 save

echo ""
echo "✅ Backend deployed!"
pm2 list | grep shop-backend

echo ""
echo "🩺 Health check:"
sleep 3
curl -s http://localhost:8000/api/health | head -n 5 || echo "Health check failed"

ENDSSH

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -rf /tmp/shop-backend-prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ BACKEND DEPLOYED FROM LOCAL CODE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 API: https://api.buyshopo.com"
echo ""
echo "🎉 Your latest backend code is now LIVE!"

