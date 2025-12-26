#!/bin/bash
# Sync uploads folder from local to production server

set -e

VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASSWORD="8wANN666BG6xXa2@"
VPS_PATH="/var/www/ShopProject/backend/uploads"
LOCAL_PATH="backend/uploads"

echo "📤 Syncing uploads folder to production..."
echo "Password: $VPS_PASSWORD"
echo ""

# Check if local uploads folder exists
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Local uploads folder not found: $LOCAL_PATH"
    exit 1
fi

echo "📦 Creating archive of local uploads..."
cd "$(dirname "$0")"

# Create a temporary archive
TEMP_DIR=$(mktemp -d)
cd backend/uploads
tar czf "$TEMP_DIR/uploads.tar.gz" *.jpeg *.jpg *.png *.webp *.gif 2>/dev/null || tar czf "$TEMP_DIR/uploads.tar.gz" . 2>/dev/null || {
    echo "⚠️ No image files found in local uploads folder"
    cd ../..
    rm -rf "$TEMP_DIR"
    exit 1
}

cd ../..

echo "✅ Archive created"
echo ""

# Upload to server
echo "📤 Uploading to production server..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$TEMP_DIR/uploads.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/uploads.tar.gz"

echo "✅ Upload complete"
echo ""

# Extract on server
echo "📦 Extracting on production server..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << 'ENDSSH'
set -e

echo "📂 Navigating to uploads directory..."
cd /var/www/ShopProject/backend

# Backup existing uploads
if [ -d uploads ]; then
    echo "💾 Backing up existing uploads..."
    mv uploads "uploads.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create uploads directory
mkdir -p uploads

# Extract new files
echo "📦 Extracting uploads..."
cd uploads
tar xzf /tmp/uploads.tar.gz
rm /tmp/uploads.tar.gz

echo "✅ Uploads extracted successfully"
echo "📊 Files in uploads folder:"
ls -lh | head -n 10

ENDSSH

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✨ Uploads synced to production successfully!"
echo "🌐 Images should now be accessible at: https://api.buyshopo.com/uploads/"

