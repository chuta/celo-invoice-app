-- Fix RLS Policies to Include Super Admin
-- Run this in Supabase SQL Editor

-- Drop existing admin policies for invoices
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update all invoices" ON invoices;

-- Drop existing admin policies for clients
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;

-- Drop existing admin policies for invoice_history
DROP POLICY IF EXISTS "Admins can view all invoice history" ON invoice_history;

-- Recreate policies to include super_admin

-- INVOICES POLICIES
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- CLIENTS POLICIES
CREATE POLICY "Admins can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- INVOICE HISTORY POLICIES
CREATE POLICY "Admins can view all invoice history" ON invoice_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('invoices', 'clients', 'invoice_history')
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Super admin RLS policies updated successfully!';
  RAISE NOTICE 'Super admins can now view all invoices, clients, and invoice history.';
END $$;
