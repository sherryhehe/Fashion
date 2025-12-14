# 🚀 Deployment Guide

Quick reference for deploying changes to production.

## 📋 Available Scripts

### Regular Deployment

**Deploy Backend Changes:**
```bash
./deploy-backend.sh
```
Use when you've made changes to the `backend/` directory.

**Deploy Admin Changes:**
```bash
./deploy-admin-production.sh
```
Use when you've made changes to the `admin/` directory.

**Deploy Both:**
```bash
./deploy-all.sh
```
Use when you've changed both backend and admin.

### Utilities

**SSH to VPS:**
```bash
./ssh-connect.sh
```
Quick access to your VPS terminal.

**Check Status:**
```bash
./check-status.sh
```
Check if backend and admin are running properly.

---

## 🔑 Credentials

**VPS SSH:**
- Host: `31.97.232.219`
- User: `root`
- Password: `8wANN666BG6xXa2@`

**Admin Login:**
- URL: https://admin.buyshopo.com
- Email: `admin@shopo.com`
- Password: `admin123`

**API URL:**
- Production: https://api.buyshopo.com/api

---

## 📝 Typical Workflow

1. Make changes locally
2. Test on your local server
3. Run deployment script:
   - Backend changes → `./deploy-backend.sh`
   - Admin changes → `./deploy-admin-production.sh`
   - Both → `./deploy-all.sh`
4. Enter VPS password when prompted: `8wANN666BG6xXa2@`
5. Check status: `./check-status.sh`
6. Verify on live URLs:
   - Admin: https://admin.buyshopo.com
   - API: https://api.buyshopo.com/api/health

---

## 🐛 Troubleshooting

**If deployment fails:**
1. Check status: `./check-status.sh`
2. SSH to VPS: `./ssh-connect.sh`
3. Check PM2 logs: `pm2 logs`
4. Restart services: `pm2 restart all`

**If changes don't appear:**
1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Check if correct build was uploaded
3. Check PM2 status on VPS

---

## 📂 VPS Directory Structure

```
/var/www/ShopProject/
├── backend/        # Backend API
│   ├── dist/       # Built files
│   ├── uploads/    # User uploads
│   └── .env        # Production env vars
└── admin/          # Admin panel
    └── .next/      # Built Next.js files
```

---

**Last Updated:** October 31, 2025

