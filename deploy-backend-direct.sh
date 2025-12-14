#!/bin/bash
# Direct Backend Deployment Script (bypasses git, uploads files directly)

set -e  # Exit on error

VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASSWORD="8wANN666BG6xXa2@"
VPS_PATH="/var/www/ShopProject/backend"

echo "🚀 Starting Direct Backend Deployment (No Git)..."
echo "Password: $VPS_PASSWORD"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Step 1: Build backend locally
echo "📦 Building backend locally..."
cd "$BACKEND_DIR"
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Create a temporary archive
echo "📦 Creating deployment archive..."
TEMP_DIR=$(mktemp -d)
cd "$BACKEND_DIR"

# Copy necessary files
cp -r dist "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/" 2>/dev/null || true

# Create archive
cd "$TEMP_DIR"
tar czf backend-deploy.tar.gz dist package.json package-lock.json 2>/dev/null || tar czf backend-deploy.tar.gz dist package.json

echo "✅ Archive created!"
echo ""

# Step 3: Upload to server
echo "📤 Uploading files to server..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$TEMP_DIR/backend-deploy.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/backend-deploy.tar.gz"

echo "✅ Upload complete!"
echo ""

# Step 4: Deploy on server
echo "🚀 Deploying on server..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << ENDSSH
set -e

echo "📂 Navigating to project directory..."
cd $VPS_PATH

# Backup important files
echo "💾 Backing up important files..."
if [ -f .env ]; then
    cp .env /tmp/backend-env-backup
fi
if [ -d uploads ]; then
    cp -r uploads /tmp/backend-uploads-backup
fi

# Extract new files
echo "📦 Extracting new files..."
tar xzf /tmp/backend-deploy.tar.gz -C .
rm /tmp/backend-deploy.tar.gz

# Restore backups
if [ -f /tmp/backend-env-backup ]; then
    cp /tmp/backend-env-backup .env
fi
# IMPORTANT: Preserve uploads folder - do NOT clear it during deployment
# The uploads folder should persist across deployments
if [ ! -d uploads ]; then
    mkdir -p uploads
fi
# Only restore from backup if uploads folder is empty
if [ -d /tmp/backend-uploads-backup ] && [ -z "$(ls -A uploads 2>/dev/null)" ]; then
    echo "📁 Restoring uploads from backup (uploads folder was empty)..."
    cp -r /tmp/backend-uploads-backup/* uploads/ 2>/dev/null || true
else
    echo "📁 Preserving existing uploads folder (not restoring from backup)"
fi

# Install dependencies
echo "🔧 Installing dependencies..."
npm ci --production

# Ensure .env exists with production settings
if [ ! -f .env ]; then
    echo "📝 Creating production .env file..."
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

# Restart PM2 service
echo "🔄 Restarting backend service..."
pm2 reload shop-backend || pm2 start dist/index-mongodb.js --name shop-backend --cwd $VPS_PATH
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🩺 Health check:"
sleep 3
curl -s http://localhost:8000/api/health | head -n 20 || echo "Health check endpoint not available yet"

ENDSSH

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✨ Backend deployed successfully to production!"
echo "🌐 API URL: https://api.buyshopo.com"

