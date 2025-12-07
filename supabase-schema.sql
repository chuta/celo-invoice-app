-- CELOAfricaDAO Invoice Management System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'approved', 'paid', 'cancelled', 'voided', 'rejected');
CREATE TYPE invoice_type AS ENUM ('one_time', 'recurring');
CREATE TYPE recurrence_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_type invoice_type DEFAULT 'one_time',
  status invoice_status DEFAULT 'draft',
  
  -- Financial details
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'cUSD',
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Line items (stored as JSONB)
  line_items JSONB NOT NULL DEFAULT '[]',
  
  -- Notes and metadata
  memo TEXT,
  notes TEXT,
  
  -- Recurring invoice settings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency recurrence_frequency,
  recurrence_start_date DATE,
  recurrence_end_date DATE,
  recurrence_count INTEGER,
  parent_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice history/audit log
CREATE TABLE invoice_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status invoice_status,
  new_status invoice_status,
  performed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_is_recurring ON invoices(is_recurring);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_invoice_history_invoice_id ON invoice_history(invoice_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft invoices" ON invoices
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'draft'
  );

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

-- Invoice history policies
CREATE POLICY "Users can view own invoice history" ON invoice_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_history.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all invoice history" ON invoice_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert invoice history" ON invoice_history
  FOR INSERT WITH CHECK (true);

-- Functions

-- Function to generate invoice number with year-month prefix
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
  max_num INTEGER;
BEGIN
  -- Get current year-month (e.g., "2025-12")
  year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get the maximum sequence number for this month
  -- Use COALESCE to handle case when no invoices exist yet
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM LENGTH(year_month) + 2) 
        AS INTEGER
      )
    ), 
    0
  ) INTO max_num
  FROM invoices
  WHERE invoice_number LIKE year_month || '-%';
  
  -- Increment the sequence
  sequence_num := max_num + 1;
  
  -- Format: 2025-12-00001
  invoice_num := year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  -- Check if this number already exists (safety check)
  WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = invoice_num) LOOP
    sequence_num := sequence_num + 1;
    invoice_num := year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');
  END LOOP;
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    -- Lock the table to prevent race conditions
    LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE;
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- Trigger to log invoice status changes
CREATE OR REPLACE FUNCTION log_invoice_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO invoice_history (invoice_id, action, old_status, new_status, performed_by, notes)
    VALUES (
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      auth.uid(),
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_invoice_status_change_trigger AFTER UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION log_invoice_status_change();

-- Function to create recurring invoices (to be called by a cron job or edge function)
CREATE OR REPLACE FUNCTION generate_recurring_invoices()
RETURNS void AS $$
DECLARE
  recurring_invoice RECORD;
  new_due_date DATE;
BEGIN
  FOR recurring_invoice IN
    SELECT * FROM invoices
    WHERE is_recurring = TRUE
    AND status = 'approved'
    AND (recurrence_end_date IS NULL OR recurrence_end_date >= CURRENT_DATE)
  LOOP
    -- Calculate next due date based on frequency
    CASE recurring_invoice.recurrence_frequency
      WHEN 'weekly' THEN
        new_due_date := recurring_invoice.due_date + INTERVAL '1 week';
      WHEN 'monthly' THEN
        new_due_date := recurring_invoice.due_date + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        new_due_date := recurring_invoice.due_date + INTERVAL '3 months';
      WHEN 'yearly' THEN
        new_due_date := recurring_invoice.due_date + INTERVAL '1 year';
    END CASE;
    
    -- Only create if due date is today or in the past
    IF new_due_date <= CURRENT_DATE THEN
      INSERT INTO invoices (
        user_id,
        client_id,
        invoice_type,
        status,
        amount,
        currency,
        issue_date,
        due_date,
        line_items,
        memo,
        notes,
        is_recurring,
        recurrence_frequency,
        parent_invoice_id
      ) VALUES (
        recurring_invoice.user_id,
        recurring_invoice.client_id,
        'one_time',
        'pending',
        recurring_invoice.amount,
        recurring_invoice.currency,
        CURRENT_DATE,
        new_due_date,
        recurring_invoice.line_items,
        recurring_invoice.memo,
        'Auto-generated from recurring invoice',
        FALSE,
        NULL,
        recurring_invoice.id
      );
      
      -- Update the parent recurring invoice's due date
      UPDATE invoices
      SET due_date = new_due_date
      WHERE id = recurring_invoice.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (you'll need to update this with actual user ID after signup)
-- This is just a placeholder - you'll set the first user as admin manually
