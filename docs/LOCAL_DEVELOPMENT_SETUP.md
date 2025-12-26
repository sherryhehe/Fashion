# Local Development Setup

## Overview

This setup allows you to:
- ✅ Run backend locally on `http://localhost:8000`
- ✅ Run admin panel locally on `http://localhost:3000`
- ✅ Use **production MongoDB database** (same data as live)
- ✅ All API calls go to local endpoints (`localhost:8000`)

## Configuration Files

### Backend (`backend/local.env`)

**Database:** Production MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://shopo_admin:***@cluster0.zikm9az.mongodb.net/larkon_fashion?retryWrites=true&w=majority&appName=Cluster0
```

**API Endpoint:** `http://localhost:8000`
- Backend runs locally
- Uses production database
- Uploads go to `backend/uploads/` (local directory)

### Admin Panel (`admin/.env.local`)

**API URL:** Local backend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Result:**
- Admin panel calls `http://localhost:8000/api/*`
- All requests go to your local backend
- Backend connects to production MongoDB

## How It Works

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Admin Panel    │────────▶│  Local Backend  │────────▶│ Production DB   │
│ localhost:3000   │         │ localhost:8000   │         │ MongoDB Atlas   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
     │                              │
     │                              │
     └──▶ API Calls:                 └──▶ Database: Production
          http://localhost:8000/api      mongodb+srv://...
```

## Starting Development

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
📊 Database: larkon_fashion
🚀 Server running on http://localhost:8000
```

### 2. Start Admin Panel (Terminal 2)
```bash
cd admin
npm run dev
```

**Expected output:**
```
✓ Ready on http://localhost:3000
```

## Important Notes

### ⚠️ Database Safety

**You're using the PRODUCTION database!**

- ✅ **Safe operations:** Read, view, test
- ⚠️ **Be careful:** Creating, updating, deleting data
- ❌ **Never:** Run destructive scripts or migrations

### 📁 File Uploads

- Uploads go to `backend/uploads/` (local directory)
- These are **NOT** synced to production
- Production uploads are in `/var/www/ShopProject/backend/uploads/` on VPS

### 🔄 Switching Between Local and Production

**Use Local MongoDB:**
```bash
# Edit backend/local.env
# Uncomment: MONGODB_URI=mongodb://127.0.0.1:27017/larkon_fashion
# Comment: MONGODB_URI=mongodb+srv://...
```

**Use Production API:**
```bash
# Edit admin/.env.local
# Change to: NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api
```

## Troubleshooting

### Backend can't connect to MongoDB

**Error:** `querySrv ENOTFOUND _mongodb._tcp.cluster0.zikm9az.mongodb.net`

**Solution:**
1. Check if MongoDB Atlas cluster is running (not paused)
2. Go to https://cloud.mongodb.com
3. Resume cluster if paused
4. Wait 2-3 minutes for cluster to start

### Admin panel can't reach backend

**Error:** `Failed to fetch` or `Network error`

**Solution:**
1. Make sure backend is running: `curl http://localhost:8000/api/health`
2. Check `admin/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
3. Restart admin panel: `npm run dev`

### Upload endpoint not working

**Error:** `Upload failed` or `401 Unauthorized`

**Solution:**
1. Make sure you're logged in to admin panel
2. Check backend is running: `pm2 list` or `npm run dev`
3. Check backend logs for errors
4. Verify token is valid (logout and login again)

## Current Configuration Summary

| Component | Location | Endpoint/Database |
|-----------|----------|-------------------|
| **Admin Panel** | `localhost:3000` | API: `http://localhost:8000/api` |
| **Backend API** | `localhost:8000` | Database: Production MongoDB Atlas |
| **Database** | MongoDB Atlas | `cluster0.zikm9az.mongodb.net/larkon_fashion` |
| **Uploads** | `backend/uploads/` | Local directory (not synced) |

## Quick Commands

```bash
# Check backend health
curl http://localhost:8000/api/health

# Check MongoDB connection
cd backend && npm run dev
# Look for: "✅ MongoDB connected successfully"

# Check admin API config
cd admin && cat .env.local | grep API_URL

# View backend logs
cd backend && npm run dev
# Or if using PM2: pm2 logs shop-backend
```

