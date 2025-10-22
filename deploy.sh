#!/bin/bash

# Hostinger Deployment Script for Admin Panel
# This script helps deploy updates to your Hostinger server

echo "🚀 Starting Admin Panel Deployment to Hostinger..."

# Build the Next.js application
echo "📦 Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "📋 Deployment Instructions for Hostinger:"
echo "=========================================="
echo ""
echo "Option 1: Deploy via SSH (Recommended)"
echo "---------------------------------------"
echo "1. SSH into your Hostinger server:"
echo "   ssh u123456789@yourdomain.com"
echo ""
echo "2. Navigate to your admin directory:"
echo "   cd ~/domains/yourdomain.com/admin"
echo ""
echo "3. Pull the latest changes:"
echo "   git pull origin production"
echo ""
echo "4. Install dependencies (if needed):"
echo "   npm install --production"
echo ""
echo "5. Build the project:"
echo "   npm run build"
echo ""
echo "6. Restart the application:"
echo "   pm2 restart admin"
echo "   # OR if using node:"
echo "   # killall node && npm start &"
echo ""
echo "=========================================="
echo ""
echo "Option 2: Deploy Static Build (if using static export)"
echo "---------------------------------------"
echo "1. Upload the 'out/' folder to your server:"
echo "   - Via FTP/File Manager to: ~/public_html/admin/"
echo ""
echo "2. Your site will be immediately updated!"
echo ""
echo "=========================================="
echo ""
echo "✅ Local build complete! Ready to deploy."

