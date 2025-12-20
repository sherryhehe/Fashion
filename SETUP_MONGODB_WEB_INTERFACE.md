# Setup MongoDB Web Interface (Browser Access)

## Option 1: MongoDB Compass (Recommended - Desktop App with Great UI)

### Install MongoDB Compass
1. Download: https://www.mongodb.com/try/download/compass
2. Install the application
3. Open MongoDB Compass
4. Connect using: `mongodb://127.0.0.1:27017`
5. Select database: `larkon`
6. Browse all collections visually!

**Pros**: Best UI, easy to use, no setup needed
**Cons**: Desktop app (not browser-based)

---

## Option 2: mongo-express (Web-Based - Access in Browser)

### Step 1: Fix MongoDB Authentication

You need to either disable auth OR create a user. Choose one:

#### Option A: Disable Authentication (Easier for Local Dev)

1. Stop MongoDB:
```bash
brew services stop mongodb-community
```

2. Edit config:
```bash
nano /opt/homebrew/etc/mongod.conf
```

3. Comment out security section:
```yaml
# security:
#   authorization: enabled
```

4. Save and restart:
```bash
brew services start mongodb-community
```

#### Option B: Create MongoDB User (More Secure)

1. Stop MongoDB temporarily
2. Start MongoDB without auth:
```bash
mongod --noauth --dbpath /opt/homebrew/var/mongodb
```

3. In another terminal, create user:
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: [ { role: "root", db: "admin" } ]
})
exit
```

4. Stop the no-auth MongoDB and restart normally
5. Update connection string in `backend/local.env`:
```env
MONGODB_URI=mongodb://admin:admin123@127.0.0.1:27017/larkon?authSource=admin
```

### Step 2: Start mongo-express

```bash
cd /Users/macpro/Documents/Fashion/ShopoProject/backend

# If auth is disabled:
ME_CONFIG_MONGODB_URL=mongodb://127.0.0.1:27017/larkon mongo-express

# If auth is enabled:
ME_CONFIG_MONGODB_URL=mongodb://admin:admin123@127.0.0.1:27017/larkon?authSource=admin mongo-express
```

### Step 3: Access in Browser

Open: **http://localhost:8081**

**Login** (if basic auth is enabled):
- Username: `admin`
- Password: `admin123`

---

## Option 3: Quick Start Script

Create a file `start-mongo-express.sh`:

```bash
#!/bin/bash
cd /Users/macpro/Documents/Fashion/ShopoProject/backend

# Check if auth is enabled
if grep -q "authorization: enabled" /opt/homebrew/etc/mongod.conf; then
  echo "Using authenticated connection..."
  ME_CONFIG_MONGODB_URL=mongodb://admin:admin123@127.0.0.1:27017/larkon?authSource=admin mongo-express
else
  echo "Using non-authenticated connection..."
  ME_CONFIG_MONGODB_URL=mongodb://127.0.0.1:27017/larkon mongo-express
fi
```

Make it executable:
```bash
chmod +x start-mongo-express.sh
./start-mongo-express.sh
```

---

## Recommended: Use MongoDB Compass

For the best experience, I recommend **MongoDB Compass**:
- ✅ Beautiful, intuitive interface
- ✅ Easy to browse collections
- ✅ Edit documents visually
- ✅ Run queries easily
- ✅ View indexes and stats
- ✅ No command-line setup needed

Just download, install, and connect to `mongodb://127.0.0.1:27017`

---

## Current Status

Your MongoDB is running with authentication enabled. You need to either:
1. **Disable auth** (easiest for local dev) - Edit `/opt/homebrew/etc/mongod.conf`
2. **Create a user** - Follow Option B above

Then you can use either MongoDB Compass or mongo-express to view your database in a browser/GUI.

