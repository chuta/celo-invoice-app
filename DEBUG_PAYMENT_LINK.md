# Debug Payment Link 404 Error

## Issue
Payment link shows "Payment Link Not Found" error even though username is set.

## Root Cause
The `get_public_profile()` function is returning no data, which means one of these conditions is not met:
1. Username exists in database
2. `public_profile = true`
3. `payment_link_enabled = true`

## Quick Debug Steps

### Step 1: Check if username exists in database

Run this in Supabase SQL Editor:

```sql
SELECT 
  id,
  username,
  full_name,
  email,
  public_profile,
  payment_link_enabled,
  wallet_address
FROM profiles
WHERE username = 'chuta';
```

**Expected Result:** Should return 1 row with your profile data

**If no rows:** Username wasn't saved. Go back to Payment Link Settings and save again.

### Step 2: Check the flags

If the query above returns data, check these values:
- `public_profile` should be `true` (not `false` or `NULL`)
- `payment_link_enabled` should be `true` (not `false` or `NULL`)

**If either is false/NULL:**

```sql
UPDATE profiles
SET 
  public_profile = true,
  payment_link_enabled = true
WHERE username = 'chuta';
```

### Step 3: Test the function directly

```sql
SELECT * FROM get_public_profile('chuta');
```

**Expected Result:** Should return your profile data

**If no rows:** The function conditions aren't met. Check Step 2.

### Step 4: Check for case sensitivity

```sql
-- Check if username is stored in different case
SELECT username FROM profiles WHERE LOWER(username) = 'chuta';
```

The function uses `LOWER(username_param)` so it should work regardless of case.

## Common Issues & Fixes

### Issue 1: public_profile is false

**Fix:**
```sql
UPDATE profiles
SET public_profile = true
WHERE username = 'chuta';
```

### Issue 2: payment_link_enabled is false

**Fix:**
```sql
UPDATE profiles
SET payment_link_enabled = true
WHERE username = 'chuta';
```

### Issue 3: Username not saved

**Fix:**
1. Go to Payment Link Settings in the app
2. Enter username: `chuta`
3. Check "Make my profile public"
4. Check "Enable payment link"
5. Click "Save Settings"

### Issue 4: Function doesn't exist

**Fix:**
Run the schema again from `APPLY_INVOICEME_SCHEMA.md`

## Verification Query

Run this to see exactly what the function sees:

```sql
SELECT 
  username,
  public_profile,
  payment_link_enabled,
  CASE 
    WHEN public_profile = true AND payment_link_enabled = true THEN '✅ Will show'
    WHEN public_profile = false THEN '❌ Public profile disabled'
    WHEN payment_link_enabled = false THEN '❌ Payment link disabled'
    ELSE '❌ Unknown issue'
  END as status
FROM profiles
WHERE username = 'chuta';
```

## Manual Fix (If Settings Page Doesn't Work)

If the settings page isn't saving properly, manually update:

```sql
UPDATE profiles
SET 
  username = 'chuta',
  public_profile = true,
  payment_link_enabled = true,
  tagline = 'Your tagline here',
  bio = 'Your bio here'
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email.

## Test After Fix

1. Run the verification query above
2. Should see "✅ Will show"
3. Visit: https://celo-invoice.netlify.app/pay/chuta
4. Should see your profile page

## Still Not Working?

### Check browser console

1. Open browser console (F12)
2. Go to Console tab
3. Visit the payment link
4. Look for errors

Common errors:
- "Error fetching profile" - Function issue
- "RPC call failed" - Function doesn't exist
- Network error - Supabase connection issue

### Check Supabase logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for errors related to `get_public_profile`

### Verify function exists

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_public_profile';
```

Should return 1 row.

## Quick Fix Script

Run this all-in-one fix (replace email):

```sql
-- Update your profile
UPDATE profiles
SET 
  username = 'chuta',
  public_profile = true,
  payment_link_enabled = true
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify it worked
SELECT 
  username,
  public_profile,
  payment_link_enabled,
  'Should see profile now!' as message
FROM profiles
WHERE username = 'chuta';

-- Test the function
SELECT * FROM get_public_profile('chuta');
```

If the last query returns data, the payment link will work!

---

**Most Common Fix:**
Just need to set `public_profile = true` in the database. The checkbox in the UI might not have saved properly.
