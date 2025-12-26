#!/bin/bash
# Fix 502 Bad Gateway - Complete Admin Panel Fix

echo "🔧 Fixing Admin Panel 502 Error..."
echo ""

VPS_HOST="31.97.232.219"
VPS_PASS="8wANN666BG6xXa2@"

# Step 1: Check server connectivity
echo "Checking server connectivity..."
if ! sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST "echo 'Connected'" 2>/dev/null; then
    echo "❌ Server is not responding. Please check server status."
    exit 1
fi

echo "✅ Server is online"
echo ""

# Step 2: Stop crashing admin process
echo "================================"
echo "1. Stopping crashed admin process..."
echo "================================"
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
pm2 delete shop-admin 2>/dev/null || true
pm2 save
ENDSSH

# Step 3: Install dependencies
echo ""
echo "================================"
echo "2. Installing dependencies (this may take 2-3 minutes)..."
echo "================================"
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=120 root@$VPS_HOST << 'ENDSSH'
cd /var/www/ShopProject/admin

# Remove problematic files
rm -rf node_modules package-lock.json

# Install dependencies for Linux
echo "Installing npm dependencies..."
npm install --production --force --no-audit --no-fund 2>&1 | tail -20

# Verify Next.js is installed
if [ -f "./node_modules/.bin/next" ]; then
    echo "✅ Next.js installed successfully"
else
    echo "❌ Next.js installation failed!"
    exit 1
fi
ENDSSH

# Step 4: Start admin panel
echo ""
echo "================================"
echo "3. Starting admin panel..."
echo "================================"
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
cd /var/www/ShopProject/admin

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api" > .env.production
fi

# Start with PM2
pm2 start npm --name shop-admin --cwd /var/www/ShopProject/admin -- start

# Wait a moment
sleep 5

# Check status
echo ""
echo "PM2 Status:"
pm2 list | grep shop-admin

# Check if it's running
if pm2 list | grep -q "shop-admin.*online"; then
    echo "✅ Admin panel started successfully"
else
    echo "❌ Admin panel failed to start. Checking logs..."
    pm2 logs shop-admin --lines 30 --nostream
    exit 1
fi

# Save PM2 config
pm2 save
ENDSSH

# Step 5: Verify it's working
echo ""
echo "================================"
echo "4. Verifying admin panel..."
echo "================================"
sleep 3

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
# Check local connection
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "✅ Admin panel is responding on port 3000"
else
    echo "⚠️  Admin panel may not be fully started yet"
    echo "Check logs: pm2 logs shop-admin"
fi

echo ""
echo "=== Final Status ==="
pm2 list
echo ""
echo "=== Memory Usage ==="
free -h
ENDSSH

echo ""
echo "✅ Fix complete!"
echo ""
echo "Admin panel should be accessible at: https://admin.buyshopo.com"
echo ""
echo "If you still see 502 error, wait 30 seconds and refresh the page."

