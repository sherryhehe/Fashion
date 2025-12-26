# Image Upload Troubleshooting Guide

## Issue: Production Upload Endpoint Not Responding

**Endpoint:** `https://api.buyshopo.com/api/upload/images`  
**Status:** Connection timeout / Server not responding

## Possible Causes

### 1. Production Backend Server is Down
- **Symptom:** Connection timeout, 502 Bad Gateway, or "Failed to fetch"
- **Check:** SSH to VPS and verify PM2 processes
- **Solution:** Restart backend service

### 2. PM2 Process Crashed
- **Symptom:** Backend was running but stopped unexpectedly
- **Check:** `pm2 list` and `pm2 logs shop-backend`
- **Solution:** Restart with `pm2 restart shop-backend`

### 3. Server Out of Memory
- **Symptom:** Process killed, OOM errors in logs
- **Check:** `free -h` and `pm2 logs shop-backend`
- **Solution:** Add swap space or increase server resources

### 4. Network/Firewall Issue
- **Symptom:** Cannot reach server from browser
- **Check:** `curl https://api.buyshopo.com/api/health`
- **Solution:** Check Nginx configuration and firewall rules

## Quick Diagnostic Steps

### Step 1: Check Server Status
```bash
# SSH to production server
ssh root@31.97.232.219

# Check PM2 processes
pm2 list

# Check backend logs
pm2 logs shop-backend --lines 50

# Check if backend is responding
curl http://localhost:8000/api/health
```

### Step 2: Check Nginx
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx configuration
nginx -t
```

### Step 3: Restart Services
```bash
# Restart backend
cd /var/www/ShopProject/backend
pm2 restart shop-backend

# Or if process doesn't exist, start it
pm2 start dist/index-mongodb.js --name shop-backend --cwd /var/www/ShopProject/backend

# Restart Nginx
systemctl restart nginx
```

## Upload Endpoint Details

**Route:** `/api/upload/images`  
**Method:** POST  
**Authentication:** Required (Bearer token)  
**Authorization:** Admin only  
**Field Name:** `images` (can be single or multiple files)  
**Max File Size:** 20MB per file  
**Max Files:** 10 files per request  
**Allowed Types:** JPEG, JPG, PNG, GIF, WebP

## Expected Response

**Success:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "/uploads/images-1234567890-123456789.jpg",
      "/uploads/images-1234567890-123456790.jpg"
    ]
  },
  "message": "Files uploaded successfully"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Error (403 Forbidden):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "File too large. Maximum file size is 20MB."
}
```

## Client-Side Error Handling

The admin panel's `uploadHelper.ts` handles these errors:
- **401:** "Authentication failed. Please login again."
- **403:** "Permission denied. Admin access required."
- **413:** "File too large. Maximum file size is 20MB."
- **400:** Shows specific backend error message
- **Network errors:** "Network error: Cannot connect to server..."

## Common Upload Issues

### Issue: "Failed to fetch"
- **Cause:** Backend server not running or unreachable
- **Fix:** Check PM2 status and restart backend

### Issue: "Authentication failed"
- **Cause:** Token expired or invalid
- **Fix:** Logout and login again

### Issue: "File too large"
- **Cause:** File exceeds 20MB limit
- **Fix:** Compress image or use smaller file

### Issue: "Invalid file type"
- **Cause:** File is not JPEG, PNG, GIF, or WebP
- **Fix:** Convert image to supported format

### Issue: "Upload timeout"
- **Cause:** Large file upload taking too long (>30 seconds)
- **Fix:** Compress image or check network connection

## Production Server Info

**VPS IP:** `31.97.232.219`  
**Backend Port:** `8000` (internal)  
**Public URL:** `https://api.buyshopo.com`  
**PM2 Process:** `shop-backend`  
**Backend Directory:** `/var/www/ShopProject/backend`  
**Upload Directory:** `/var/www/ShopProject/backend/uploads`

## Next Steps

1. **Check production server status** (SSH and run `pm2 list`)
2. **Review backend logs** (`pm2 logs shop-backend`)
3. **Restart backend if needed** (`pm2 restart shop-backend`)
4. **Verify Nginx is proxying correctly** (`curl https://api.buyshopo.com/api/health`)
5. **Test upload endpoint** (Use browser DevTools Network tab)

