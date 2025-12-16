# CELO Price via Netlify Function

## Solution
Using Netlify Functions instead of Supabase Edge Functions to avoid authentication issues.

## What Was Created

### Netlify Function
**File:** `netlify/functions/get-celo-price.js`

This serverless function:
- Proxies requests to CoinGecko API
- Handles CORS automatically
- No authentication required
- Caches responses for 60 seconds
- Works in both development and production

## How It Works

### Development
```
Your App → /.netlify/functions/get-celo-price → CoinGecko API
```

### Production
```
Your App → https://your-domain.netlify.app/.netlify/functions/get-celo-price → CoinGecko API
```

## Testing Locally

### Step 1: Install Netlify CLI (if not already installed)
```bash
npm install -g netlify-cli
```

### Step 2: Run Development Server
```bash
cd celo-invoice-app
netlify dev
```

This will:
- Start your Vite dev server
- Start Netlify Functions locally
- Make functions available at `/.netlify/functions/*`

### Step 3: Test the Function
Open your browser to `http://localhost:8888` (or whatever port Netlify Dev uses)

The CELO price widget should now work!

### Step 4: Test Function Directly
```bash
curl http://localhost:8888/.netlify/functions/get-celo-price
```

Expected response:
```json
{
  "celo": {
    "usd": 0.6234,
    "usd_24h_change": 2.45,
    "usd_24h_vol": 12500000,
    "usd_market_cap": 450000000
  }
}
```

## Deployment

### Automatic Deployment
When you push to GitHub, Netlify will automatically:
1. Build your app
2. Deploy the Netlify Function
3. Make it available at `/.netlify/functions/get-celo-price`

### Manual Deployment
```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Advantages Over Supabase Edge Functions

✅ **No Authentication Required** - Public function, no JWT verification
✅ **Simpler Deployment** - Automatic with Git push
✅ **Better CORS Handling** - Built-in CORS support
✅ **Easier Local Testing** - `netlify dev` just works
✅ **No CLI Login Issues** - Deploys via Git
✅ **Free Tier Generous** - 125k requests/month

## Files Modified

### 1. Created Netlify Function
`netlify/functions/get-celo-price.js`

### 2. Updated Widget
`src/components/CeloPriceWidget.jsx`
- Changed from Supabase URL to `/.netlify/functions/get-celo-price`
- Removed authentication headers
- Simplified error handling

### 3. Updated Netlify Config
`netlify.toml`
- Added CoinGecko to Content Security Policy
- Functions directory already configured

## Troubleshooting

### Function Not Found (404)
**Issue:** `/.netlify/functions/get-celo-price` returns 404

**Solution:**
```bash
# Make sure you're using netlify dev, not npm run dev
netlify dev

# Or deploy to production and test there
git push origin main
```

### CORS Errors
**Issue:** Still seeing CORS errors

**Solution:**
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for actual error
- Verify function is deployed

### Function Returns Error
**Issue:** Function returns 500 error

**Solution:**
1. Check Netlify function logs in dashboard
2. Test CoinGecko API directly: `curl https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd`
3. Check if CoinGecko is rate limiting

## Testing Checklist

- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Run locally: `netlify dev`
- [ ] Open app in browser
- [ ] Verify CELO price displays
- [ ] Check browser console (no errors)
- [ ] Test function directly: `curl http://localhost:8888/.netlify/functions/get-celo-price`
- [ ] Push to GitHub
- [ ] Verify deployment in Netlify dashboard
- [ ] Test production URL
- [ ] Verify price updates every 60 seconds

## Production URLs

### Your App
```
https://celoafricadao-invoice.netlify.app
```

### Function Endpoint
```
https://celoafricadao-invoice.netlify.app/.netlify/functions/get-celo-price
```

## Performance

- **Cold Start:** ~100-300ms (first request)
- **Warm:** ~50-100ms (subsequent requests)
- **Cache:** 60 seconds (reduces API calls)
- **Rate Limit:** CoinGecko free tier (10-50 calls/min)

## Cost

**Netlify Free Tier:**
- 125,000 function requests/month
- 100 hours of function runtime/month

**Our Usage:**
- ~1 request per user per minute
- Well within free tier limits

## Next Steps

1. ✅ Code is ready
2. ✅ Function created
3. ✅ Widget updated
4. 🔄 Test locally with `netlify dev`
5. 🔄 Push to GitHub
6. 🔄 Verify in production

---

**Status:** Ready to Test  
**Deployment:** Automatic via Git  
**No Manual Steps Required** (after push)
