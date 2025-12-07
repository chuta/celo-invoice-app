-- Fix Invoice Number Generation to Prevent Duplicates
-- Run this in Supabase SQL Editor

-- Drop the old function and trigger
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
DROP FUNCTION IF EXISTS set_invoice_number();
DROP FUNCTION IF EXISTS generate_invoice_number();

-- Create a sequence-based invoice number generator
-- This prevents race conditions and ensures unique numbers

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

-- Recreate the trigger function with better locking
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

-- Recreate the trigger
CREATE TRIGGER set_invoice_number_trigger 
BEFORE INSERT ON invoices
FOR EACH ROW 
EXECUTE FUNCTION set_invoice_number();

-- Test the function
SELECT generate_invoice_number();
