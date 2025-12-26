# Deployment & Maintenance Scripts

## 📋 Essential Scripts (Root Directory)

### Deployment
- **`deploy-admin-production.sh`** - Deploy admin panel to production
- **`deploy-backend-direct.sh`** - Deploy backend to production  
- **`deploy-all.sh`** - Deploy both admin and backend

### Utilities
- **`check-status.sh`** - Check server and service status
- **`ssh-connect.sh`** - Quick SSH connection to VPS

## 🔧 Maintenance Script

- **`scripts/maintenance.sh`** - Unified maintenance tool for:
  - Fixing admin panel issues (502 errors, crashes)
  - Fixing VPS stability (swap, memory limits)
  - Checking server status
  - Restarting services
  - Viewing logs

**Usage:**
```bash
./scripts/maintenance.sh
```

## 📦 Archived Scripts

Old and one-time-use scripts are archived in `scripts/archive/`:
- Fix scripts (merged into maintenance.sh)
- Old deployment methods
- One-time utilities

## 🚀 Quick Reference

**Deploy Admin:**
```bash
./deploy-admin-production.sh
```

**Deploy Backend:**
```bash
./deploy-backend-direct.sh
```

**Deploy Both:**
```bash
./deploy-all.sh
```

**Check Status:**
```bash
./check-status.sh
```

**Maintenance:**
```bash
./scripts/maintenance.sh
```

