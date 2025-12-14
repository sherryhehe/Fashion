#!/bin/bash
# Quick SSH Connection Script

echo "🔐 Connecting to Production VPS..."
echo "Server: 31.97.232.219"
echo "User: root"
echo "Password: 8wANN666BG6xXa2@"
echo ""

# Use sshpass if available, otherwise prompt for password
if command -v sshpass &> /dev/null; then
    sshpass -p '8wANN666BG6xXa2@' ssh -o StrictHostKeyChecking=no root@31.97.232.219
else
    echo "⚠️  sshpass not found. You'll need to enter the password manually."
    ssh root@31.97.232.219
fi

