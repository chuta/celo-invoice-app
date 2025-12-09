# Fix Payment Requests Display

## Problem
Payment requests created via the payment link feature are stored in the database but not displayed in the UI.

## Root Cause
The `public_payment_requests` table may not exist in your database, or the data is only being stored in `payment_link_analytics` table.

## Solution

### Step 1: Run the Diagnostic Script
First, check what's in your database:

```bash
# In Supabase SQL Editor, run:
cat diagnose-payment-requests.sql
```

This will show you:
- If the `public_payment_requests` table exists
- Payment events in `payment_link_analytics`
- Current payment requests
- RLS policies

### Step 2: Apply the Fix
Run the fix script in Supabase SQL Editor:

```bash
# Copy and paste the contents of this file into Supabase SQL Editor:
cat fix-payment-requests-display.sql
```

This script will:
1. ✅ Create the `public_payment_requests` table if it doesn't exist
2. ✅ Set up proper indexes for performance
3. ✅ Configure RLS policies for security
4. ✅ Migrate any payment events from `payment_link_analytics` to `public_payment_requests`
5. ✅ Create helper views and functions

### Step 3: Verify the Fix
After running the script:

1. Go to your app at `/payment-requests`
2. Click the "🔄 Refresh" button
3. You should now see all payment requests

### Step 4: Test with a New Payment Request
1. Go to your payment link: `/pay/your-username`
2. Fill out the form and submit a test payment request
3. Go back to `/payment-requests`
4. The new request should appear immediately

## What Changed

### Database
- Ensured `public_payment_requests` table exists with proper schema
- Migrated historical payment data from analytics table
- Added RLS policies for security
- Created helper functions for stats

### UI (PaymentRequests.jsx)
- Added refresh button
- Improved error handling and logging
- Better loading states
- Console logs for debugging

## Troubleshooting

### If you still don't see payment requests:

1. **Check the browser console** for errors
2. **Verify your user ID** matches the recipient_user_id in the database
3. **Check RLS policies** - make sure you're authenticated
4. **Run the diagnostic script** again to see what's in the database

### Manual check in Supabase:
```sql
-- Check if you have any payment requests
SELECT * FROM public_payment_requests 
WHERE recipient_user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- Check payment events in analytics
SELECT * FROM payment_link_analytics 
WHERE event_type = 'payment' 
AND user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

## Future Payments
After applying this fix, all new payment requests will be:
1. Stored in `public_payment_requests` table (primary storage)
2. Tracked in `payment_link_analytics` table (for analytics)
3. Visible in the Payment Requests page
4. Ready to be converted to invoices

## Need Help?
If payment requests still don't show up:
1. Check the browser console for errors
2. Check the Supabase logs
3. Verify the RLS policies are correct
4. Make sure you're logged in as the correct user
