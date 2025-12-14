#!/bin/bash
# Backend Deployment Script for Production VPS

set -e  # Exit on error

echo "🚀 Starting Backend Deployment..."
echo "Password: 8wANN666BG6xXa2@"
echo ""

# SSH into VPS and deploy
sshpass -p '8wANN666BG6xXa2@' ssh root@31.97.232.219 << 'ENDSSH'
set -e

echo "📂 Navigating to project directory..."
cd /var/www/ShopProject/backend

echo "📥 Pulling latest backend code from production branch..."
if [ ! -d .git ]; then
    echo "⚠️  Backend is not a git repository. Cloning..."
    cd ..
    rm -rf backend
    git clone -b production https://github.com/AbdurRehmanJaspal/ShopoBackend.git backend
    cd backend
else
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
pm2 save

echo "✅ Backend deployment complete!"
echo "📊 PM2 Status:"
pm2 list

echo "🩺 Health check:"
sleep 3
curl -s http://localhost:8000/api/health | head -n 20

ENDSSH

echo "✨ Backend deployed successfully!"

