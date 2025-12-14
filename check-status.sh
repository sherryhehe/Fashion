#!/bin/bash
# Check Production Server Status

echo "🔍 Checking Production Server Status..."

ssh root@31.97.232.219 << 'ENDSSH'

echo "================================"
echo "📊 PM2 Processes"
echo "================================"
pm2 list

echo ""
echo "================================"
echo "💾 Disk Usage"
echo "================================"
df -h | grep -E '(Filesystem|/dev/)'

echo ""
echo "================================"
echo "🧠 Memory Usage"
echo "================================"
free -h

echo ""
echo "================================"
echo "🩺 Backend Health"
echo "================================"
curl -s http://localhost:8000/api/health | head -n 20

echo ""
echo "================================"
echo "📝 Recent Backend Logs (last 20 lines)"
echo "================================"
pm2 logs shop-backend --lines 20 --nostream

echo ""
echo "================================"
echo "📝 Recent Admin Logs (last 20 lines)"
echo "================================"
pm2 logs shop-admin --lines 20 --nostream

ENDSSH

echo ""
echo "✅ Status check complete!"

