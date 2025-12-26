# Migrate Categories and Styles to Production

## Overview

This guide helps you copy categories and styles from your local MongoDB to Production MongoDB Atlas.

## Prerequisites

1. ✅ MongoDB Atlas cluster is resumed and running
2. ✅ Local MongoDB has categories and styles you want to migrate
3. ✅ Node.js is installed

## Step-by-Step Migration

### Step 1: Verify Local Data

First, make sure you have categories and styles in your local database:

```bash
# Your backend should be connected to local MongoDB
# Check in admin panel: http://localhost:3000
# Navigate to Categories and Styles pages to see what you have
```

### Step 2: Run Migration Script

```bash
cd backend
./migrate-to-production.sh
```

Or run directly:
```bash
cd backend
node migrate-local-to-production.js
```

### Step 3: What the Script Does

- ✅ Connects to local MongoDB (127.0.0.1:27017)
- ✅ Connects to production MongoDB Atlas
- ✅ Reads all categories from local database
- ✅ Reads all styles from local database
- ✅ For each item:
  - If item with same name/slug exists in production → **Updates** it
  - If item doesn't exist → **Creates** new one
- ✅ Shows progress and summary

### Step 4: Switch to Production Database

After migration completes:

```bash
cd backend
./switch-db.sh
# Choose option 2 (Production MongoDB Atlas)
```

### Step 5: Restart Backend

```bash
cd backend
npm run dev
```

### Step 6: Verify in Admin Panel

1. Open admin panel: http://localhost:3000
2. Navigate to Categories page
3. Navigate to Styles page
4. Verify your data is there

## Migration Behavior

### Categories
- **Matches by:** `name` or `slug`
- **If exists:** Updates the existing category
- **If new:** Creates a new category

### Styles
- **Matches by:** `name` or `slug`
- **If exists:** Updates the existing style
- **If new:** Creates a new style

## Important Notes

### ⚠️ Data Safety

- The script **updates** existing items if they have the same name/slug
- It does **NOT** delete anything from production
- It only **adds** or **updates** data

### 🔄 Duplicate Handling

If a category/style with the same name exists in production:
- Local data will **overwrite** production data
- Be careful if production has different data you want to keep

### 📊 What Gets Migrated

**Migrated:**
- ✅ Category name, slug, description, image, status, etc.
- ✅ Style name, slug, description, image, icon, type, status, etc.

**Not Migrated:**
- ❌ Products (separate migration needed)
- ❌ Orders
- ❌ Users
- ❌ Other collections

## Troubleshooting

### Error: "Cannot connect to local MongoDB"
- Make sure local MongoDB is running: `brew services list | grep mongodb`
- Start it: `brew services start mongodb-community`

### Error: "Cannot connect to production MongoDB"
- Check if MongoDB Atlas cluster is resumed
- Go to https://cloud.mongodb.com and verify cluster status
- Wait 2-3 minutes after resuming

### Error: "Module not found: mongoose"
- Install dependencies: `cd backend && npm install`

### No data migrated
- Check if local database has categories/styles
- Verify you're looking at the correct database
- Check migration script output for errors

## Manual Migration (Alternative)

If the script doesn't work, you can manually export/import:

### Export from Local
```bash
mongodump --uri="mongodb://127.0.0.1:27017/larkon_fashion" --collection=categories --out=./backup
mongodump --uri="mongodb://127.0.0.1:27017/larkon_fashion" --collection=styles --out=./backup
```

### Import to Production
```bash
mongorestore --uri="mongodb+srv://shopo_admin:***@cluster0.zikm9az.mongodb.net/larkon_fashion" --collection=categories ./backup/larkon_fashion/categories.bson
mongorestore --uri="mongodb+srv://shopo_admin:***@cluster0.zikm9az.mongodb.net/larkon_fashion" --collection=styles ./backup/larkon_fashion/styles.bson
```

## After Migration

1. ✅ Switch to production database
2. ✅ Restart backend
3. ✅ Verify data in admin panel
4. ✅ Test creating/editing categories and styles
5. ✅ Verify uploads work correctly

