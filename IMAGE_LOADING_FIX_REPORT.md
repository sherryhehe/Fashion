# Image Loading Issue - Root Cause & Fix Report

**Date:** December 1, 2024  
**Issue:** Images not loading on mobile app from production backend  
**Status:** Root cause identified and deployment script fixed

---

## 🔍 Root Cause Analysis

### Problem Identified
The deployment script (`deploy-backend-direct.sh`) was **clearing the uploads folder** during deployment:

```bash
# OLD CODE (PROBLEMATIC):
rm -rf uploads/*  # ❌ This clears all uploads!
cp -r /tmp/backend-uploads-backup/* uploads/  # ❌ Restores from old backup
```

### What Happened
1. **Before deployment:** Images were working fine on production
2. **During deployment:**
   - Script backed up uploads to `/tmp/backend-uploads-backup`
   - Script cleared the entire uploads folder: `rm -rf uploads/*`
   - Script restored from backup (which was older)
3. **After deployment:**
   - Newer images (uploaded after the backup) were lost
   - Database still references these missing images
   - Result: 404 errors when trying to load images

### Evidence
- Database references: `images-1764199383242-675628107.jpeg` (created Nov 30)
- Server has files from: Nov 3 (older files)
- Backup contains: Only 2 old files
- Missing images: All newer product images uploaded after the backup

---

## ✅ Fix Applied

### 1. Fixed Deployment Script
**File:** `deploy-backend-direct.sh`

**Changed from:**
```bash
if [ -d /tmp/backend-uploads-backup ]; then
    rm -rf uploads/*  # ❌ Clears all files
    cp -r /tmp/backend-uploads-backup/* uploads/
fi
```

**Changed to:**
```bash
# IMPORTANT: Preserve uploads folder - do NOT clear it during deployment
if [ ! -d uploads ]; then
    mkdir -p uploads
fi
# Only restore from backup if uploads folder is empty
if [ -d /tmp/backend-uploads-backup ] && [ -z "$(ls -A uploads 2>/dev/null)" ]; then
    echo "📁 Restoring uploads from backup (uploads folder was empty)..."
    cp -r /tmp/backend-uploads-backup/* uploads/ 2>/dev/null || true
else
    echo "📁 Preserving existing uploads folder (not restoring from backup)"
fi
```

**Key changes:**
- ✅ No longer clears uploads folder
- ✅ Preserves existing files during deployment
- ✅ Only restores from backup if folder is empty (new deployment)

### 2. Created Merge Script
**File:** `merge-uploads-to-production.sh`

This script allows safely merging local uploads with production uploads without deleting existing files.

---

## 📊 Current Status

### Production Server
- Total files: 1,876 files (803 MB)
- Has older images: ✅ Yes (from Nov 3)
- Missing newer images: ❌ Yes (from Nov 30)

### Local Machine
- Total files: 44 files (18 MB)
- Has missing images: ❌ No

### Database
- References missing images: ✅ Yes
- Image paths format: `/uploads/images-{timestamp}-{random}.jpeg`

---

## 🚀 Next Steps

### Immediate Action Required
**Option 1: Re-upload Missing Images (Recommended)**
1. Open admin panel: `https://admin.buyshopo.com`
2. Navigate to products with missing images
3. Re-upload the images for each product
4. Images will be automatically saved to the uploads folder

**Option 2: Check for Backup**
- Check if there's a backup of the uploads folder from before deployment
- If found, merge those files back to production

**Option 3: Export from Database**
- If images are stored as base64 in database (unlikely), export them
- Or regenerate images from product data if possible

### Prevention
✅ **Already Fixed:** Deployment script now preserves uploads folder

### Future Deployments
- Uploads folder will now persist across deployments
- No risk of losing images during future deployments
- Backup is only used if uploads folder is empty (new server)

---

## 📝 Technical Details

### Image Storage
- **Location:** `/var/www/ShopProject/backend/uploads/`
- **Served via:** Express static middleware (`/uploads` route)
- **Full URL:** `https://api.buyshopo.com/uploads/filename.jpeg`

### Image Path Format
- Database stores: `/uploads/images-{timestamp}-{random}.jpeg`
- Actual file: `backend/uploads/images-{timestamp}-{random}.jpeg`

### Static File Serving
```typescript
// backend/src/app-mongodb.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

---

## ✅ Verification Steps

After re-uploading images:

1. **Check API Response:**
   ```bash
   curl 'https://api.buyshopo.com/api/products?limit=1' | jq '.data[0].images[0]'
   ```

2. **Check File Exists:**
   ```bash
   ssh root@31.97.232.219 "ls -la /var/www/ShopProject/backend/uploads/ | grep 'image-name'"
   ```

3. **Test Image URL:**
   ```bash
   curl -I "https://api.buyshopo.com/uploads/images-1764199383242-675628107.jpeg"
   ```
   Should return: `200 OK` (not `404 Not Found`)

4. **Test on Mobile:**
   - Open mobile app
   - Navigate to products
   - Verify images load correctly

---

## 🔧 Files Modified

1. ✅ `deploy-backend-direct.sh` - Fixed to preserve uploads
2. ✅ `merge-uploads-to-production.sh` - Created merge script (optional)

---

## 💡 Key Learnings

1. **Never clear uploads folder during deployment**
   - Uploads are user-generated content
   - Should persist across deployments

2. **Backup strategy:**
   - Always backup before deployment
   - But preserve existing files, don't replace

3. **Deployment best practices:**
   - Preserve data directories
   - Only restore from backup if folder is empty
   - Log what's happening during deployment

---

**Report Generated:** December 1, 2024  
**Next Action:** Re-upload missing images through admin panel

