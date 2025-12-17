# Invoice Categories Feature

## Overview
Added invoice categorization to help organize and filter invoices by type. Users must now select a category when creating new invoices.

## Categories
The following invoice categories are available:

1. **Judges & Mentors** - Payments for judges and mentors
2. **HackerDAO Winners** - Payments for HackerDAO competition winners
3. **Hackathon Winners** - Payments for hackathon winners
4. **Incubation Winners** - Payments for incubation program winners
5. **DAO Contributor Allowance** - Regular allowances for DAO contributors
6. **Monthly Events** - Payments related to monthly events

## Database Changes

### New Column
- **Table**: `invoices`
- **Column**: `invoice_category` (TEXT)
- **Constraint**: Must be one of the predefined categories
- **Index**: Added for better query performance

### Migration Script
Run the following SQL script in your Supabase SQL Editor:

```bash
# File: supabase-add-invoice-category.sql
```

The script includes:
- Column addition with check constraint
- Index creation for performance
- Documentation comments

## Frontend Changes

### InvoiceNew Component
Updated `src/pages/InvoiceNew.jsx`:

1. **Added category dropdown** in the Client Information section
2. **Added validation** to require category selection before submission
3. **Added category data** to invoice creation payload
4. **Added category options** with user-friendly labels

### User Experience
- Category selection is **required** (marked with *)
- Dropdown appears right after client selection
- Helper text explains the purpose
- Validation error shows if category is not selected

## Usage

### Creating an Invoice
1. Navigate to "Create New Invoice"
2. Select a client
3. **Select an invoice category** (new step)
4. Fill in other invoice details
5. Add line items
6. Submit for approval or save as draft

### Validation
The system will prevent invoice submission if:
- No category is selected
- An invalid category value is provided

## Future Enhancements

### Filtering & Reporting
With categories in place, you can now:
- Filter invoices by category in the admin dashboard
- Generate category-specific reports
- Track spending by category
- Export invoices grouped by category

### Suggested Next Steps
1. Add category filter to the Invoices list page
2. Add category filter to the Admin dashboard
3. Add category breakdown to reports
4. Display category badge on invoice detail page
5. Add category to CSV exports

## Technical Details

### Database Schema
```sql
invoice_category TEXT CHECK (invoice_category IN (
  'judges_mentors',
  'hackerdao_winners',
  'hackathon_winners',
  'incubation_winners',
  'dao_contributor_allowance',
  'monthly_events'
))
```

### Category Mapping
```javascript
const invoiceCategories = [
  { value: 'judges_mentors', label: 'Judges & Mentors' },
  { value: 'hackerdao_winners', label: 'HackerDAO Winners' },
  { value: 'hackathon_winners', label: 'Hackathon Winners' },
  { value: 'incubation_winners', label: 'Incubation Winners' },
  { value: 'dao_contributor_allowance', label: 'DAO Contributor Allowance' },
  { value: 'monthly_events', label: 'Monthly Events' },
]
```

## Deployment Checklist

- [ ] Run database migration script in Supabase
- [ ] Deploy updated frontend code
- [ ] Test invoice creation with all categories
- [ ] Verify validation works correctly
- [ ] Update user documentation
- [ ] Consider adding category to existing invoices (optional)

## Notes

- Existing invoices will have `NULL` category until updated
- The check constraint ensures data integrity at the database level
- Categories use snake_case in the database but display with proper formatting in the UI
- The feature is backward compatible - existing invoices without categories will still work
