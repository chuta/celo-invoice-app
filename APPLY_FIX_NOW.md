# Apply Invoice Number Fix - Quick Guide

## The Issue

Variable naming conflict causing: `column reference "year_month" is ambiguous`

## The Solution

Use the **FINAL CORRECTED VERSION** with proper variable naming.

## How to Apply (3 Steps)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Run the Fix

1. Open the file: `supabase-fix-invoice-number-final.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button

### Step 3: Verify Success

You should see:
```
✅ Initialized sequence for 2025-12 with value X
✅ Invoice number generation fixed successfully!
✅ You can now create invoices without duplicate errors.
```

## What This Does

1. ✅ Creates `invoice_sequences` table
2. ✅ Drops old problematic functions
3. ✅ Creates new function with fixed variable names (`v_year_month` instead of `year_month`)
4. ✅ Initializes sequences from existing invoices
5. ✅ Tests the function
6. ✅ Shows success message

## Test It

After applying the fix:

1. **Create an invoice** as any user
2. Should succeed without errors ✅
3. **Create another invoice** from different user
4. Should also succeed with next sequential number ✅

## What Changed

### Before (Broken):
```sql
DECLARE
  year_month TEXT;  -- ❌ Conflicts with column name
```

### After (Fixed):
```sql
DECLARE
  v_year_month TEXT;  -- ✅ No conflict (v_ prefix)
```

## Verify It's Working

```sql
-- Check the sequence table
SELECT * FROM invoice_sequences;

-- Should show:
-- year_month | last_sequence | created_at | updated_at
-- 2025-12    | 5             | ...        | ...

-- Create a test invoice (will auto-generate number)
-- Then check:
SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1;
```

## If You Still Get Errors

1. **Make sure you ran the FINAL version:**
   - File: `supabase-fix-invoice-number-final.sql`
   - NOT the old `supabase-fix-invoice-number-sequence.sql`

2. **Check if table was created:**
   ```sql
   SELECT * FROM invoice_sequences;
   ```

3. **Check if function exists:**
   ```sql
   SELECT generate_invoice_number();
   ```

4. **Check for existing duplicates:**
   ```sql
   SELECT invoice_number, COUNT(*) 
   FROM invoices 
   GROUP BY invoice_number 
   HAVING COUNT(*) > 1;
   ```

## Fix Existing Duplicates (If Any)

If you have duplicates, fix them first:

```sql
-- Find duplicates
SELECT invoice_number, array_agg(id) as ids
FROM invoices
GROUP BY invoice_number
HAVING COUNT(*) > 1;

-- For each duplicate, update one:
UPDATE invoices 
SET invoice_number = '2025-12-XXXXX'  -- Use next available
WHERE id = 'duplicate-id-here';
```

## Summary

✅ **File to use:** `supabase-fix-invoice-number-final.sql`
✅ **What it fixes:** Variable naming conflict
✅ **Result:** No more duplicate invoice numbers
✅ **Time to apply:** 30 seconds

## Quick Commands

```bash
# 1. Copy this file:
supabase-fix-invoice-number-final.sql

# 2. Paste in Supabase SQL Editor

# 3. Click "Run"

# 4. Done! ✅
```

---

**After applying, test by creating invoices from multiple users!**
