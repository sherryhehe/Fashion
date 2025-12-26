#!/bin/bash
# Unified Maintenance Script - Fix common VPS issues

set -e

VPS_HOST="31.97.232.219"
VPS_PASS="8wANN666BG6xXa2@"

echo "🔧 VPS Maintenance Tool"
echo "======================"
echo ""
echo "Select an option:"
echo "1. Fix Admin Panel (502 errors, crashes)"
echo "2. Fix VPS Stability (swap, memory limits)"
echo "3. Check Server Status"
echo "4. Restart Services"
echo "5. View Logs"
echo ""
read -p "Enter option (1-5): " option

case $option in
    1)
        echo ""
        echo "🔧 Fixing Admin Panel..."
        sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
        cd /var/www/ShopProject/admin
        
        # Stop crashing process
        pm2 delete shop-admin 2>/dev/null || true
        
        # Fix dependencies
        if [ ! -d "node_modules" ] || [ ! -f "./node_modules/.bin/next" ]; then
            echo "Installing dependencies..."
            rm -rf node_modules package-lock.json
            npm install --production --force --no-audit --no-fund
        fi
        
        # Start admin
        pm2 start npm --name shop-admin --cwd /var/www/ShopProject/admin -- start
        sleep 5
        pm2 list | grep shop-admin
        pm2 save
ENDSSH
        ;;
        
    2)
        echo ""
        echo "🔧 Fixing VPS Stability..."
        sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
        # Add swap if not exists
        if [ ! -f /swapfile ]; then
            echo "Creating 2GB swap..."
            fallocate -l 2G /swapfile
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            echo 'vm.swappiness=10' >> /etc/sysctl.conf
            echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
            sysctl -p
        fi
        
        # Set PM2 memory limits
        pm2 set pm2:max_memory_restart 500M
        pm2 save
        
        echo "✅ VPS stability fixes applied"
        swapon --show
ENDSSH
        ;;
        
    3)
        echo ""
        echo "📊 Server Status..."
        sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST << 'ENDSSH'
        echo "=== Uptime ==="
        uptime
        echo ""
        echo "=== Memory ==="
        free -h
        echo ""
        echo "=== Swap ==="
        swapon --show
        echo ""
        echo "=== PM2 Status ==="
        pm2 list
        echo ""
        echo "=== Disk Usage ==="
        df -h /
ENDSSH
        ;;
        
    4)
        echo ""
        echo "🔄 Restarting Services..."
        sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=15 root@$VPS_HOST << 'ENDSSH'
        pm2 restart all
        sleep 3
        pm2 list
        pm2 save
ENDSSH
        ;;
        
    5)
        echo ""
        echo "📋 Viewing Logs..."
        echo "Select service:"
        echo "1. shop-admin"
        echo "2. shop-backend"
        echo "3. Both"
        read -p "Enter option: " log_option
        
        case $log_option in
            1) service="shop-admin" ;;
            2) service="shop-backend" ;;
            3) service="all" ;;
            *) service="shop-admin" ;;
        esac
        
        sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=10 root@$VPS_HOST "pm2 logs $service --lines 50"
        ;;
        
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"

