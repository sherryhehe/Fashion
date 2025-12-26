# MongoDB Database Switching Guide

## Quick Switch Script

Use the provided script to easily switch between local and production databases:

```bash
cd backend
./switch-db.sh
```

This will prompt you to choose:
1. Local MongoDB (127.0.0.1:27017)
2. Production MongoDB Atlas

## Manual Switching

### Switch to Local MongoDB

Edit `backend/local.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/larkon_fashion
# MONGODB_URI=mongodb+srv://... (comment out production)
```

### Switch to Production MongoDB Atlas

Edit `backend/local.env`:
```env
# MONGODB_URI=mongodb://127.0.0.1:27017/larkon_fashion (comment out local)
MONGODB_URI=mongodb+srv://shopo_admin:***@cluster0.zikm9az.mongodb.net/larkon_fashion?retryWrites=true&w=majority&appName=Cluster0
```

## Current Status

**Active:** Local MongoDB (127.0.0.1:27017)

**Reason:** MongoDB Atlas cluster is paused or unreachable.

## MongoDB Atlas Issues

### Error: `querySrv ENOTFOUND _mongodb._tcp.cluster0.zikm9az.mongodb.net`

**Cause:** MongoDB Atlas cluster is paused or unreachable.

**Solutions:**

1. **Resume MongoDB Atlas Cluster:**
   - Go to https://cloud.mongodb.com
   - Log in to your account
   - Navigate to your cluster
   - Click "Resume" if it's paused
   - Wait 2-3 minutes for cluster to start
   - Then switch back to production DB

2. **Check Network Connection:**
   - Verify your internet connection
   - Check if MongoDB Atlas dashboard is accessible
   - Verify your IP is whitelisted in MongoDB Atlas

3. **Use Local MongoDB (Temporary):**
   - Use local MongoDB while Atlas is unavailable
   - Switch back to Atlas when it's running

## Local MongoDB Setup

**Check if running:**
```bash
brew services list | grep mongodb
```

**Start MongoDB:**
```bash
brew services start mongodb-community
```

**Stop MongoDB:**
```bash
brew services stop mongodb-community
```

## After Switching

**Always restart your backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: larkon_fashion
```

## Important Notes

### ⚠️ Database Differences

- **Local MongoDB:** Empty database (separate from production)
- **Production MongoDB Atlas:** Live production data

### 🔄 Switching Back to Production

When MongoDB Atlas is available again:

1. Resume the cluster in MongoDB Atlas dashboard
2. Run: `cd backend && ./switch-db.sh` (choose option 2)
3. Or manually edit `local.env` to use production URI
4. Restart backend: `npm run dev`

### 📊 Data Sync

**Note:** Local and production databases are separate. Data created locally will NOT appear in production, and vice versa.

If you need production data locally:
- Export from production MongoDB Atlas
- Import to local MongoDB
- Or use production DB directly (when available)

