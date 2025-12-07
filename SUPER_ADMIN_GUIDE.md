# Super Admin Guide

Complete guide for super admin features in the CELOAfricaDAO Invoice Management System.

## Overview

The super admin role is the highest level of access in the system. Super admins have all admin privileges plus the ability to manage user roles.

## Role Hierarchy

```
👑 Super Admin (highest)
  ↓
🔐 Admin
  ↓
👤 User (regular)
```

## Super Admin Setup

### Initial Setup (Already Done)

The user with ID `98365811-902c-4d93-b301-24f07c9359dd` and email `blockspacetechnologies@gmail.com` has been set as super admin.

### Verify Super Admin Status

1. Go to Supabase Dashboard
2. Navigate to Table Editor → profiles
3. Find the user
4. Check that `role` = `super_admin`

Or run this SQL query:
```sql
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'blockspacetechnologies@gmail.com';
```

## Super Admin Capabilities

### 1. All Admin Features
- View all invoices from all users
- Approve/reject invoices
- Export to CSV for bulk payments
- Access admin dashboard
- View statistics

### 2. User Management (Exclusive to Super Admin)
- View all users in the system
- Promote users to admin
- Demote admins to regular users
- View user details (wallet addresses, join dates)
- Search and filter users

### 3. Protected Status
- Super admin role cannot be changed via the UI
- Only database-level changes can modify super admin status
- This prevents accidental demotion

## How to Use User Management

### Access User Management

1. Log in as super admin
2. Click "👑 Users" in the sidebar
3. You'll see the User Management page

### View All Users

The page displays:
- User name and avatar
- Email address
- Wallet address (if set)
- Current role with badge
- Join date
- Role change dropdown

### Promote User to Admin

1. Find the user in the list
2. Click the role dropdown (currently shows their role)
3. Select "🔐 Admin"
4. Role is updated immediately
5. User will see admin features on next login/refresh

### Demote Admin to User

1. Find the admin in the list
2. Click the role dropdown
3. Select "👤 User"
4. Admin privileges are removed immediately

### Search Users

Use the search box to find users by:
- Full name
- Email address

## Role Permissions

### Super Admin Can:
✅ Create and manage own invoices
✅ Manage own clients
✅ View all invoices from all users
✅ Approve/reject any invoice
✅ Export invoices to CSV
✅ Access admin dashboard
✅ **Manage user roles** (unique to super admin)
✅ View all user information
✅ Access user management page

### Admin Can:
✅ Create and manage own invoices
✅ Manage own clients
✅ View all invoices from all users
✅ Approve/reject any invoice
✅ Export invoices to CSV
✅ Access admin dashboard
❌ Cannot manage user roles
❌ Cannot access user management page

### Regular User Can:
✅ Create and manage own invoices
✅ Manage own clients
✅ View only own invoices
✅ Cancel own invoices (draft/pending)
✅ Configure wallet address
❌ Cannot view other users' invoices
❌ Cannot approve/reject invoices
❌ Cannot access admin features
❌ Cannot manage user roles

## Security Features

### Role-Based Access Control (RBAC)
- All routes are protected
- RLS policies enforce data access
- UI elements hidden based on role
- API calls validated server-side

### Super Admin Protection
- Super admin role cannot be changed via UI
- Requires direct database access to modify
- Prevents accidental privilege escalation
- Audit trail in database

### User Role Changes
- Only super admins can change roles
- Changes are logged in database
- Immediate effect (no cache issues)
- Email notifications (if configured)

## Adding More Super Admins

Super admin status can only be granted via database. To add another super admin:

### Option 1: Supabase Dashboard
1. Go to Table Editor → profiles
2. Find the user
3. Change `role` to `super_admin`
4. Save

### Option 2: SQL Query
```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'new-super-admin@example.com';
```

### Option 3: SQL Script
Run the provided script with new user details:
```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'user-uuid-here' 
   OR email = 'user@example.com';
```

## Best Practices

### 1. Limit Super Admins
- Keep the number of super admins minimal (1-3)
- Only trusted individuals should have this role
- Document who has super admin access

### 2. Regular Admins for Operations
- Use regular admin role for day-to-day operations
- Reserve super admin for user management only
- Reduces risk of accidental changes

### 3. Audit User Role Changes
- Regularly review user roles
- Check for unauthorized changes
- Monitor admin activity

### 4. Secure Super Admin Accounts
- Use strong passwords
- Enable 2FA (if available)
- Don't share credentials
- Use separate accounts for different people

## Troubleshooting

### Can't See User Management Page

**Problem:** User Management link not showing in sidebar

**Solutions:**
1. Verify you're logged in as super admin
2. Check role in Settings page (should show "👑 Super Admin")
3. Refresh the page
4. Clear browser cache
5. Check database: `SELECT role FROM profiles WHERE id = auth.uid()`

### Can't Change User Roles

**Problem:** Role dropdown not working or showing error

**Solutions:**
1. Verify you're a super admin
2. Check RLS policies are set up correctly
3. Check browser console for errors
4. Verify Supabase connection
5. Try refreshing the page

### Super Admin Role Not Showing

**Problem:** Still showing as regular admin after database update

**Solutions:**
1. Log out and log back in
2. Clear browser cache
3. Check database directly
4. Verify RLS policies include super_admin
5. Check AuthContext includes isSuperAdmin

### User Role Change Not Taking Effect

**Problem:** User still has old permissions after role change

**Solutions:**
1. User needs to refresh their browser
2. User may need to log out and back in
3. Check database to confirm change was saved
4. Clear application cache

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',  -- 'user', 'admin', or 'super_admin'
  wallet_address TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Role Enum
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
```

### RLS Policies
```sql
-- Super admins can update user roles
CREATE POLICY "Super admins can update user roles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

## API Reference

### Check if User is Super Admin
```javascript
import { useAuth } from '../contexts/AuthContext'

const { isSuperAdmin } = useAuth()

if (isSuperAdmin) {
  // Show super admin features
}
```

### Update User Role
```javascript
const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)
```

### Fetch All Users
```javascript
const { data: users, error } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false })
```

## Monitoring

### Check Super Admin Activity
```sql
-- View all super admins
SELECT id, email, full_name, created_at 
FROM profiles 
WHERE role = 'super_admin';

-- View all admins (including super admins)
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role IN ('admin', 'super_admin')
ORDER BY role DESC, created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role;
```

### Audit Log
Consider adding an audit log table to track role changes:
```sql
CREATE TABLE role_changes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  old_role user_role,
  new_role user_role,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
```

## Support

### Quick Commands

```bash
# Check current user role
SELECT role FROM profiles WHERE email = 'your-email@example.com';

# Make user super admin
UPDATE profiles SET role = 'super_admin' WHERE email = 'user@example.com';

# List all super admins
SELECT * FROM profiles WHERE role = 'super_admin';

# Demote super admin (use carefully!)
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Files Reference
- **User Management Page:** `src/pages/UserManagement.jsx`
- **Auth Context:** `src/contexts/AuthContext.jsx`
- **Layout (Navigation):** `src/components/Layout.jsx`
- **SQL Setup:** `supabase-super-admin.sql`

## FAQ

**Q: Can a super admin demote themselves?**
A: No, super admin roles are protected in the UI. Database access is required.

**Q: How many super admins should we have?**
A: Recommended: 1-3 maximum. Keep it minimal for security.

**Q: Can admins see the user management page?**
A: No, only super admins can access user management.

**Q: What happens if all super admins are locked out?**
A: You can restore access via Supabase dashboard or SQL query.

**Q: Can super admins delete users?**
A: Not currently implemented. Contact support for user deletion.

**Q: Do role changes require user to log out?**
A: Users should refresh their browser. Logout/login ensures clean state.

## Next Steps

1. ✅ Verify super admin access
2. ✅ Test user management features
3. ✅ Promote trusted users to admin
4. 📝 Document your super admins
5. 🔒 Secure super admin accounts
6. 📊 Monitor role changes regularly

---

**Current Super Admin:**
- Email: blockspacetechnologies@gmail.com
- ID: 98365811-902c-4d93-b301-24f07c9359dd

**Status:** ✅ Active and Configured
