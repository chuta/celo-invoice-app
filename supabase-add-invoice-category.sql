-- Add invoice_category column to invoices table
-- This allows categorizing invoices for better organization and filtering

-- Add the invoice_category column
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS invoice_category TEXT;

-- Add a check constraint to ensure only valid categories are used
ALTER TABLE invoices
ADD CONSTRAINT invoice_category_check 
CHECK (invoice_category IN (
  'judges_mentors',
  'hackerdao_winners',
  'hackathon_winners',
  'incubation_winners',
  'dao_contributor_allowance',
  'monthly_events'
));

-- Add a comment to document the column
COMMENT ON COLUMN invoices.invoice_category IS 'Category of the invoice: judges_mentors, hackerdao_winners, hackathon_winners, incubation_winners, dao_contributor_allowance, monthly_events';

-- Create an index for better query performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_invoices_category ON invoices(invoice_category);

-- Update existing invoices to have a default category (optional - you can skip this if you want them to remain NULL)
-- UPDATE invoices SET invoice_category = 'dao_contributor_allowance' WHERE invoice_category IS NULL;
