# Troubleshooting Deployment Issues

## SSH Connection Timeout

### Error: `ssh: connect to host 31.97.232.219 port 22: Operation timed out`

This means the production server is not accessible via SSH.

## Quick Diagnosis

Run the server status check:

```bash
./scripts/check-server-status.sh
```

This will check:
- ✅ Server reachability (ping)
- ✅ SSH port accessibility
- ✅ HTTP/HTTPS ports
- ✅ SSH connection test
- ✅ PM2 services status

## Common Causes & Solutions

### 1. Server is Down or Restarting

**Symptoms:**
- Ping fails
- All ports closed
- No response from server

**Solutions:**
1. Check server status in hosting panel (Hostinger hPanel)
2. Restart the server if needed
3. Wait 2-3 minutes after restart
4. Try deployment again

### 2. Firewall Blocking SSH

**Symptoms:**
- Ping works
- HTTP/HTTPS ports open
- SSH port (22) closed

**Solutions:**
1. Check firewall settings in hosting panel
2. Ensure SSH port 22 is allowed
3. Check if SSH service is running
4. Contact hosting support if needed

### 3. SSH Service Stopped

**Symptoms:**
- Server is reachable
- SSH port is closed
- Other services may be running

**Solutions:**
1. Access server via hosting panel console
2. Start SSH service: `systemctl start ssh` or `systemctl start sshd`
3. Check SSH status: `systemctl status ssh`
4. Enable auto-start: `systemctl enable ssh`

### 4. Network Connectivity Issues

**Symptoms:**
- Intermittent timeouts
- Works sometimes, fails other times

**Solutions:**
1. Check your internet connection
2. Try from different network
3. Use VPN if your IP is blocked
4. Wait and retry

## Alternative Deployment Methods

### Option 1: Wait and Retry

Sometimes servers are temporarily unavailable:

```bash
# Wait 5 minutes and retry
sleep 300
./deploy-with-data.sh
```

### Option 2: Deploy Data First (Local)

If you can't deploy code yet, at least migrate the data:

```bash
cd backend
./migrate-to-production.sh
```

This only requires MongoDB Atlas to be accessible (not the VPS).

### Option 3: Manual Deployment via Hosting Panel

If SSH is blocked, you can:

1. **Build locally:**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Admin
   cd admin
   NEXT_PUBLIC_API_URL=https://api.buyshopo.com/api npm run build
   ```

2. **Upload via File Manager:**
   - Use hosting panel's file manager
   - Upload `backend/dist/` to `/var/www/ShopProject/backend/`
   - Upload `admin/.next/` to `/var/www/ShopProject/admin/`

3. **Run commands via Console:**
   - Use hosting panel's terminal/console
   - Run: `cd /var/www/ShopProject/backend && npm ci --production`
   - Run: `pm2 restart shop-backend shop-admin`

### Option 4: Use Different SSH Port

If SSH is on a different port:

```bash
# Edit deploy scripts to use different port
# Change: ssh ... -p 22 ...
# To: ssh ... -p 2222 ... (or whatever port)
```

## Check Server Status

### Via Hosting Panel

1. Login to Hostinger hPanel
2. Go to VPS management
3. Check server status
4. View server logs
5. Restart if needed

### Via Browser

Check if services are running:
- Admin: https://admin.buyshopo.com
- API: https://api.buyshopo.com/api/health

If these work, the server is up but SSH might be blocked.

## Prevention

### Keep Server Running

1. Set up monitoring alerts
2. Configure auto-restart for services
3. Use PM2 startup script: `pm2 startup`
4. Monitor server resources

### Backup SSH Access

1. Configure alternative SSH port
2. Set up SSH key authentication
3. Keep hosting panel access as backup
4. Document all access methods

## When to Contact Support

Contact hosting support if:
- Server is down for more than 30 minutes
- SSH is blocked and you can't access via panel
- Services keep crashing
- You need help with firewall configuration

## Quick Commands

```bash
# Check server status
./scripts/check-server-status.sh

# Test SSH connection
ssh -o ConnectTimeout=5 root@31.97.232.219 "echo 'Connected'"

# Check if services are running (if SSH works)
ssh root@31.97.232.219 "pm2 list"

# Migrate data only (doesn't need SSH)
cd backend && ./migrate-to-production.sh
```

## Next Steps

1. **Run status check:** `./scripts/check-server-status.sh`
2. **Check hosting panel:** Verify server is running
3. **Wait and retry:** Sometimes temporary issues resolve
4. **Migrate data first:** At least get data to production
5. **Deploy code later:** When SSH is accessible

