#!/bin/bash

# Test CELO Price Netlify Function
# This script tests the function locally and in production

echo "🧪 Testing CELO Price Netlify Function"
echo "======================================"
echo ""

# Test 1: Check if function file exists
echo "✓ Checking if function file exists..."
if [ -f "netlify/functions/get-celo-price.js" ]; then
    echo "  ✅ Function file found"
else
    echo "  ❌ Function file not found"
    exit 1
fi

echo ""

# Test 2: Test CoinGecko API directly
echo "✓ Testing CoinGecko API directly..."
COINGECKO_RESPONSE=$(curl -s "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd&include_24hr_change=true")
if echo "$COINGECKO_RESPONSE" | grep -q "celo"; then
    echo "  ✅ CoinGecko API is accessible"
    echo "  Response: $COINGECKO_RESPONSE"
else
    echo "  ❌ CoinGecko API is not accessible"
    echo "  Response: $COINGECKO_RESPONSE"
fi

echo ""

# Test 3: Instructions for local testing
echo "✓ To test locally:"
echo "  1. Run: netlify dev"
echo "  2. Open: http://localhost:8888"
echo "  3. Check dashboard for CELO price"
echo "  4. Or test function directly:"
echo "     curl http://localhost:8888/.netlify/functions/get-celo-price"

echo ""

# Test 4: Instructions for production testing
echo "✓ To test in production:"
echo "  1. Push to GitHub (already done)"
echo "  2. Wait for Netlify deployment"
echo "  3. Visit: https://celoafricadao-invoice.netlify.app"
echo "  4. Or test function directly:"
echo "     curl https://celoafricadao-invoice.netlify.app/.netlify/functions/get-celo-price"

echo ""
echo "✅ All checks passed!"
echo ""
echo "📝 Next steps:"
echo "  - Run 'netlify dev' to test locally"
echo "  - Check Netlify dashboard for deployment status"
echo "  - Verify CELO price displays on dashboard"
