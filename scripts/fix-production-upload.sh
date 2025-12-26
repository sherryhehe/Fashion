#!/bin/bash

# Fix Production Upload Endpoint
# This script checks and fixes the production backend server

set -e

VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASSWORD="8wANN666BG6xXa2@"

echo "🔍 Checking production server status..."

# Check if backend is running
echo ""
echo "📊 PM2 Status:"
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "pm2 list" || {
    echo "❌ Failed to connect to server or PM2 not running"
    exit 1
}

echo ""
echo "📋 Backend Logs (last 30 lines):"
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "pm2 logs shop-backend --lines 30 --nostream" || echo "⚠️  Could not fetch logs"

echo ""
echo "🏥 Health Check (local):"
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "curl -s http://localhost:8000/api/health | head -5" || echo "❌ Backend not responding locally"

echo ""
echo "🔄 Restarting backend service..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /var/www/ShopProject/backend

# Check if process exists
if pm2 list | grep -q "shop-backend"; then
    echo "✅ Restarting existing shop-backend process..."
    pm2 restart shop-backend
else
    echo "⚠️  shop-backend not found, starting new process..."
    pm2 start dist/index-mongodb.js --name shop-backend --cwd /var/www/ShopProject/backend
fi

# Save PM2 configuration
pm2 save

# Wait a moment for restart
sleep 3

# Check status
echo ""
echo "📊 Updated PM2 Status:"
pm2 list | grep shop-backend

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint:"
curl -s http://localhost:8000/api/health | head -10 || echo "❌ Health check failed"
ENDSSH

echo ""
echo "✅ Production backend restart completed!"
echo ""
echo "🌐 Test the upload endpoint:"
echo "   curl -X POST https://api.buyshopo.com/api/upload/images"
echo ""
echo "📝 Check logs if issues persist:"
echo "   ssh root@$VPS_HOST 'pm2 logs shop-backend --lines 50'"

