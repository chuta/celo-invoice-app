-- Fix Payment Requests Display
-- This script ensures payment requests are properly stored and can be displayed

-- 1. Ensure public_payment_requests table exists with correct schema
CREATE TABLE IF NOT EXISTS public_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
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

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_recipient 
  ON public_payment_requests(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_status 
  ON public_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_payer_email 
  ON public_payment_requests(payer_email);
CREATE INDEX IF NOT EXISTS idx_public_payment_requests_created_at 
  ON public_payment_requests(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public_payment_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public_payment_requests;
DROP POLICY IF EXISTS "Anyone can create payment requests" ON public_payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public_payment_requests;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own payment requests"
  ON public_payment_requests FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Anyone can create payment requests"
  ON public_payment_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own payment requests"
  ON public_payment_requests FOR UPDATE
  USING (auth.uid() = recipient_user_id);

-- 6. Migrate payment events from analytics to requests table (if not already there)
-- This handles cases where payments were tracked in analytics but not in requests table
INSERT INTO public_payment_requests (
  recipient_user_id,
  payer_name,
  payer_email,
  amount,
  currency,
  description,
  status,
  payment_link,
  created_at
)
SELECT DISTINCT
  a.user_id as recipient_user_id,
  (a.event_data->>'payer_name')::VARCHAR(200) as payer_name,
  (a.event_data->>'payer_email')::VARCHAR(255) as payer_email,
  (a.event_data->>'amount')::DECIMAL(10, 2) as amount,
  'cUSD' as currency,
  NULL as description,
  'pending' as status,
  (a.event_data->>'username')::VARCHAR(100) as payment_link,
  a.created_at
FROM payment_link_analytics a
WHERE a.event_type = 'payment'
  AND a.event_data->>'payer_email' IS NOT NULL
  AND a.event_data->>'amount' IS NOT NULL
  -- Only insert if not already exists
  AND NOT EXISTS (
    SELECT 1 FROM public_payment_requests pr
    WHERE pr.recipient_user_id = a.user_id
      AND pr.payer_email = (a.event_data->>'payer_email')
      AND pr.amount = (a.event_data->>'amount')::DECIMAL(10, 2)
      AND pr.created_at = a.created_at
  );

-- 7. Create a view for easy querying of payment requests with profile info
CREATE OR REPLACE VIEW payment_requests_with_profile AS
SELECT 
  pr.*,
  p.username,
  p.full_name as recipient_name,
  p.email as recipient_email
FROM public_payment_requests pr
JOIN profiles p ON pr.recipient_user_id = p.id;

-- Grant access to the view
GRANT SELECT ON payment_requests_with_profile TO authenticated;

-- 8. Create function to get payment request stats
CREATE OR REPLACE FUNCTION get_payment_request_stats(user_uuid UUID)
RETURNS TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  completed_requests BIGINT,
  total_amount DECIMAL,
  pending_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_requests,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_requests,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount
  FROM public_payment_requests
  WHERE recipient_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_payment_request_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Payment requests table and policies configured successfully!';
  RAISE NOTICE '✅ Migrated payment events from analytics to requests table';
  RAISE NOTICE '✅ Created helper view and functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Payment requests should now be visible in the UI';
END $$;
