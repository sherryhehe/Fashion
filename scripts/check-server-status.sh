#!/bin/bash

# Check production server connectivity

VPS_HOST="31.97.232.219"
VPS_USER="root"

echo "🔍 Checking Production Server Status"
echo "===================================="
echo ""

# Check 1: Ping
echo "1️⃣  Checking server reachability (ping)..."
if ping -c 3 -W 2 $VPS_HOST > /dev/null 2>&1; then
  echo "   ✅ Server is reachable"
else
  echo "   ❌ Server is not reachable (may be down or firewall blocking)"
fi
echo ""

# Check 2: SSH Port
echo "2️⃣  Checking SSH port (22)..."
if nc -zv -w 5 $VPS_HOST 22 > /dev/null 2>&1; then
  echo "   ✅ SSH port is open"
else
  echo "   ❌ SSH port is closed or filtered"
  echo "   💡 Server may be down, firewall blocking, or SSH service stopped"
fi
echo ""

# Check 3: HTTP/HTTPS
echo "3️⃣  Checking HTTP/HTTPS ports..."
if nc -zv -w 5 $VPS_HOST 80 > /dev/null 2>&1; then
  echo "   ✅ HTTP port (80) is open"
else
  echo "   ⚠️  HTTP port (80) is closed"
fi

if nc -zv -w 5 $VPS_HOST 443 > /dev/null 2>&1; then
  echo "   ✅ HTTPS port (443) is open"
else
  echo "   ⚠️  HTTPS port (443) is closed"
fi
echo ""

# Check 4: Test SSH connection
echo "4️⃣  Testing SSH connection..."
if timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'SSH connection successful'" 2>/dev/null; then
  echo "   ✅ SSH connection works"
else
  echo "   ❌ SSH connection failed"
  echo "   💡 Possible causes:"
  echo "      - Server is down or restarting"
  echo "      - Firewall is blocking SSH"
  echo "      - SSH service is stopped"
  echo "      - Network connectivity issues"
fi
echo ""

# Check 5: Check if services are running (if SSH works)
echo "5️⃣  Checking services (if SSH accessible)..."
if timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "pm2 list" 2>/dev/null; then
  echo "   ✅ Can check PM2 services"
else
  echo "   ⚠️  Cannot check PM2 (SSH not accessible)"
fi
echo ""

echo "===================================="
echo "📋 Summary:"
echo ""
echo "If SSH is not accessible:"
echo "  1. Check if server is running in your hosting panel"
echo "  2. Restart the server if needed"
echo "  3. Check firewall settings"
echo "  4. Wait a few minutes and try again"
echo ""
echo "If server is down:"
echo "  - Contact your hosting provider"
echo "  - Check server status in hosting panel"
echo "  - Wait for server to come back online"
echo ""

