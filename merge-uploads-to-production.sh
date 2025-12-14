#!/bin/bash
# Merge local uploads with production uploads (preserve existing files)
# This script adds missing files without deleting existing ones

set -e

VPS_HOST="31.97.232.219"
VPS_USER="root"
VPS_PASSWORD="8wANN666BG6xXa2@"
VPS_PATH="/var/www/ShopProject/backend/uploads"
LOCAL_PATH="backend/uploads"

echo "📤 Merging uploads folder to production (preserving existing files)..."
echo "Password: $VPS_PASSWORD"
echo ""

# Check if local uploads folder exists
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Local uploads folder not found: $LOCAL_PATH"
    exit 1
fi

# Count local files
LOCAL_COUNT=$(find "$LOCAL_PATH" -type f | wc -l | tr -d ' ')
echo "📦 Found $LOCAL_COUNT files in local uploads folder"

# Create archive of local uploads
echo "📦 Creating archive of local uploads..."
cd "$(dirname "$0")"
TEMP_DIR=$(mktemp -d)
cd backend/uploads
tar czf "$TEMP_DIR/uploads-to-merge.tar.gz" . 2>/dev/null || {
    echo "⚠️ Failed to create archive"
    cd ../..
    rm -rf "$TEMP_DIR"
    exit 1
}
cd ../..

echo "✅ Archive created"
echo ""

# Upload to server
echo "📤 Uploading to production server..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$TEMP_DIR/uploads-to-merge.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/uploads-to-merge.tar.gz"

echo "✅ Upload complete"
echo ""

# Extract on server (merge without deleting existing files)
echo "📦 Merging uploads on production server..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << 'ENDSSH'
set -e

echo "📂 Navigating to uploads directory..."
cd /var/www/ShopProject/backend

# Ensure uploads directory exists
mkdir -p uploads

# Count existing files
BEFORE_COUNT=$(find uploads -type f | wc -l | tr -d ' ')
echo "📊 Existing files before merge: $BEFORE_COUNT"

# Extract new files (this will only add files, existing files remain)
echo "📦 Extracting new files (merge mode)..."
cd uploads
tar xzf /tmp/uploads-to-merge.tar.gz --skip-old-files 2>/dev/null || tar xzf /tmp/uploads-to-merge.tar.gz
rm /tmp/uploads-to-merge.tar.gz

# Count files after merge
AFTER_COUNT=$(find . -type f | wc -l | tr -d ' ')
ADDED=$((AFTER_COUNT - BEFORE_COUNT))

echo "✅ Merge complete!"
echo "📊 Files after merge: $AFTER_COUNT"
echo "📊 Files added: $ADDED"
echo ""
echo "📋 Sample of files in uploads folder:"
ls -lh | head -n 10

ENDSSH

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✨ Uploads merged successfully!"
echo "🌐 Images should now be accessible at: https://api.buyshopo.com/uploads/"
echo ""
echo "💡 Note: This script preserves existing files. If you need to completely replace, use sync-uploads-to-production.sh instead."

