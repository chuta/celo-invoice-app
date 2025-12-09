# Quick Fix: Payment Requests Not Showing

## 🚨 Problem
Payment requests submitted via `/pay/username` are not showing up in `/payment-requests`

## ⚡ Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to your Supabase project → SQL Editor

### Step 2: Run This Script
Copy and paste the entire contents of `fix-payment-requests-display.sql` and execute it.

### Step 3: Refresh Your App
Go to `/payment-requests` and click the "🔄 Refresh" button.

## ✅ Expected Result
You should now see all payment requests that were submitted via your payment link.

## 🧪 Test It
1. Go to `/pay/your-username`
2. Submit a test payment request
3. Go to `/payment-requests`
4. The request should appear immediately

## 📊 What the Fix Does
- Creates `public_payment_requests` table (if missing)
- Migrates historical payment data from analytics
- Sets up proper security policies
- Adds indexes for performance

## 🔍 Still Not Working?

### Check 1: Are you logged in?
Payment requests only show for the authenticated user.

### Check 2: Is the table empty?
Run in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM public_payment_requests;
```

### Check 3: Check your user ID
Run in Supabase SQL Editor:
```sql
SELECT * FROM public_payment_requests 
WHERE recipient_user_id = auth.uid();
```

### Check 4: Browser Console
Open browser DevTools → Console tab. Look for errors.

## 📚 More Info
- Full documentation: `FIX_PAYMENT_REQUESTS_DISPLAY.md`
- Data flow diagram: `PAYMENT_REQUESTS_DATA_FLOW.md`
- Summary: `PAYMENT_REQUESTS_FIX_SUMMARY.md`

## 🆘 Need Help?
1. Run `diagnose-payment-requests.sql` to see what's in your database
2. Check browser console for JavaScript errors
3. Check Supabase logs for database errors
4. Verify you're using the correct username in the payment link

---

**Time to fix:** ~2 minutes  
**Difficulty:** Easy (just copy/paste SQL)  
**Impact:** High (enables full payment workflow)
