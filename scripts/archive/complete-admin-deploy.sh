#!/bin/bash
# Complete admin deployment when server is back online

echo "🚀 Completing Admin Deployment..."
echo ""

VPS_HOST="31.97.232.219"
VPS_PASS="8wANN666BG6xXa2@"

# Check if build archive exists
if [ ! -f "/tmp/shop-admin-prod.tar.gz" ]; then
    echo "❌ Build archive not found! Please run deploy-admin-production.sh first."
    exit 1
fi

echo "✅ Build archive found: $(du -h /tmp/shop-admin-prod.tar.gz | cut -f1)"
echo ""

# Wait for server to be online
echo "Waiting for server to be online..."
for i in {1..10}; do
    if sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@$VPS_HOST "echo 'Server is online'" 2>/dev/null; then
        echo "✅ Server is online!"
        break
    else
        echo "Attempt $i/10: Server not responding, waiting 5 seconds..."
        sleep 5
    fi
done

# Check if server is online
if ! sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=5 root@$VPS_HOST "echo 'Connected'" 2>/dev/null; then
    echo "❌ Server is still not responding. Please check server status manually."
    echo "You can run this script again later when the server is back online."
    exit 1
fi

echo ""
echo "================================"
echo "📤 Uploading to VPS..."
echo "================================"

echo "Removing old admin build..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=30 root@$VPS_HOST "rm -rf /var/www/ShopProject/admin" 2>/dev/null || true

echo "Uploading compressed admin package..."
sshpass -p "$VPS_PASS" scp -o ConnectTimeout=30 -C /tmp/shop-admin-prod.tar.gz root@$VPS_HOST:/tmp/

echo "Extracting on server..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=30 root@$VPS_HOST << 'EXTRACT'
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

echo ""
echo "================================"
echo "🚀 Starting Admin on VPS..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=30 root@$VPS_HOST << 'ENDSSH'
set -e

cd /var/www/ShopProject/admin

# Create production .env
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api
EOF

# Install dependencies (Linux-compatible)
echo "Installing dependencies..."
rm -rf node_modules package-lock.json
npm install --production --force

# Stop old admin
echo "Stopping old admin..."
pm2 delete shop-admin 2>/dev/null || echo "Admin not running"

# Start admin
echo "Starting admin..."
pm2 start npm --name shop-admin --cwd /var/www/ShopProject/admin -- start

# Wait a moment
sleep 5

# Check status
pm2 list | grep shop-admin

# Save PM2 config
pm2 save

echo ""
echo "✅ Admin deployment complete!"
ENDSSH

# Cleanup local archive
echo ""
echo "Cleaning up local archive..."
rm -f /tmp/shop-admin-prod.tar.gz

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check status:"
echo "  https://admin.buyshopo.com"

