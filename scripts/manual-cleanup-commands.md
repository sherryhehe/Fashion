# Manual Cleanup Commands

If the server is not responding via script, use these commands manually when you can connect.

## Step 1: Connect to Server
```bash
ssh root@31.97.232.219
# Password: 8wANN666BG6xXa2@
```

## Step 2: Stop and Delete PM2 Processes
```bash
pm2 stop all
pm2 delete all
pm2 kill
pm2 save --force
```

## Step 3: Delete Deployed Code
```bash
cd /var/www
rm -rf ShopProject/admin
rm -rf ShopProject/backend
```

## Step 4: Clean PM2 Data
```bash
rm -f /root/.pm2/dump.pm2
```

## Step 5: Verify
```bash
pm2 list
ls -la /var/www/ShopProject/
```

## All-in-One Command
```bash
pm2 stop all && pm2 delete all && pm2 kill && \
rm -rf /var/www/ShopProject/admin /var/www/ShopProject/backend && \
rm -f /root/.pm2/dump.pm2 && \
echo "✅ Cleanup complete!"
```

