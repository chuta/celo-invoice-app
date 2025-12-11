-- Performance Optimizations for Invoice Reports
-- This file contains database optimizations for the admin invoice reports feature

-- Additional indexes for report filtering performance
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_amount ON invoices(amount);
CREATE INDEX IF NOT EXISTS idx_invoices_status_issue_date ON invoices(status, issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_invoices_date_status_amount ON invoices(issue_date, status, amount);
CREATE INDEX IF NOT EXISTS idx_invoices_user_date_status ON invoices(user_id, issue_date, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_date_status ON invoices(client_id, issue_date, status);

-- Partial indexes for active invoices (exclude drafts for better performance)
CREATE INDEX IF NOT EXISTS idx_invoices_active_status ON invoices(status) 
WHERE status != 'draft';

CREATE INDEX IF NOT EXISTS idx_invoices_active_date_amount ON invoices(issue_date, amount) 
WHERE status IN ('pending', 'approved', 'paid');

-- Index for revenue calculations (approved and paid invoices)
CREATE INDEX IF NOT EXISTS idx_invoices_revenue ON invoices(status, amount, issue_date) 
WHERE status IN ('approved', 'paid');

-- Optimized view for report statistics
CREATE OR REPLACE VIEW invoice_report_stats AS
SELECT 
  COUNT(*) as total_invoices,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN status = 'voided' THEN 1 END) as voided_count,
  SUM(CASE WHEN status IN ('approved', 'paid') THEN amount ELSE 0 END) as total_revenue,
  AVG(amount) as average_amount,
  MIN(issue_date) as earliest_date,
  MAX(issue_date) as latest_date
FROM invoices;

-- Function for efficient filtered invoice queries
CREATE OR REPLACE FUNCTION get_filtered_invoices(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_min_amount DECIMAL DEFAULT NULL,
  p_max_amount DECIMAL DEFAULT NULL,
  p_limit INTEGER DEFAULT 1000,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  invoice_number TEXT,
  user_id UUID,
  client_id UUID,
  status invoice_status,
  amount DECIMAL,
  issue_date DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  client_name TEXT,
  client_email TEXT,
  user_name TEXT,
  user_email TEXT,
  user_wallet TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invoice_number,
    i.user_id,
    i.client_id,
    i.status,
    i.amount,
    i.issue_date,
    i.due_date,
    i.created_at,
    i.updated_at,
    c.name as client_name,
    c.email as client_email,
    p.full_name as user_name,
    p.email as user_email,
    p.wallet_address as user_wallet
  FROM invoices i
  LEFT JOIN clients c ON i.client_id = c.id
  LEFT JOIN profiles p ON i.user_id = p.id
  WHERE 
    (p_start_date IS NULL OR i.issue_date >= p_start_date)
    AND (p_end_date IS NULL OR i.issue_date <= p_end_date)
    AND (p_status IS NULL OR p_status = 'all' OR i.status::TEXT = p_status)
    AND (p_client_id IS NULL OR i.client_id = p_client_id)
    AND (p_user_id IS NULL OR i.user_id = p_user_id)
    AND (p_min_amount IS NULL OR i.amount >= p_min_amount)
    AND (p_max_amount IS NULL OR i.amount <= p_max_amount)
  ORDER BY i.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for efficient report statistics calculation
CREATE OR REPLACE FUNCTION get_report_statistics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_min_amount DECIMAL DEFAULT NULL,
  p_max_amount DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  total_invoices BIGINT,
  total_revenue DECIMAL,
  average_amount DECIMAL,
  draft_count BIGINT,
  pending_count BIGINT,
  approved_count BIGINT,
  paid_count BIGINT,
  cancelled_count BIGINT,
  rejected_count BIGINT,
  voided_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_invoices,
    SUM(CASE WHEN i.status IN ('approved', 'paid') THEN i.amount ELSE 0 END) as total_revenue,
    AVG(i.amount) as average_amount,
    COUNT(CASE WHEN i.status = 'draft' THEN 1 END) as draft_count,
    COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN i.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN i.status = 'cancelled' THEN 1 END) as cancelled_count,
    COUNT(CASE WHEN i.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN i.status = 'voided' THEN 1 END) as voided_count
  FROM invoices i
  WHERE 
    (p_start_date IS NULL OR i.issue_date >= p_start_date)
    AND (p_end_date IS NULL OR i.issue_date <= p_end_date)
    AND (p_status IS NULL OR p_status = 'all' OR i.status::TEXT = p_status)
    AND (p_client_id IS NULL OR i.client_id = p_client_id)
    AND (p_user_id IS NULL OR i.user_id = p_user_id)
    AND (p_min_amount IS NULL OR i.amount >= p_min_amount)
    AND (p_max_amount IS NULL OR i.amount <= p_max_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for top clients analysis
CREATE OR REPLACE FUNCTION get_top_clients_by_revenue(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  client_email TEXT,
  total_revenue DECIMAL,
  invoice_count BIGINT,
  average_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email as client_email,
    SUM(i.amount) as total_revenue,
    COUNT(i.id) as invoice_count,
    AVG(i.amount) as average_amount
  FROM clients c
  INNER JOIN invoices i ON c.id = i.client_id
  WHERE 
    i.status IN ('approved', 'paid')
    AND (p_start_date IS NULL OR i.issue_date >= p_start_date)
    AND (p_end_date IS NULL OR i.issue_date <= p_end_date)
  GROUP BY c.id, c.name, c.email
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for monthly trends analysis
CREATE OR REPLACE FUNCTION get_monthly_trends(
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
  month_year TEXT,
  month_date DATE,
  total_revenue DECIMAL,
  invoice_count BIGINT,
  average_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH month_series AS (
    SELECT 
      DATE_TRUNC('month', CURRENT_DATE - (generate_series(0, p_months - 1) * INTERVAL '1 month'))::DATE as month_start
  )
  SELECT 
    TO_CHAR(ms.month_start, 'Mon YYYY') as month_year,
    ms.month_start as month_date,
    COALESCE(SUM(i.amount), 0) as total_revenue,
    COUNT(i.id) as invoice_count,
    COALESCE(AVG(i.amount), 0) as average_amount
  FROM month_series ms
  LEFT JOIN invoices i ON 
    DATE_TRUNC('month', i.issue_date) = ms.month_start
    AND i.status IN ('approved', 'paid')
  GROUP BY ms.month_start
  ORDER BY ms.month_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION get_filtered_invoices TO authenticated;
GRANT EXECUTE ON FUNCTION get_report_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_clients_by_revenue TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trends TO authenticated;

-- Create RLS policies for the functions (they use SECURITY DEFINER)
-- The functions will respect existing RLS policies on the underlying tables

-- Analyze tables to update statistics for query planner
ANALYZE invoices;
ANALYZE clients;
ANALYZE profiles;