# 🔧 Local Testing Setup Guide

**Date:** December 2024  
**Status:** ✅ **CONFIGURED FOR LOCAL TESTING**

---

## 📋 CONFIGURATION CHANGES

### **Mobile App API Configuration:**
✅ Updated to use local backend for testing

**File:** `mobile/src/config/apiConfig.ts`

**Changes:**
- ✅ `LOCAL_IP` set to: `192.168.100.233` (your machine's IP)
- ✅ `FORCE_PRODUCTION_API` set to: `false` (uses local backend)

**Result:**
- Mobile app will now connect to: `http://192.168.100.233:8000/api`
- Images will load from: `http://192.168.100.233:8000`

---

## 🚀 TESTING SETUP

### **Backend Status:**
✅ Running on `http://localhost:8000`
- API endpoint: `http://localhost:8000/api`
- Health check: `http://localhost:8000/api/health`

### **Mobile App Connection:**
- API URL: `http://192.168.100.233:8000/api`
- Image URL: `http://192.168.100.233:8000`

### **Network Requirements:**
1. ✅ Backend running on port 8000
2. ✅ Phone/Emulator on same WiFi network
3. ✅ Firewall allows port 8000 connections

---

## ✅ WHAT TO TEST

### **Recent Fixes:**
1. ✅ **Wishlist** - Should show only user's items (not all products)
2. ✅ **Order Images** - Each order should show correct product image

### **Test Steps:**

#### **1. Test Wishlist:**
- [ ] Login as different users
- [ ] Add items to wishlist
- [ ] Verify each user sees only their own items
- [ ] Test removing items from wishlist

#### **2. Test Order Images:**
- [ ] Create new orders with different products
- [ ] Verify each order shows correct product image
- [ ] Check order history displays correctly

#### **3. General Testing:**
- [ ] Login/Register works
- [ ] Products load correctly
- [ ] Images display properly
- [ ] Cart functionality works
- [ ] Order creation works

---

## 🔄 SWITCHING BACK TO PRODUCTION

### **When Ready for Production:**

**File:** `mobile/src/config/apiConfig.ts`

**Change:**
```typescript
const FORCE_PRODUCTION_API = true; // Switch back to production
```

**Result:**
- Mobile app will use: `https://api.buyshopo.com/api`
- Production images: `https://api.buyshopo.com`

---

## 🛠️ TROUBLESHOOTING

### **Issue: Can't connect to local backend**

**Check:**
1. ✅ Backend is running: `curl http://localhost:8000/api/health`
2. ✅ Correct IP address: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. ✅ Phone/Emulator on same WiFi
4. ✅ Firewall allows port 8000

**If IP changed:**
- Update `LOCAL_IP` in `mobile/src/config/apiConfig.ts`
- Restart mobile app

### **Issue: Images not loading**

**Check:**
1. ✅ Backend uploads folder accessible
2. ✅ Image URLs use correct base URL
3. ✅ CORS configured correctly

---

## 📝 CONFIGURATION FILES

### **Mobile App:**
- `mobile/src/config/apiConfig.ts` - Main API configuration

### **Backend:**
- `backend/src/index-mongodb.ts` - Server configuration
- `backend/src/config/database.ts` - MongoDB connection

---

## ✅ STATUS

**Current Mode:** 🟢 **LOCAL TESTING**

**API Endpoint:** `http://192.168.100.233:8000/api`  
**Image Endpoint:** `http://192.168.100.233:8000`  
**Backend Running:** ✅ Port 8000  
**Mobile App:** ✅ Configured for local testing

---

## 🎯 NEXT STEPS

1. ✅ Start mobile app: `cd mobile && npm start`
2. ✅ Test wishlist fixes
3. ✅ Test order images fixes
4. ✅ Verify all changes work correctly
5. 🔄 Switch back to production when ready

---

**Setup By:** Auto (Cursor AI)  
**Date:** December 2024  
**Local IP:** 192.168.100.233

