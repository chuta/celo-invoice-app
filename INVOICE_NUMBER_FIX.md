# Invoice Number Duplicate Fix

## Problem

When multiple users create invoices simultaneously, they can receive duplicate invoice numbers, causing a database constraint violation error:

```
duplicate key value violates unique constraint "invoices_invoice_number_key"
```

## Root Cause

The original `generate_invoice_number()` function used `COUNT(*) + 1` which has a race condition:

1. User A creates invoice → COUNT returns 5 → generates 2025-12-00006
2. User B creates invoice (at same time) → COUNT returns 5 → generates 2025-12-00006
3. Both try to insert → Duplicate key error!

## Solution

The fix uses `MAX()` instead of `COUNT()` and adds table locking to prevent race conditions:

1. Gets the maximum existing sequence number
2. Increments it by 1
3. Locks the table during generation
4. Includes safety check for duplicates

## How to Apply the Fix

### Option 1: Run the Fix Script (Recommended)

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Open the file `supabase-fix-invoice-number.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click "Run"

### Option 2: Manual Steps

Run these commands in Supabase SQL Editor:

```sql
-- 1. Drop old trigger and functions
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
DROP FUNCTION IF EXISTS set_invoice_number();
DROP FUNCTION IF EXISTS generate_invoice_number();

-- 2. Create new function (see supabase-fix-invoice-number.sql for full code)
-- Copy the CREATE OR REPLACE FUNCTION generate_invoice_number() from the fix file

-- 3. Create new trigger function
-- Copy the CREATE OR REPLACE FUNCTION set_invoice_number() from the fix file

-- 4. Recreate trigger
CREATE TRIGGER set_invoice_number_trigger 
BEFORE INSERT ON invoices
FOR EACH ROW 
EXECUTE FUNCTION set_invoice_number();
```

## Verification

After applying the fix, test it:

### Test 1: Single Invoice
1. Create an invoice as any user
2. Should succeed without errors
3. Check invoice number is sequential

### Test 2: Multiple Users
1. Have 2+ users create invoices at the same time
2. All should succeed
3. Invoice numbers should be unique and sequential

### Test 3: Check Sequence
```sql
-- View all invoice numbers for current month
SELECT invoice_number, created_at 
FROM invoices 
WHERE invoice_number LIKE TO_CHAR(NOW(), 'YYYY-MM') || '-%'
ORDER BY invoice_number;
```

Should show:
```
2025-12-00001
2025-12-00002
2025-12-00003
...
```

## What Changed

### Before (Problematic)
```sql
-- Used COUNT which can return same value for concurrent requests
SELECT COUNT(*) + 1 INTO sequence_num
FROM invoices
WHERE invoice_number LIKE year_month || '%';
```

### After (Fixed)
```sql
-- Uses MAX to get highest number, then increments
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

sequence_num := max_num + 1;

-- Plus table locking to prevent race conditions
LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE;
```

## Additional Safety Features

### 1. Duplicate Check Loop
```sql
WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = invoice_num) LOOP
  sequence_num := sequence_num + 1;
  invoice_num := year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');
END LOOP;
```

If somehow a duplicate is generated, it will increment until finding a unique number.

### 2. Table Locking
```sql
LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE;
```

Prevents concurrent inserts from interfering with each other.

### 3. COALESCE for Empty Tables
```sql
COALESCE(MAX(...), 0)
```

Handles the case when no invoices exist yet for the month.

## Performance Impact

The fix adds minimal overhead:
- Table lock is very brief (milliseconds)
- MAX() is efficient with proper indexing
- Safety loop rarely executes

## Troubleshooting

### Still Getting Duplicates?

1. **Verify fix was applied:**
   ```sql
   -- Check function definition
   SELECT prosrc FROM pg_proc WHERE proname = 'generate_invoice_number';
   ```

2. **Check for existing duplicates:**
   ```sql
   SELECT invoice_number, COUNT(*) 
   FROM invoices 
   GROUP BY invoice_number 
   HAVING COUNT(*) > 1;
   ```

3. **Fix existing duplicates:**
   ```sql
   -- Manually update duplicate invoice numbers
   UPDATE invoices 
   SET invoice_number = '2025-12-XXXXX'  -- Use next available number
   WHERE id = 'duplicate-invoice-id';
   ```

### Function Not Working?

1. **Check trigger is active:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'set_invoice_number_trigger';
   ```

2. **Test function directly:**
   ```sql
   SELECT generate_invoice_number();
   ```

3. **Check for errors:**
   ```sql
   -- Try creating a test invoice
   INSERT INTO invoices (user_id, client_id, amount, issue_date, due_date, line_items)
   VALUES (
     'your-user-id',
     'your-client-id',
     100.00,
     CURRENT_DATE,
     CURRENT_DATE + INTERVAL '30 days',
     '[]'::jsonb
   );
   ```

## Migration Notes

### For Existing Invoices

Existing invoices are not affected. The fix only applies to new invoices being created.

### For Different Formats

If you want to change the invoice number format:

```sql
-- Current format: YYYY-MM-XXXXX (e.g., 2025-12-00001)

-- To change to: INV-YYYY-MM-XXXXX
invoice_num := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');

-- To change to: YYYYMMXXXXX (no dashes)
invoice_num := TO_CHAR(NOW(), 'YYYYMM') || LPAD(sequence_num::TEXT, 5, '0');
```

Update the function and redeploy.

## Prevention

To prevent similar issues in the future:

1. **Always use MAX() for sequences** instead of COUNT()
2. **Add table locking** for critical operations
3. **Include safety checks** for duplicates
4. **Test with concurrent users** before deploying
5. **Monitor for constraint violations** in production

## Monitoring

Set up monitoring for duplicate errors:

```sql
-- Check for recent errors (if you have error logging)
SELECT * FROM error_logs 
WHERE error_message LIKE '%duplicate key%' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Check invoice number gaps
SELECT 
  invoice_number,
  LAG(invoice_number) OVER (ORDER BY invoice_number) as prev_number
FROM invoices
WHERE invoice_number LIKE TO_CHAR(NOW(), 'YYYY-MM') || '-%'
ORDER BY invoice_number;
```

## Summary

✅ **Problem:** Race condition in invoice number generation
✅ **Solution:** Use MAX() instead of COUNT() + table locking
✅ **Fix File:** `supabase-fix-invoice-number.sql`
✅ **Impact:** Minimal performance overhead, prevents duplicates
✅ **Status:** Ready to apply

## Quick Fix Command

```bash
# Copy the fix file content and run in Supabase SQL Editor
cat supabase-fix-invoice-number.sql
```

Then paste into Supabase SQL Editor and click "Run".

---

**After applying the fix, test by creating multiple invoices from different users simultaneously.**
