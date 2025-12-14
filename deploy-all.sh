#!/bin/bash
# Full Stack Deployment Script for Production VPS
# Deploys both backend and admin from separate git repositories

set -e  # Exit on error

echo "🚀 Starting Full Deployment (Backend + Admin)..."
echo "Password: 8wANN666BG6xXa2@"
echo ""

# SSH into VPS and deploy everything
sshpass -p '8wANN666BG6xXa2@' ssh root@31.97.232.219 << 'ENDSSH'
set -e

echo "📂 Navigating to project directory..."
cd /var/www/ShopProject

echo ""
echo "================================"
echo "🔹 DEPLOYING BACKEND"
echo "================================"

cd backend

# Setup git repo if needed
if [ ! -d .git ]; then
    echo "⚠️  Backend is not a git repository. Cloning..."
    cd ..
    rm -rf backend
    git clone -b production https://github.com/AbdurRehmanJaspal/ShopoBackend.git backend
    cd backend
    # Restore .env if it exists in backup
    if [ -f /tmp/backend-env-backup ]; then
        cp /tmp/backend-env-backup .env 2>/dev/null || true
    fi
else
    echo "📥 Pulling latest backend code from production branch..."
    git fetch --all
    # Backup important files
    if [ -f .env ]; then
        cp .env /tmp/backend-env-backup 2>/dev/null || true
    fi
    if [ -d uploads ]; then
        cp -r uploads /tmp/backend-uploads-backup 2>/dev/null || true
    fi
    # Clean and reset
    git clean -fd
    git reset --hard origin/production
    git checkout production
    # Restore backups
    if [ -f /tmp/backend-env-backup ]; then
        cp /tmp/backend-env-backup .env 2>/dev/null || true
    fi
    if [ -d /tmp/backend-uploads-backup ]; then
        rm -rf uploads/* 2>/dev/null || true
        cp -r /tmp/backend-uploads-backup/* uploads/ 2>/dev/null || true
    fi
fi

echo "🔧 Installing backend dependencies..."
npm ci

echo "🏗️  Building backend..."
npm run build

echo "📝 Setting up production environment..."
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

echo "🔄 Restarting backend service..."
pm2 reload shop-backend || pm2 start dist/index-mongodb.js --name shop-backend

echo ""
echo "================================"
echo "🔹 DEPLOYING ADMIN PANEL"
echo "================================"

cd ../admin

# Setup git repo if needed
if [ ! -d .git ]; then
    echo "⚠️  Admin is not a git repository. Cloning..."
    cd ..
    rm -rf admin
    git clone -b production https://github.com/AbdurRehmanJaspal/ShopAdmin.git admin
    cd admin
    # Restore .env.production if it exists in backup
    if [ -f /tmp/admin-env-backup ]; then
        cp /tmp/admin-env-backup .env.production 2>/dev/null || true
    fi
else
    echo "📥 Pulling latest admin code from production branch..."
    git fetch --all
    # Backup important files
    if [ -f .env.production ]; then
        cp .env.production /tmp/admin-env-backup 2>/dev/null || true
    fi
    # Clean and reset
    git clean -fd
    git reset --hard origin/production
    git checkout production
    # Restore backups
    if [ -f /tmp/admin-env-backup ]; then
        cp /tmp/admin-env-backup .env.production 2>/dev/null || true
    fi
fi

echo "📝 Setting up production environment..."
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api
EOF

echo "🔧 Installing admin dependencies..."
npm ci

echo "🏗️  Building admin panel..."
npm run build

echo "🔄 Restarting admin service..."
pm2 reload shop-admin || pm2 start npm --name shop-admin -- start -- -p 3000

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "================================"

pm2 save

echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🩺 Health Check:"
sleep 3
curl -s http://localhost:8000/api/health | head -n 5 || echo "Health check failed"

echo ""
echo "================================"
echo "🌐 Your Apps:"
echo "   API: https://api.buyshopo.com"
echo "   Admin: https://admin.buyshopo.com"
echo "================================"

ENDSSH

echo ""
echo "✨ Full deployment completed successfully!"
