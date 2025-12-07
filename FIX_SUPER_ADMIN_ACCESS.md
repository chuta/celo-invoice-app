# Fix Super Admin Access to Invoices

## Problem

Super admins cannot view users' invoices because the RLS (Row Level Security) policies only check for `role = 'admin'` and don't include `role = 'super_admin'`.

## Solution

Update all RLS policies to include both `admin` and `super_admin` roles.

## How to Apply

### Quick Fix (30 seconds)

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy all contents from `supabase-fix-super-admin-rls.sql`
4. Paste and click "Run"
5. Done! ✅

## What Gets Fixed

The fix updates RLS policies for:

1. **Invoices**
   - View all invoices
   - Update all invoices

2. **Clients**
   - View all clients

3. **Invoice History**
   - View all invoice history

## What Changed

### Before (Broken)
```sql
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'  -- ❌ Only admin
    )
  );
```

### After (Fixed)
```sql
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')  -- ✅ Both roles
    )
  );
```

## Verify It's Working

After applying the fix:

### Test 1: View Invoices
1. Log in as super admin
2. Go to Admin Dashboard (`/admin`)
3. You should see all users' invoices ✅

### Test 2: View Clients
1. Go to Clients page
2. You should see all users' clients ✅

### Test 3: Check Policies
```sql
-- View all policies for invoices
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'invoices'
AND policyname LIKE '%Admin%';
```

Should show policies with `role IN ('admin', 'super_admin')`.

## Affected Tables

The fix updates policies for these tables:
- ✅ `invoices` - View and update all invoices
- ✅ `clients` - View all clients
- ✅ `invoice_history` - View all history

## Why This Happened

When we added the `super_admin` role, we updated:
- ✅ The enum type
- ✅ The user's role in profiles table
- ✅ The AuthContext to check for super_admin
- ❌ **Forgot to update RLS policies** ← This was the issue

## Other Tables Already Working

These tables already have correct policies:
- ✅ `profiles` - Super admin policies were added
- ✅ `invoice_sequences` - Open to all authenticated users

## Manual Fix (Alternative)

If you prefer to run commands individually:

```sql
-- 1. Drop old policies
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all invoice history" ON invoice_history;

-- 2. Create new policies with super_admin included
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all invoice history" ON invoice_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

## Troubleshooting

### Still Can't See Invoices?

1. **Verify you're a super admin:**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
   Should show `role = 'super_admin'`

2. **Check policies were updated:**
   ```sql
   SELECT policyname, qual 
   FROM pg_policies 
   WHERE tablename = 'invoices' 
   AND policyname = 'Admins can view all invoices';
   ```
   Should include `'super_admin'` in the qual column

3. **Refresh your browser:**
   - Log out
   - Clear cache
   - Log back in

4. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('invoices', 'clients', 'invoice_history');
   ```
   All should show `rowsecurity = true`

### Error: "policy already exists"

The policy wasn't dropped. Drop it manually:
```sql
DROP POLICY "Admins can view all invoices" ON invoices;
```
Then re-run the CREATE POLICY command.

### Can See Some Invoices But Not All

Check if there are multiple policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'invoices';
```

If you see duplicate policies, drop all and recreate.

## Prevention

When adding new roles in the future:
1. ✅ Update enum type
2. ✅ Update user records
3. ✅ Update AuthContext
4. ✅ **Update ALL RLS policies** ← Don't forget!
5. ✅ Test with new role

## Summary

✅ **Problem:** Super admin can't view users' invoices
✅ **Cause:** RLS policies only check for 'admin' role
✅ **Solution:** Update policies to include 'super_admin'
✅ **File:** `supabase-fix-super-admin-rls.sql`
✅ **Time:** 30 seconds to apply

## Quick Commands

```bash
# 1. Copy this file:
supabase-fix-super-admin-rls.sql

# 2. Paste in Supabase SQL Editor

# 3. Click "Run"

# 4. Refresh browser and test ✅
```

---

**After applying, log in as super admin and verify you can see all invoices in the Admin Dashboard!**
