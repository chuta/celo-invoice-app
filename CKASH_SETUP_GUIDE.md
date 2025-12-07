# cKASH Integration - Quick Setup Guide

## 🚀 Quick Start

Follow these steps to enable cKASH wallet tracking in your invoice app.

## Step 1: Database Migration

### Option A: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-add-ckash-field.sql`
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. Verify success message appears

### Option B: Supabase CLI

```bash
# If using Supabase CLI
supabase db push
```

## Step 2: Verify Database Update

Run this query in SQL Editor to confirm:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_ckash_wallet';
```

**Expected Result:**
```
column_name      | data_type | column_default
is_ckash_wallet  | boolean   | false
```

## Step 3: Deploy Frontend Changes

The Settings.jsx file has been updated. Deploy your changes:

```bash
# Build the app
npm run build

# Deploy (depends on your hosting)
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
# Or push to your git repository if auto-deploy is enabled
```

## Step 4: Test the Feature

1. **Login to your app**
2. **Navigate to Settings**
3. **Enter a wallet address** (or use existing)
4. **Check the cKASH checkbox**
5. **Click "Save Changes"**
6. **Refresh the page**
7. **Verify checkbox remains checked**

## Step 5: Verify Data Persistence

Run this query to see the saved data:

```sql
SELECT 
  full_name, 
  wallet_address, 
  is_ckash_wallet 
FROM profiles 
WHERE wallet_address IS NOT NULL
LIMIT 5;
```

## ✅ Success Indicators

You'll know it's working when:

- ✅ Checkbox appears below wallet address field
- ✅ Checkbox can be toggled on/off
- ✅ "Using cKASH helps support..." message displays
- ✅ Link to https://ckash.app/ works
- ✅ Setting persists after page reload
- ✅ No console errors
- ✅ Database field updates correctly

## 🎨 What Users Will See

```
Settings Page:

┌─────────────────────────────────────────┐
│ cUSD Wallet Address                     │
│ ┌─────────────────────────────────────┐ │
│ │ 0xe0669d9e0bcd2f073aa83259efb93e... │ │
│ └─────────────────────────────────────┘ │
│ This is where you'll receive payments   │
│                                         │
│ ☑ This is a cKASH wallet address       │
│   Using cKASH helps support             │
│   CeloAfricaDAO's payment               │
│   infrastructure 💚                     │
└─────────────────────────────────────────┘
```

## 📊 Analytics Query (Optional)

Track cKASH adoption:

```sql
-- See cKASH adoption rate
SELECT 
  COUNT(CASE WHEN is_ckash_wallet = TRUE THEN 1 END) as ckash_users,
  COUNT(*) as total_users_with_wallets,
  ROUND(
    COUNT(CASE WHEN is_ckash_wallet = TRUE THEN 1 END) * 100.0 / 
    NULLIF(COUNT(*), 0), 
    2
  ) as adoption_percentage
FROM profiles
WHERE wallet_address IS NOT NULL;
```

## 🐛 Troubleshooting

### Issue: Checkbox doesn't appear

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Verify deployment was successful

### Issue: Changes don't save

**Solution:**
1. Check Supabase logs for errors
2. Verify RLS policies allow profile updates
3. Check browser network tab for failed requests
4. Ensure user is authenticated

### Issue: Database field not found

**Solution:**
1. Re-run the migration SQL
2. Check Supabase logs for migration errors
3. Verify you're connected to correct project
4. Check table permissions

### Issue: Link doesn't work

**Solution:**
1. Verify URL is https://ckash.app/
2. Check for popup blockers
3. Ensure target="_blank" is set

## 🔄 Rollback (If Needed)

If you need to remove the feature:

```sql
-- Remove the column
ALTER TABLE profiles DROP COLUMN IF EXISTS is_ckash_wallet;

-- Remove the index
DROP INDEX IF EXISTS idx_profiles_is_ckash_wallet;
```

Then revert the Settings.jsx changes.

## 📝 Next Steps

After successful setup:

1. **Announce to users** - Let them know about cKASH support
2. **Monitor adoption** - Use analytics queries
3. **Promote cKASH** - Add to onboarding, emails, etc.
4. **Consider incentives** - Reward cKASH users
5. **Share feedback** - Help improve the ecosystem

## 🎯 Success Metrics

Track these metrics:

- Number of cKASH users
- Adoption percentage
- Growth over time
- Invoice volume from cKASH users
- Community engagement

## 📚 Additional Resources

- **cKASH Website:** https://ckash.app/
- **Full Documentation:** See `CKASH_INTEGRATION.md`
- **Celo Docs:** https://docs.celo.org/

## ✨ Feature Complete!

Once all steps are done, your users can:
- Mark their wallets as cKASH wallets
- Support the CeloAfricaDAO ecosystem
- Be identified as community supporters

The feature is live and ready to promote! 🎉
