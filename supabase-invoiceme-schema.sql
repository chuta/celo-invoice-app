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
  event_type VARCHAR(50) NOT NULL, -- 'view', 'payment', 'share'
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

-- 3. Create public_payment_requests table (for payments via payment link)
CREATE TABLE IF NOT EXISTS public_payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payer_name VARCHAR(200) NOT NULL,
  payer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'cUSD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
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
CREATE POLICY "Users can view their own analytics"
  ON payment_link_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics"
  ON payment_link_analytics FOR INSERT
  WITH CHECK (true);

-- Public Payment Requests Policies
CREATE POLICY "Users can view their own payment requests"
  ON public_payment_requests FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Anyone can create payment requests"
  ON public_payment_requests FOR INSERT
  WITH CHECK (true);

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'InvoiceMe schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Users can now set their username in Settings';
  RAISE NOTICE '2. Public payment pages will be available at /pay/:username';
  RAISE NOTICE '3. Analytics will track views, payments, and shares';
END $$;
