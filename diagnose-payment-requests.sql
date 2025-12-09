-- Diagnostic script to check payment requests setup

-- 1. Check if public_payment_requests table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'public_payment_requests'
) as table_exists;

-- 2. Check payment_link_analytics for payment events
SELECT 
  id,
  user_id,
  event_type,
  event_data,
  created_at
FROM payment_link_analytics
WHERE event_type = 'payment'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check public_payment_requests table (if it exists)
SELECT 
  id,
  recipient_user_id,
  payer_name,
  payer_email,
  amount,
  status,
  created_at
FROM public_payment_requests
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check RLS policies on public_payment_requests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'public_payment_requests';
