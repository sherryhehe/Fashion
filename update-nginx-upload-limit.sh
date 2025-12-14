#!/bin/bash
# Script to update Nginx configuration for larger file uploads

echo "🔧 Updating Nginx configuration for file uploads..."
echo "Password: 8wANN666BG6xXa2@"
echo ""

sshpass -p '8wANN666BG6xXa2@' ssh -o StrictHostKeyChecking=no root@31.97.232.219 << 'ENDSSH'
set -e

echo "📝 Finding Nginx configuration files..."

# Find the API server configuration
NGINX_CONFIG=""
if [ -f /etc/nginx/sites-available/api.buyshopo.com ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/api.buyshopo.com"
elif [ -f /etc/nginx/conf.d/api.buyshopo.com.conf ]; then
    NGINX_CONFIG="/etc/nginx/conf.d/api.buyshopo.com.conf"
elif [ -f /etc/nginx/nginx.conf ]; then
    NGINX_CONFIG="/etc/nginx/nginx.conf"
else
    echo "⚠️  Could not find Nginx config. Listing available configs:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null || true
    ls -la /etc/nginx/conf.d/ 2>/dev/null || true
    exit 1
fi

echo "✅ Found config: $NGINX_CONFIG"
echo ""

# Backup the config
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "💾 Backup created: ${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

# Check if client_max_body_size already exists
if grep -q "client_max_body_size" "$NGINX_CONFIG"; then
    echo "📝 Updating existing client_max_body_size..."
    sed -i 's/client_max_body_size.*/client_max_body_size 20M;/' "$NGINX_CONFIG"
else
    echo "📝 Adding client_max_body_size to server block..."
    # Add it after the server_name line in the api.buyshopo.com block
    sed -i '/server_name api.buyshopo.com;/a\    client_max_body_size 20M;' "$NGINX_CONFIG"
fi

# Check if proxy timeouts exist, add if missing
if ! grep -q "proxy_read_timeout" "$NGINX_CONFIG"; then
    echo "📝 Adding proxy timeouts for large uploads..."
    sed -i '/proxy_cache_bypass/a\        proxy_read_timeout 300s;\n        proxy_connect_timeout 300s;\n        proxy_send_timeout 300s;' "$NGINX_CONFIG"
fi

echo ""
echo "📋 Updated configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -A 10 "server_name api.buyshopo.com" "$NGINX_CONFIG" | head -15
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid!"
    echo ""
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "❌ Nginx configuration test failed!"
    echo "Restoring backup..."
    cp "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
    exit 1
fi

echo ""
echo "✅ Nginx configuration updated successfully!"
echo "📊 Current Nginx status:"
systemctl status nginx --no-pager | head -10

ENDSSH

echo ""
echo "✅ Done! Nginx is now configured to accept uploads up to 20MB."

