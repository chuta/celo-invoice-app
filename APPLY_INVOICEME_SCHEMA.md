# Apply InvoiceMe Database Schema - Quick Guide

## ⚠️ Important: Database Schema Not Applied Yet

The payment link feature requires database changes that haven't been applied yet. This is why you're seeing "Payment Link Not Found" error.

## 🚀 Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/sql
2. Click **"New Query"**

### Step 2: Copy and Run the Schema

Copy the entire contents of `supabase-invoiceme-schema.sql` and paste it into the SQL editor, then click **Run**.

**Or use this direct SQL:**

```sql
-- InvoiceMe Feature - Database Schema
-- Add personalized payment link functionality

-- 1. Add username and payment link fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS tagline VARCHAR(200),
ADD COLUMN IF NOT EXISTS payment_link_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_link_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_link_payments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Add constraint for username format (lowercase alphanumeric, hyphens, underscores)
ALTER TABLE profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{3,50}$');

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_payment_link_enabled ON profiles(payment_link_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_public_profile ON profiles(public_profile);

-- 2. Create payment_link_analytics table
CREATE TABLE IF NOT EXISTS payment_link_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_payment_link_analytics_user_id ON payment_link_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_link_analytics_event_type ON payment_link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_link_analytics_created_at ON payment_link_analytics(created_at);

-- 3. Create public_payment_requests table
CREATE TABLE IF NOT EXISTS public_payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payer_name VARCHAR(200) NOT NULL,
  payer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'cUSD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_link VARCHAR(100),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for public payment requests
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_recipient ON public_payment_requests(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_status ON public_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_payer_email ON public_payment_requests(payer_email);

-- 4. Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE payment_link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_payment_requests ENABLE ROW LEVEL SECURITY;

-- Payment Link Analytics Policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON payment_link_analytics;
CREATE POLICY "Users can view their own analytics"
  ON payment_link_analytics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert analytics" ON payment_link_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON payment_link_analytics FOR INSERT
  WITH CHECK (true);

-- Public Payment Requests Policies
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public_payment_requests;
CREATE POLICY "Users can view their own payment requests"
  ON public_payment_requests FOR SELECT
  USING (auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Anyone can create payment requests" ON public_payment_requests;
CREATE POLICY "Anyone can create payment requests"
  ON public_payment_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own payment requests" ON public_payment_requests;
CREATE POLICY "Users can update their own payment requests"
  ON public_payment_requests FOR UPDATE
  USING (auth.uid() = recipient_user_id);

-- 5. Create function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE username = LOWER(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get public profile by username
CREATE OR REPLACE FUNCTION get_public_profile(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  full_name VARCHAR(200),
  email VARCHAR(255),
  wallet_address VARCHAR(100),
  bio TEXT,
  tagline VARCHAR(200),
  profile_image_url TEXT,
  social_links JSONB,
  payment_link_enabled BOOLEAN,
  payment_link_views INTEGER,
  payment_link_payments INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.email,
    p.wallet_address,
    p.bio,
    p.tagline,
    p.profile_image_url,
    p.social_links,
    p.payment_link_enabled,
    p.payment_link_views,
    p.payment_link_payments
  FROM profiles p
  WHERE p.username = LOWER(username_param)
    AND p.public_profile = true
    AND p.payment_link_enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to increment payment link views
CREATE OR REPLACE FUNCTION increment_payment_link_view(username_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET payment_link_views = payment_link_views + 1
  WHERE username = LOWER(username_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to increment payment link payments
CREATE OR REPLACE FUNCTION increment_payment_link_payment(username_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET payment_link_payments = payment_link_payments + 1
  WHERE username = LOWER(username_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_username_available TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_payment_link_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_payment_link_payment TO anon, authenticated;

-- 10. Create view for payment link analytics summary
CREATE OR REPLACE VIEW payment_link_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE event_type = 'payment') as total_payments,
  COUNT(*) FILTER (WHERE event_type = 'share') as total_shares,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_activity
FROM payment_link_analytics
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON payment_link_stats TO authenticated;
```

### Step 3: Verify the Changes

Run this query to verify:

```sql
-- Check if username column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'username';

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_link_analytics', 'public_payment_requests');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%username%' OR routine_name LIKE '%payment_link%';
```

Expected results:
- ✅ username column in profiles table
- ✅ payment_link_analytics table
- ✅ public_payment_requests table
- ✅ 4 functions created

### Step 4: Test Your Payment Link

1. Go back to the app
2. Navigate to **Payment Link** settings
3. Set your username (e.g., "chuta")
4. Enable "Make my profile public"
5. Enable "Enable payment link"
6. Click "Save Settings"
7. Visit: `https://celo-invoice.netlify.app/pay/chuta`

It should now work! 🎉

## 🐛 Troubleshooting

### Still seeing "Payment Link Not Found"?

**Check 1: Username is set**
```sql
SELECT id, username, public_profile, payment_link_enabled 
FROM profiles 
WHERE username = 'chuta';
```

**Check 2: Public profile is enabled**
- Ensure `public_profile = true`
- Ensure `payment_link_enabled = true`

**Check 3: Function works**
```sql
SELECT * FROM get_public_profile('chuta');
```

Should return your profile data.

### Error: "relation does not exist"

The schema hasn't been applied. Go back to Step 2 and run the SQL.

### Error: "function does not exist"

The functions weren't created. Run the SQL from Step 2 again.

### Username not saving

Check browser console for errors. Likely the constraint or function is missing.

## 📝 What This Schema Does

### New Columns in `profiles` table:
- `username` - Unique username for payment link
- `public_profile` - Whether profile is public
- `bio` - User bio/description
- `tagline` - Short tagline
- `payment_link_enabled` - Enable/disable payment link
- `payment_link_views` - View counter
- `payment_link_payments` - Payment counter
- `profile_image_url` - Profile photo URL
- `social_links` - JSON with social media links

### New Tables:
- `payment_link_analytics` - Track views, payments, shares
- `public_payment_requests` - Store payment requests from public page

### New Functions:
- `check_username_available()` - Check if username is taken
- `get_public_profile()` - Get public profile by username
- `increment_payment_link_view()` - Increment view counter
- `increment_payment_link_payment()` - Increment payment counter

### Security:
- RLS policies ensure users can only see their own data
- Public can view public profiles
- Public can create payment requests
- Usernames are validated (3-50 chars, lowercase, alphanumeric)

## ✅ Success Indicators

After applying the schema, you should be able to:
- ✅ Set a username in Payment Link settings
- ✅ See "Available!" when checking username
- ✅ Save settings without errors
- ✅ Visit `/pay/your-username` and see your profile
- ✅ Create payment requests from public page
- ✅ See view counts increase

## 🆘 Need Help?

If you're still having issues:
1. Check Supabase logs for errors
2. Verify all SQL ran successfully
3. Check browser console for errors
4. Ensure you're logged in when setting username
5. Try a different username

---

**Status:** ⏳ Waiting for Schema Application
**Time Required:** 5 minutes
**Difficulty:** Easy (copy & paste SQL)
**Next Step:** Run the SQL in Supabase Dashboard
