# Deploy CELO Price Edge Function

## Issue
CORS errors are blocking direct API calls to CoinGecko from the browser.

## Solution
Use a Supabase Edge Function as a proxy to fetch CELO price data.

## Deployment Steps

### Step 1: Login to Supabase CLI
```bash
cd celo-invoice-app
supabase login
```
This will open your browser for authentication.

### Step 2: Link to Your Project
```bash
supabase link --project-ref pijcliprhnxulqctfeik
```

### Step 3: Deploy the Edge Function
```bash
supabase functions deploy get-celo-price
```

### Step 4: Verify Deployment
Test the function:
```bash
curl https://pijcliprhnxulqctfeik.supabase.co/functions/v1/get-celo-price
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

## What Was Changed

### 1. Created Edge Function
**File:** `supabase/functions/get-celo-price/index.ts`

This function:
- Proxies requests to CoinGecko API
- Handles CORS headers properly
- Caches responses for 60 seconds
- Returns CELO price data

### 2. Updated Widget Component
**File:** `src/components/CeloPriceWidget.jsx`

Changed from:
```javascript
// Direct call to CoinGecko (blocked by CORS)
fetch('https://api.coingecko.com/api/v3/simple/price?...')
```

To:
```javascript
// Call through Supabase Edge Function (no CORS issues)
fetch(`${supabaseUrl}/functions/v1/get-celo-price`)
```

## Why This Works

### CORS Problem
Browsers block cross-origin requests for security. CoinGecko's API doesn't allow requests from your domain.

### Edge Function Solution
- Edge Function runs on Supabase servers (not in browser)
- No CORS restrictions on server-to-server calls
- Edge Function adds proper CORS headers for your app
- Acts as a secure proxy

## Testing After Deployment

### 1. Check Function is Live
Go to Supabase Dashboard:
- Navigate to Edge Functions
- Verify `get-celo-price` is deployed
- Check deployment logs

### 2. Test in Browser
Open your app dashboard:
- CELO price widget should load
- No CORS errors in console
- Price updates every 60 seconds

### 3. Manual Test
```bash
# Test the endpoint directly
curl https://pijcliprhnxulqctfeik.supabase.co/functions/v1/get-celo-price
```

## Troubleshooting

### Function Not Deploying
**Issue:** Permission errors or authentication failures

**Solution:**
```bash
# Re-login
supabase logout
supabase login

# Try again
supabase link --project-ref pijcliprhnxulqctfeik
supabase functions deploy get-celo-price
```

### Function Deployed but Not Working
**Issue:** Function returns errors

**Solution:**
1. Check function logs in Supabase Dashboard
2. Verify CoinGecko API is accessible
3. Test the endpoint with curl

### Widget Still Shows Error
**Issue:** Widget can't reach the function

**Solution:**
1. Verify VITE_SUPABASE_URL in .env file
2. Clear browser cache
3. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
4. Check browser console for errors

## Alternative: Manual Deployment via Dashboard

If CLI deployment fails, you can deploy manually:

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `pijcliprhnxulqctfeik`
3. Go to Edge Functions section

### Step 2: Create New Function
1. Click "Create a new function"
2. Name: `get-celo-price`
3. Copy code from `supabase/functions/get-celo-price/index.ts`
4. Paste into editor
5. Click "Deploy"

### Step 3: Test
Use the built-in test feature in the dashboard.

## Quick Commands Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref pijcliprhnxulqctfeik

# Deploy function
supabase functions deploy get-celo-price

# Test function
curl https://pijcliprhnxulqctfeik.supabase.co/functions/v1/get-celo-price

# View logs
supabase functions logs get-celo-price

# List all functions
supabase functions list
```

## Expected Behavior After Fix

### Before (CORS Error)
```
❌ CELO Price
   Unable to fetch price
   
   Console: CORS policy error
```

### After (Working)
```
✅ CELO Price
   $0.6234  ↑ 2.45%
   
   24h Volume: $12.5M
   Market Cap: $450M
   
   Updates every 60 seconds
```

## Performance Notes

- **Caching:** Function caches responses for 60 seconds
- **Rate Limits:** CoinGecko free tier allows 10-50 calls/minute
- **Our Usage:** ~1 call per minute per active user
- **Cost:** Edge Functions are free for reasonable usage

## Security

- No API keys required (CoinGecko free tier)
- Function is publicly accessible (read-only data)
- No sensitive data exposed
- CORS properly configured

## Next Steps After Deployment

1. ✅ Deploy the function
2. ✅ Test in browser
3. ✅ Verify no CORS errors
4. ✅ Commit and push changes
5. ✅ Deploy to production (Netlify)

---

**Status:** Ready to Deploy  
**Priority:** High (blocks CELO price display)  
**Estimated Time:** 5 minutes
