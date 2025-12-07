# cKASH Wallet Integration

## Overview

Added support for identifying and promoting cKASH wallet addresses in the invoice management system. This feature helps promote CeloAfricaDAO's cKASH payment dApp and increases transaction generation for the ecosystem.

## What is cKASH?

**cKASH** is a CeloAfricaDAO payment dApp project available at [https://ckash.app/](https://ckash.app/)

By encouraging users to use cKASH wallets, we:
- Support the CeloAfricaDAO ecosystem
- Increase transaction volume for cKASH
- Promote Web3 adoption in Africa
- Build community engagement

## Changes Made

### 1. Database Schema Update

**File:** `supabase-add-ckash-field.sql`

Added a new boolean field to the `profiles` table:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_ckash_wallet BOOLEAN DEFAULT FALSE;
```

**Field Details:**
- **Name:** `is_ckash_wallet`
- **Type:** BOOLEAN
- **Default:** FALSE
- **Purpose:** Track whether a user's wallet address is a cKASH wallet

**Additional Features:**
- Index created for analytics queries
- Comment added for documentation
- Existing records updated with default value

### 2. Settings Page Update

**File:** `src/pages/Settings.jsx`

**Added:**
- State management for `isCkashWallet` checkbox
- Checkbox UI component below wallet address field
- Link to cKASH website
- Promotional messaging
- Update profile to include cKASH status

**UI Components:**

1. **Checkbox Input**
   - Styled with Celo green color (#35D07F)
   - Accessible with proper labels
   - Keyboard navigable

2. **Label and Description**
   - Clear indication of purpose
   - Link to cKASH website
   - Promotional message with emoji

3. **Form Submission**
   - Includes `is_ckash_wallet` in profile update
   - Persists to database

## User Interface

### Checkbox Location

The checkbox appears directly below the "cUSD Wallet Address" input field:

```
cUSD Wallet Address
[0x... input field]
This is where you'll receive invoice payments

☑ This is a cKASH wallet address
  Using cKASH helps support CeloAfricaDAO's payment infrastructure 💚
```

### Visual Design

- **Checkbox Color:** Celo green (#35D07F)
- **Link Color:** Celo green with hover effect
- **Text:** Clear, promotional messaging
- **Emoji:** Green heart (💚) for brand consistency

## Implementation Steps

### 1. Database Migration

Run the SQL migration in Supabase:

```bash
# In Supabase SQL Editor, run:
supabase-add-ckash-field.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase-add-ckash-field.sql`
3. Execute the query

### 2. Verify Database Update

Check that the field was added:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_ckash_wallet';
```

### 3. Test the Feature

1. Navigate to Settings page
2. Enter a wallet address
3. Check the "This is a cKASH wallet address" checkbox
4. Click "Save Changes"
5. Verify the setting persists after page reload

## User Flow

### Setting cKASH Wallet

1. User navigates to Settings
2. User enters their cUSD wallet address
3. If using cKASH, user checks the checkbox
4. User clicks "Save Changes"
5. System saves both wallet address and cKASH status

### Benefits for Users

- **Recognition:** Users are identified as cKASH supporters
- **Community:** Part of the CeloAfricaDAO ecosystem
- **Future Features:** May unlock special features or benefits

## Analytics Potential

With the `is_ckash_wallet` field, you can track:

### Usage Statistics

```sql
-- Count of cKASH users
SELECT COUNT(*) as ckash_users
FROM profiles
WHERE is_ckash_wallet = TRUE;

-- Percentage of cKASH adoption
SELECT 
  COUNT(CASE WHEN is_ckash_wallet = TRUE THEN 1 END) * 100.0 / COUNT(*) as ckash_percentage
FROM profiles
WHERE wallet_address IS NOT NULL;
```

### Invoice Analytics

```sql
-- Total invoice amount for cKASH users
SELECT 
  SUM(i.amount) as total_ckash_invoices
FROM invoices i
JOIN profiles p ON i.user_id = p.id
WHERE p.is_ckash_wallet = TRUE
AND i.status = 'approved';
```

### Growth Tracking

```sql
-- cKASH adoption over time
SELECT 
  DATE_TRUNC('month', updated_at) as month,
  COUNT(*) as new_ckash_users
FROM profiles
WHERE is_ckash_wallet = TRUE
GROUP BY month
ORDER BY month;
```

## Future Enhancements

### 1. cKASH Badge

Add a visual badge for cKASH users:

```jsx
{profile?.is_ckash_wallet && (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    💚 cKASH User
  </span>
)}
```

### 2. Dashboard Widget

Show cKASH promotion on dashboard:

```jsx
{!profile?.is_ckash_wallet && profile?.wallet_address && (
  <div className="card bg-gradient-to-r from-[#35D07F] to-[#FBCC5C]">
    <h3>Support CeloAfricaDAO! 💚</h3>
    <p>Consider using cKASH for your payments</p>
    <a href="https://ckash.app/">Learn More</a>
  </div>
)}
```

### 3. Admin Analytics

Add cKASH statistics to admin dashboard:

```jsx
<div className="card">
  <h3>cKASH Adoption</h3>
  <p className="text-3xl font-bold">{ckashPercentage}%</p>
  <p className="text-sm text-gray-600">of users with wallets</p>
</div>
```

### 4. Email Notifications

Include cKASH promotion in emails:

```html
<p>
  💡 Tip: Using cKASH? Mark your wallet in Settings to support 
  CeloAfricaDAO's payment infrastructure!
</p>
```

### 5. Incentives

Consider adding incentives for cKASH users:
- Priority support
- Featured in community
- Special badges or recognition
- Early access to new features

## Marketing Benefits

### Community Building

- Identifies engaged community members
- Creates sense of belonging
- Encourages ecosystem participation

### Data-Driven Decisions

- Track cKASH adoption rates
- Measure marketing campaign effectiveness
- Identify power users

### Cross-Promotion

- Promote cKASH to invoice users
- Promote invoice app to cKASH users
- Build integrated ecosystem

## Technical Notes

### Database Field

```sql
is_ckash_wallet BOOLEAN DEFAULT FALSE
```

- Nullable: No (has default)
- Indexed: Yes (for analytics)
- Default: FALSE

### Form State

```javascript
const [isCkashWallet, setIsCkashWallet] = useState(
  profile?.is_ckash_wallet || false
)
```

### Profile Update

```javascript
await updateProfile({
  full_name: fullName,
  wallet_address: walletAddress,
  is_ckash_wallet: isCkashWallet,
})
```

## Testing Checklist

### Functionality
- [ ] Checkbox appears below wallet address field
- [ ] Checkbox can be checked/unchecked
- [ ] Link to cKASH website works
- [ ] Form submission includes cKASH status
- [ ] Setting persists after page reload
- [ ] Works for new users
- [ ] Works for existing users

### UI/UX
- [ ] Checkbox is properly aligned
- [ ] Text is readable
- [ ] Link is clearly visible
- [ ] Hover states work
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)

### Database
- [ ] Field added to profiles table
- [ ] Default value is FALSE
- [ ] Index created successfully
- [ ] Existing records updated
- [ ] No errors in Supabase logs

## Troubleshooting

### Checkbox Not Saving

1. Check browser console for errors
2. Verify database field exists
3. Check RLS policies allow updates
4. Verify updateProfile function includes field

### Field Not Appearing

1. Run database migration
2. Check Supabase logs
3. Verify table structure
4. Refresh application

### Link Not Working

1. Verify URL is correct: https://ckash.app/
2. Check for typos
3. Ensure target="_blank" is set

## Files Modified

1. `src/pages/Settings.jsx` - Added checkbox UI and logic
2. `supabase-add-ckash-field.sql` - Database migration (NEW)
3. `CKASH_INTEGRATION.md` - Documentation (NEW)

## Migration Instructions

### Step 1: Backup Database

```sql
-- Create backup of profiles table
CREATE TABLE profiles_backup AS 
SELECT * FROM profiles;
```

### Step 2: Run Migration

Execute `supabase-add-ckash-field.sql` in Supabase SQL Editor

### Step 3: Verify Migration

```sql
-- Check field exists
SELECT * FROM profiles LIMIT 1;

-- Check index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_is_ckash_wallet';
```

### Step 4: Deploy Frontend

Deploy updated Settings.jsx to production

### Step 5: Test

Test the feature in production environment

## Support

For questions or issues:
- Check Supabase logs
- Review browser console
- Test in incognito mode
- Verify database permissions

## Links

- **cKASH Website:** https://ckash.app/
- **CeloAfricaDAO:** https://celoafricadao.org/
- **Celo Documentation:** https://docs.celo.org/

## Impact

This feature helps:
- ✅ Promote CeloAfricaDAO ecosystem
- ✅ Increase cKASH transaction volume
- ✅ Build community engagement
- ✅ Track ecosystem adoption
- ✅ Enable future incentive programs
- ✅ Support Web3 adoption in Africa
