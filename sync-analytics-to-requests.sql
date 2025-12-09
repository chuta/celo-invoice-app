-- Sync Payment Analytics to Requests Table
-- Run this if you have payment events in analytics that aren't showing up as requests

-- This will create payment requests from analytics events
-- Only creates requests that don't already exist

WITH payment_events AS (
  SELECT 
    a.id as analytics_id,
    a.user_id as recipient_user_id,
    (a.event_data->>'payer_name')::VARCHAR(200) as payer_name,
    (a.event_data->>'payer_email')::VARCHAR(255) as payer_email,
    (a.event_data->>'amount')::DECIMAL(10, 2) as amount,
    (a.event_data->>'username')::VARCHAR(100) as payment_link,
    a.created_at
  FROM payment_link_analytics a
  WHERE a.event_type = 'payment'
    AND a.event_data->>'payer_email' IS NOT NULL
    AND a.event_data->>'payer_name' IS NOT NULL
    AND a.event_data->>'amount' IS NOT NULL
)
INSERT INTO public_payment_requests (
  recipient_user_id,
  payer_name,
  payer_email,
  amount,
  currency,
  status,
  payment_link,
  created_at
)
SELECT 
  pe.recipient_user_id,
  pe.payer_name,
  pe.payer_email,
  pe.amount,
  'cUSD' as currency,
  'pending' as status,
  pe.payment_link,
  pe.created_at
FROM payment_events pe
WHERE NOT EXISTS (
  SELECT 1 FROM public_payment_requests pr
  WHERE pr.recipient_user_id = pe.recipient_user_id
    AND pr.payer_email = pe.payer_email
    AND pr.amount = pe.amount
    AND ABS(EXTRACT(EPOCH FROM (pr.created_at - pe.created_at))) < 5
)
RETURNING *;

-- Show summary
SELECT 
  'Total payment events in analytics' as metric,
  COUNT(*) as count
FROM payment_link_analytics
WHERE event_type = 'payment'
UNION ALL
SELECT 
  'Total payment requests in table' as metric,
  COUNT(*) as count
FROM public_payment_requests
UNION ALL
SELECT 
  'Pending requests' as metric,
  COUNT(*) as count
FROM public_payment_requests
WHERE status = 'pending';
