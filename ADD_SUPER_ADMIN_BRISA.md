# Add Brisa Mukunde as Super Admin

## User Details
- **Name:** Brisa Mukunde
- **Email:** brisamukunde1@gmail.com
- **User ID:** e30d6281-2620-460c-993a-19ad3e3561b2
- **Role:** Super Admin

## Prerequisites

Before running the SQL script, ensure:
1. ✅ User has already registered in the app
2. ✅ User's email is verified
3. ✅ User ID matches the one in the database

## Method 1: Using Supabase SQL Editor (Recommended)

### Step 1: Open SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the SQL Script
Copy and paste this SQL:

```sql
-- Add Brisa Mukunde as Super Admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';
```

### Step 3: Execute
1. Click **Run** (or press Cmd/Ctrl + Enter)
2. Check the results panel
3. Verify role shows as `super_admin`

### Step 4: Verify All Super Admins
Run this query to see all super admins:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'super_admin'
ORDER BY created_at;
```

Expected result: Should show both super admins

## Method 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd celo-invoice-app
supabase db execute --file add-super-admin-brisa.sql
```

## Method 3: Using Table Editor

### Manual Update via UI:
1. Go to **Table Editor** in Supabase Dashboard
2. Select **profiles** table
3. Find the row with email `brisamukunde1@gmail.com`
4. Click on the **role** cell
5. Change value to `super_admin`
6. Press Enter to save

## Verification Steps

### 1. Check Database
Run this query:
```sql
SELECT email, role FROM profiles WHERE email = 'brisamukunde1@gmail.com';
```
Expected: `role = 'super_admin'`

### 2. Test Login
1. Have Brisa login to: https://celo-invoice.netlify.app
2. After login, check the navigation menu
3. Should see:
   - 👑 **Admin Dashboard** (admin access)
   - 👥 **User Management** (super admin only)

### 3. Test Permissions
As Brisa, try to:
- ✅ Access Admin Dashboard
- ✅ Approve/Reject invoices
- ✅ Mark invoices as paid
- ✅ Access User Management page
- ✅ Change other users' roles
- ✅ View all users in the system

## Super Admin Capabilities

Once promoted, Brisa will be able to:

### Admin Functions:
- 📋 View all invoices from all users
- ✅ Approve pending invoices
- ❌ Reject invoices with reasons
- 💰 Mark invoices as paid
- ⊘ Void approved invoices
- 📊 View dashboard statistics
- 📥 Export invoices to CSV

### Super Admin Functions:
- 👥 View all users in the system
- 🔄 Change user roles (user ↔ admin ↔ super_admin)
- 👁️ View user details and statistics
- 🔒 Manage system-wide permissions
- 📧 Access to all email notifications

## Current Super Admins

After this update, the system will have:

1. **Chimezi Echuta**
   - Email: blockspacetechnologies@gmail.com
   - Role: Super Admin (original)

2. **Brisa Mukunde**
   - Email: brisamukunde1@gmail.com
   - Role: Super Admin (new)

## Security Notes

### Super Admin Responsibilities:
- 🔐 Protect login credentials
- 🚫 Don't share super admin access
- 📝 Document any role changes made
- ⚠️ Be careful when changing user roles
- 🔍 Monitor system activity regularly

### Best Practices:
- Only promote trusted team members
- Keep super admin count minimal (2-3 max)
- Regular security audits
- Use strong passwords + 2FA (if available)
- Log all administrative actions

## Troubleshooting

### Issue: User ID not found
**Solution:** 
1. Check if user has registered
2. Verify email address is correct
3. Get correct user ID from profiles table:
```sql
SELECT id, email FROM profiles WHERE email = 'brisamukunde1@gmail.com';
```

### Issue: Update doesn't work
**Possible causes:**
- User hasn't registered yet
- Wrong user ID
- Database permissions issue

**Solution:**
1. Verify user exists in profiles table
2. Check user ID is correct
3. Try using Table Editor method instead

### Issue: User can't see admin features
**Solution:**
1. Have user logout completely
2. Clear browser cache
3. Login again
4. Check role in database is actually updated

### Issue: RLS (Row Level Security) blocks access
**Solution:**
Run the RLS fix script:
```bash
cd celo-invoice-app
# Check supabase-fix-super-admin-rls.sql
```

## Rollback (If Needed)

To remove super admin access:

```sql
-- Demote back to regular user
UPDATE profiles
SET role = 'user'
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';

-- Or promote to regular admin
UPDATE profiles
SET role = 'admin'
WHERE id = 'e30d6281-2620-460c-993a-19ad3e3561b2';
```

## Post-Update Checklist

- [ ] SQL script executed successfully
- [ ] Verification query shows `super_admin` role
- [ ] User can login to the app
- [ ] User sees "User Management" in navigation
- [ ] User can access Admin Dashboard
- [ ] User can access User Management page
- [ ] User can view all users
- [ ] User can change other users' roles
- [ ] Documented in team records
- [ ] User informed of new permissions

## Quick Reference

### SQL File Location
```
celo-invoice-app/add-super-admin-brisa.sql
```

### Supabase Dashboard Links
- [SQL Editor](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/sql)
- [Table Editor - Profiles](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/editor/profiles)
- [Authentication - Users](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/auth/users)

### App URL
- Production: https://celo-invoice.netlify.app

---

**Status:** 📝 Ready to Execute
**Created:** December 8, 2025
**Action Required:** Run SQL script in Supabase Dashboard
