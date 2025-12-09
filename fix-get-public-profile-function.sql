-- Fix get_public_profile function - Type mismatch error
-- Error: "Returned type text does not match expected type character varying"

-- Drop the old function
DROP FUNCTION IF EXISTS get_public_profile(TEXT);

-- Recreate with correct return types matching the actual column types
CREATE OR REPLACE FUNCTION get_public_profile(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  email TEXT,
  wallet_address TEXT,
  bio TEXT,
  tagline TEXT,
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
    p.username::TEXT,
    p.full_name::TEXT,
    p.email::TEXT,
    p.wallet_address::TEXT,
    p.bio,
    p.tagline::TEXT,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_public_profile TO anon, authenticated;

-- Test the function
SELECT * FROM get_public_profile('chuta');
