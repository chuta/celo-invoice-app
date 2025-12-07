-- Invoice Number Generation Using Sequence Table (Most Reliable)
-- This approach uses a dedicated sequence table to prevent any race conditions
-- Run this in Supabase SQL Editor

-- Step 1: Create a sequence table for invoice numbers
CREATE TABLE IF NOT EXISTS invoice_sequences (
  year_month TEXT PRIMARY KEY,
  last_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sequence table
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Allow system to manage sequences
CREATE POLICY "System can manage sequences" ON invoice_sequences
  FOR ALL USING (true);

-- Step 2: Drop existing functions and trigger
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
DROP FUNCTION IF EXISTS set_invoice_number();
DROP FUNCTION IF EXISTS generate_invoice_number();

-- Step 3: Create new sequence-based generator
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_year_month TEXT;
  v_next_sequence INTEGER;
  v_invoice_num TEXT;
BEGIN
  -- Get current year-month
  v_year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Insert or update the sequence for this month
  -- This is atomic and prevents race conditions
  INSERT INTO invoice_sequences (year_month, last_sequence)
  VALUES (v_year_month, 1)
  ON CONFLICT (year_month)
  DO UPDATE SET 
    last_sequence = invoice_sequences.last_sequence + 1,
    updated_at = NOW()
  RETURNING last_sequence INTO v_next_sequence;
  
  -- Format: 2025-12-00001
  v_invoice_num := v_year_month || '-' || LPAD(v_next_sequence::TEXT, 5, '0');
  
  RETURN v_invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger function
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
CREATE TRIGGER set_invoice_number_trigger 
BEFORE INSERT ON invoices
FOR EACH ROW 
EXECUTE FUNCTION set_invoice_number();

-- Step 6: Initialize sequence for current month based on existing invoices
DO $$
DECLARE
  current_month TEXT;
  max_seq INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get the highest sequence number from existing invoices
  SELECT COALESCE(
    MAX(
      CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
    ),
    0
  ) INTO max_seq
  FROM invoices
  WHERE invoice_number LIKE current_month || '-%';
  
  -- Initialize the sequence table
  INSERT INTO invoice_sequences (year_month, last_sequence)
  VALUES (current_month, max_seq)
  ON CONFLICT (year_month) 
  DO UPDATE SET last_sequence = GREATEST(invoice_sequences.last_sequence, max_seq);
  
  RAISE NOTICE 'Initialized sequence for % with value %', current_month, max_seq;
END $$;

-- Step 7: Test the function
SELECT generate_invoice_number() as test_invoice_number;

-- Step 8: Verify the sequence table
SELECT * FROM invoice_sequences;

-- Step 9: Check for any existing duplicates
SELECT invoice_number, COUNT(*) as count
FROM invoices
GROUP BY invoice_number
HAVING COUNT(*) > 1;
