# Fix MongoDB Authentication for Local Development

## Problem
MongoDB is configured with authentication enabled, but your connection string doesn't include credentials.

## Solution: Disable Authentication for Local Development

### Step 1: Stop MongoDB
```bash
brew services stop mongodb-community
```

### Step 2: Edit MongoDB Configuration
```bash
# Open the config file
nano /opt/homebrew/etc/mongod.conf
# Or use your preferred editor
```

### Step 3: Comment Out Security Section
Find this section:
```yaml
security:
  authorization: enabled
```

Change it to:
```yaml
# security:
#   authorization: enabled
```

Or remove the `authorization: enabled` line entirely:
```yaml
security:
  # authorization: enabled  # Disabled for local development
```

### Step 4: Save and Restart MongoDB
```bash
# Save the file (Ctrl+X, then Y, then Enter in nano)
# Restart MongoDB
brew services start mongodb-community
```

### Step 5: Restart Your Backend
```bash
cd backend
npm run dev
```

## Alternative: Use MongoDB with Authentication

If you prefer to keep authentication enabled, you need to:

1. **Create a MongoDB user:**
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: [ { role: "root", db: "admin" } ]
})
```

2. **Update connection string in `backend/local.env`:**
```env
MONGODB_URI=mongodb://admin:admin123@127.0.0.1:27017/larkon?authSource=admin
```

## Recommended: Disable Auth for Local Development

For local testing, it's easier to disable authentication. You can always enable it later for production.

