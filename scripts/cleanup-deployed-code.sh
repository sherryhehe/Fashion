#!/bin/bash
# Delete deployed frontend and backend code from VPS

set -e

VPS_HOST="31.97.232.219"
VPS_PASS="8wANN666BG6xXa2@"

echo "🗑️  Cleaning Up Deployed Code on VPS"
echo "====================================="
echo ""
echo "⚠️  WARNING: This will delete all deployed code!"
echo "   - Admin panel (/var/www/ShopProject/admin)"
echo "   - Backend API (/var/www/ShopProject/backend)"
echo "   - PM2 processes will be stopped and removed"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled. No changes made."
    exit 0
fi

echo ""
echo "Connecting to server..."

# Step 1: Stop and delete PM2 processes
echo ""
echo "1. Stopping PM2 processes..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
echo "✅ PM2 processes stopped and removed"
ENDSSH

# Step 2: Delete deployed code
echo ""
echo "2. Deleting deployed code..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
cd /var/www

# Delete admin and backend
if [ -d "ShopProject/admin" ]; then
    echo "Deleting admin panel..."
    rm -rf ShopProject/admin
    echo "✅ Admin panel deleted"
fi

if [ -d "ShopProject/backend" ]; then
    echo "Deleting backend..."
    rm -rf ShopProject/backend
    echo "✅ Backend deleted"
fi

# Check what's left
echo ""
echo "Remaining in ShopProject:"
ls -la ShopProject/ 2>/dev/null || echo "ShopProject directory is empty or removed"
ENDSSH

# Step 3: Clean up PM2 data
echo ""
echo "3. Cleaning PM2 data..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
# Remove PM2 dump file
rm -f /root/.pm2/dump.pm2 2>/dev/null || true
echo "✅ PM2 data cleaned"
ENDSSH

# Step 4: Verify
echo ""
echo "4. Verification..."
sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
echo "=== PM2 Status ==="
pm2 list
echo ""
echo "=== Deployed Directories ==="
if [ -d "/var/www/ShopProject" ]; then
    ls -la /var/www/ShopProject/
else
    echo "ShopProject directory does not exist"
fi
ENDSSH

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "All deployed code has been removed from the server."
echo "You can now deploy fresh code using:"
echo "  ./deploy-admin-production.sh"
echo "  ./deploy-backend-direct.sh"

