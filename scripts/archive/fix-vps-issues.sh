#!/bin/bash
# Fix VPS stability issues

echo "🔧 Fixing VPS Stability Issues..."
echo ""

# Connect to VPS
VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASS="8wANN666BG6xXa2@"

echo "================================"
echo "1. Fixing shop-admin crashes..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
cd /var/www/ShopProject/admin

# Stop the crashing process
echo "Stopping shop-admin..."
pm2 stop shop-admin 2>/dev/null || true
pm2 delete shop-admin 2>/dev/null || true

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found, installing dependencies..."
    npm install --production --force
else
    echo "Checking Next.js installation..."
    if [ ! -f "./node_modules/.bin/next" ]; then
        echo "Next.js not found, installing..."
        npm install next --save --force
    else
        echo "Next.js found in node_modules"
    fi
fi

# Verify Next.js is available
if [ -f "./node_modules/.bin/next" ]; then
    echo "✅ Next.js is installed"
else
    echo "❌ ERROR: Next.js installation failed!"
    echo "Attempting full reinstall..."
    rm -rf node_modules package-lock.json
    npm install --force
fi

# Start with proper command using full path to npm script
echo "Starting shop-admin..."
pm2 start npm --name shop-admin --cwd /var/www/ShopProject/admin -- start
sleep 3

# Check if it started successfully
if pm2 list | grep -q "shop-admin.*online"; then
    echo "✅ shop-admin started successfully"
else
    echo "❌ shop-admin failed to start, checking logs..."
    pm2 logs shop-admin --lines 20 --nostream
fi

pm2 save
ENDSSH

echo ""
echo "================================"
echo "2. Adding Swap Space..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
# Check if swap exists
if [ -f /swapfile ]; then
    echo "Swap file already exists"
    swapon --show
else
    echo "Creating 2GB swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make it permanent
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Optimize swap usage
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    sysctl -p
    
    echo "Swap created successfully!"
    swapon --show
fi
ENDSSH

echo ""
echo "================================"
echo "3. Setting up PM2 Auto-restart..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
# Configure PM2 to auto-restart on reboot
echo "Setting up PM2 startup..."
pm2 startup systemd -u root --hp /root 2>/dev/null || echo "Startup script already configured"

# Set max memory limits to prevent OOM kills
echo "Setting memory limits..."
pm2 set pm2:max_memory_restart 500M

# Configure PM2 to restart on crashes
pm2 set pm2:autodump true

# Save current processes
pm2 save

echo "✅ PM2 configured"
ENDSSH

echo ""
echo "================================"
echo "4. Checking Backend Status..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
cd /var/www/ShopProject/backend

# Check if backend is running properly
if pm2 list | grep -q "shop-backend.*online"; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend might have issues, checking..."
    pm2 restart shop-backend
    sleep 2
fi

pm2 save
ENDSSH

echo ""
echo "================================"
echo "5. Checking System Resources..."
echo "================================"

sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
echo "=== System Uptime ==="
uptime

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== Swap Status ==="
swapon --show

echo ""
echo "=== Disk Usage ==="
df -h /

echo ""
echo "=== PM2 Status ==="
pm2 list

echo ""
echo "=== Recent PM2 Logs (shop-admin) ==="
pm2 logs shop-admin --lines 10 --nostream 2>/dev/null || echo "No logs available"

echo ""
echo "=== Top Memory Consuming Processes ==="
ps aux --sort=-%mem | head -10
ENDSSH

echo ""
echo "✅ Fixes applied!"
echo ""
echo "📋 Next Steps:"
echo "1. Monitor PM2 logs: pm2 logs shop-admin"
echo "2. Check system resources regularly"
echo "3. Consider upgrading VPS if issues persist"
echo "4. Set up monitoring alerts"

