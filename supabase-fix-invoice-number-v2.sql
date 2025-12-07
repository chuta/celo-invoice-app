-- Fixed Invoice Number Generation - Version 2
-- This version uses a more reliable approach with proper parsing
-- Run this in Supabase SQL Editor

-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
DROP FUNCTION IF EXISTS set_invoice_number();
DROP FUNCTION IF EXISTS generate_invoice_number();

-- Create improved invoice number generator
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
  max_sequence INTEGER;
BEGIN
  -- Get current year-month (e.g., "2025-12")
  year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get the maximum sequence number for this month
  -- Extract just the numeric part after the last dash
  SELECT COALESCE(
    MAX(
      CAST(
        SPLIT_PART(invoice_number, '-', 3) AS INTEGER
      )
    ),
    0
  ) INTO max_sequence
  FROM invoices
  WHERE invoice_number LIKE year_month || '-%';
  
  -- Increment the sequence
  sequence_num := max_sequence + 1;
  
  -- Format: 2025-12-00001
  invoice_num := year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function with proper locking
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    -- Use advisory lock to prevent race conditions
    -- Lock ID is based on current month to allow parallel processing across months
    PERFORM pg_advisory_xact_lock(
      hashtext(TO_CHAR(NOW(), 'YYYY-MM'))
    );
    
    -- Generate the invoice number
    new_number := generate_invoice_number();
    
    -- Safety check: ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = new_number) AND attempt < max_attempts LOOP
      -- If duplicate found, increment and try again
      new_number := TO_CHAR(NOW(), 'YYYY-MM') || '-' || 
                    LPAD(
                      (CAST(SPLIT_PART(new_number, '-', 3) AS INTEGER) + 1)::TEXT,
                      5,
                      '0'
                    );
      attempt := attempt + 1;
    END LOOP;
    
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique invoice number after % attempts', max_attempts;
    END IF;
    
    NEW.invoice_number := new_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_invoice_number_trigger 
BEFORE INSERT ON invoices
FOR EACH ROW 
EXECUTE FUNCTION set_invoice_number();

-- Test the function
SELECT generate_invoice_number() as test_invoice_number;

-- Verify no duplicates exist
SELECT invoice_number, COUNT(*) as count
FROM invoices
GROUP BY invoice_number
HAVING COUNT(*) > 1;
