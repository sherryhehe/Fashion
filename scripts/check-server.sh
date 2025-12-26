#!/bin/bash
# Check if server is online and accessible

VPS_HOST="31.97.232.219"
VPS_PASS="8wANN666BG6xXa2@"

echo "🔍 Checking Server Status..."
echo ""

# Try to connect
if sshpass -p "$VPS_PASS" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@$VPS_HOST "echo '✅ Server is online' && uptime" 2>/dev/null; then
    echo ""
    echo "✅ Server is accessible!"
    echo ""
    echo "You can now run:"
    echo "  ./scripts/cleanup-deployed-code.sh"
    echo ""
    echo "Or connect manually:"
    echo "  ssh root@$VPS_HOST"
else
    echo "❌ Server is not responding"
    echo ""
    echo "Possible reasons:"
    echo "  - Server is rebooting"
    echo "  - Network connectivity issues"
    echo "  - SSH service is down"
    echo ""
    echo "Try again in a few minutes or check:"
    echo "  - Hostinger control panel"
    echo "  - Server status page"
fi

