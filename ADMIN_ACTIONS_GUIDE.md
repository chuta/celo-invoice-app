# Admin Invoice Actions Guide

Complete guide for managing invoices as an admin or super admin.

## Overview

Admins and super admins have powerful tools to manage invoices throughout their lifecycle. This guide covers all available actions and best practices.

## Invoice Lifecycle

```
Draft → Pending → Approved → Paid
         ↓          ↓
      Rejected   Voided
         ↓          
     Cancelled
```

## Admin Actions by Status

### Pending Invoices

**Available Actions:**
- ✅ **Approve** - Accept the invoice for payment
- ❌ **Reject** - Decline the invoice with reason

**Bulk Actions:**
- ✅ Approve multiple invoices at once
- ❌ Reject multiple invoices at once

### Approved Invoices

**Available Actions:**
- 💰 **Mark as Paid** - Record that payment was completed
- ⊘ **Void** - Cancel an approved invoice (with reason)

### Rejected Invoices

**Available Actions:**
- ✅ **Re-approve** - Approve a previously rejected invoice

### Paid Invoices

**Available Actions:**
- (No actions - final state)

## How to Use Each Action

### 1. Approve Invoice

**Purpose:** Accept an invoice for payment processing

**Steps:**
1. Go to Admin Dashboard
2. Find invoice in "Pending Approvals" section
3. Click "✓ Approve"
4. (Optional) Add approval notes
5. Click "Approve" to confirm

**What Happens:**
- Invoice status changes to "approved"
- User receives email notification
- Invoice appears in CSV export
- Action logged in invoice history

**When to Use:**
- Invoice details are correct
- Amount is reasonable
- Client information is valid
- User has wallet address configured

### 2. Reject Invoice

**Purpose:** Decline an invoice that doesn't meet requirements

**Steps:**
1. Go to Admin Dashboard
2. Find invoice in "Pending Approvals" section
3. Click "✗ Reject"
4. Add rejection reason (recommended)
5. Click "Reject" to confirm

**What Happens:**
- Invoice status changes to "rejected"
- User receives email notification with reason
- Invoice removed from pending queue
- Action logged in invoice history

**When to Use:**
- Incorrect information
- Duplicate invoice
- Amount is wrong
- Missing required details
- Policy violation

**Best Practice:** Always add notes explaining why

### 3. Void Invoice

**Purpose:** Cancel an approved invoice before payment

**Steps:**
1. Go to Admin Dashboard
2. Find approved invoice in "All Invoices"
3. Click "Void"
4. Add void reason (required)
5. Click "Void" to confirm

**What Happens:**
- Invoice status changes to "voided"
- Invoice removed from CSV export
- Action logged in invoice history
- Cannot be undone

**When to Use:**
- Payment cancelled
- Invoice was approved by mistake
- Client dispute
- Duplicate payment risk

**Important:** Voiding is permanent - use carefully!

### 4. Mark as Paid

**Purpose:** Record that payment has been completed

**Steps:**
1. Go to Admin Dashboard
2. Find approved invoice in "All Invoices"
3. Click "Mark Paid"
4. Confirm action

**What Happens:**
- Invoice status changes to "paid"
- Paid date is recorded
- Invoice marked as complete
- Final state - no further actions

**When to Use:**
- After processing payment via Safe
- After manual payment
- After bulk payment completion

### 5. Bulk Approve

**Purpose:** Approve multiple invoices at once

**Steps:**
1. Go to Admin Dashboard
2. Check boxes next to invoices to approve
3. Click "✓ Approve Selected (X)"
4. Confirm bulk action

**What Happens:**
- All selected invoices approved
- Email sent to each user
- All appear in CSV export

**When to Use:**
- Monthly payment processing
- Multiple valid invoices
- Batch approval workflow

**Tip:** Review each invoice before bulk approving

### 6. Bulk Reject

**Purpose:** Reject multiple invoices at once

**Steps:**
1. Go to Admin Dashboard
2. Check boxes next to invoices to reject
3. Click "✗ Reject Selected (X)"
4. Confirm bulk action

**What Happens:**
- All selected invoices rejected
- Email sent to each user
- All removed from pending

**When to Use:**
- Multiple invalid invoices
- Policy changes
- Batch cleanup

**Note:** Cannot add individual notes in bulk mode

## Admin Dashboard Features

### Statistics Cards

**Pending Approval**
- Count of invoices awaiting review
- Yellow badge
- Click to filter

**Approved**
- Count of approved invoices
- Green badge
- Ready for payment

**Total Approved**
- Sum of all approved invoice amounts
- In cUSD
- Export-ready total

**Total Users**
- Number of users in system
- All roles included

### Pending Approvals Table

**Features:**
- Checkbox selection for bulk actions
- Quick approve/reject buttons
- Invoice details at a glance
- Direct link to full invoice
- User and client information

**Columns:**
- Checkbox (for bulk selection)
- Invoice # (clickable link)
- User (who created it)
- Client (billed to)
- Amount (in cUSD)
- Due Date
- Actions (approve/reject)

### All Invoices Table

**Features:**
- Filter by status
- View all invoices from all users
- Status-specific actions
- Comprehensive invoice list

**Filters:**
- All Statuses
- Pending
- Approved
- Paid
- Draft
- Cancelled
- Rejected
- Voided

## CSV Export for Bulk Payments

### Purpose
Export approved invoices for bulk payment via Safe (Gnosis Safe)

### How to Export

1. Go to Admin Dashboard
2. Click "📥 Export Approved to CSV"
3. File downloads automatically
4. Upload to Safe app

### CSV Format

```csv
token_type,token_address,receiver,amount,id
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x...,10000.00,2025-12-00001
```

### Requirements

- Only approved invoices are exported
- Users must have wallet addresses configured
- Export fails if any user missing wallet

### Using in Safe

1. Go to app.safe.global
2. Connect your Safe wallet
3. Apps → CSV Airdrop
4. Upload exported CSV
5. Review transactions
6. Sign and execute

### After Payment

1. Return to Admin Dashboard
2. Find paid invoices
3. Click "Mark Paid" for each
4. Or mark all as paid in bulk

## Best Practices

### Review Process

1. **Check Invoice Details**
   - Verify amount is reasonable
   - Check client information
   - Review line items
   - Confirm due date

2. **Verify User**
   - Check user has wallet address
   - Confirm user is legitimate
   - Review user history

3. **Add Notes**
   - Document approval reasons
   - Explain rejections clearly
   - Note any special circumstances

### Approval Workflow

**Daily:**
1. Check pending approvals
2. Review each invoice
3. Approve valid invoices
4. Reject invalid with reasons

**Weekly:**
1. Export approved invoices
2. Process bulk payment via Safe
3. Mark invoices as paid
4. Review statistics

**Monthly:**
1. Review all invoice activity
2. Check for patterns
3. Update policies if needed
4. Generate reports

### Communication

**When Approving:**
- No notes needed for standard approvals
- Add notes for special cases
- Confirm with user if questions

**When Rejecting:**
- Always add clear rejection reason
- Suggest corrections needed
- Offer to help resolve issues

**When Voiding:**
- Explain why void is necessary
- Document the situation
- Notify user if appropriate

## Security & Compliance

### Access Control

- Only admins and super admins can approve/reject
- All actions are logged
- RLS policies enforce permissions
- Audit trail maintained

### Action Logging

Every action is recorded:
- Who performed the action
- When it was performed
- What changed (old status → new status)
- Any notes added

### Review Audit Log

```sql
SELECT * FROM invoice_history 
WHERE invoice_id = 'invoice-uuid'
ORDER BY created_at DESC;
```

## Troubleshooting

### Can't Approve Invoice

**Problem:** Approve button not working

**Solutions:**
1. Verify you're an admin
2. Check invoice is in "pending" status
3. Refresh the page
4. Check browser console for errors

### CSV Export Fails

**Problem:** "Missing wallet addresses" error

**Solutions:**
1. Check which users need wallet addresses
2. Contact users to add wallet in Settings
3. Or add wallet addresses in User Management (super admin)
4. Try export again

### Bulk Actions Not Working

**Problem:** Bulk approve/reject not executing

**Solutions:**
1. Verify invoices are selected (checkboxes)
2. Check all selected invoices are "pending"
3. Try smaller batches
4. Check for errors in console

### Email Notifications Not Sending

**Problem:** Users not receiving emails

**Solutions:**
1. Verify Resend is configured
2. Check edge functions are deployed
3. Review function logs
4. Test email function manually

## Keyboard Shortcuts

(Future enhancement - not yet implemented)

- `A` - Approve selected
- `R` - Reject selected
- `E` - Export to CSV
- `Space` - Toggle selection
- `Shift + Click` - Select range

## Mobile Access

The admin dashboard is responsive and works on mobile devices:
- Swipe to see all columns
- Tap to select invoices
- All actions available
- Optimized for tablets

## Reporting

### Generate Reports

**Approved Invoices Report:**
```sql
SELECT 
  invoice_number,
  amount,
  profiles.full_name as user,
  clients.name as client,
  created_at,
  due_date
FROM invoices
JOIN profiles ON invoices.user_id = profiles.id
JOIN clients ON invoices.client_id = clients.id
WHERE status = 'approved'
ORDER BY created_at DESC;
```

**Monthly Summary:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  status,
  COUNT(*) as count,
  SUM(amount) as total
FROM invoices
GROUP BY month, status
ORDER BY month DESC, status;
```

## FAQ

**Q: Can I undo an approval?**
A: Yes, use the "Void" action on approved invoices.

**Q: Can I undo a rejection?**
A: Yes, use "Re-approve" on rejected invoices.

**Q: Can I undo a void?**
A: No, voiding is permanent. Use carefully.

**Q: How do I handle duplicate invoices?**
A: Reject the duplicate with a note explaining it's a duplicate.

**Q: What if I approve by mistake?**
A: Immediately void the invoice with a note.

**Q: Can users see my notes?**
A: Yes, notes are visible to users in their invoice view.

**Q: How long does email notification take?**
A: Usually instant, but can take up to 1 minute.

**Q: Can I approve my own invoices?**
A: Yes, but it's not recommended. Have another admin review.

## Support

### Quick Commands

```bash
# View pending invoices
SELECT * FROM invoices WHERE status = 'pending';

# View approved invoices
SELECT * FROM invoices WHERE status = 'approved';

# Check invoice history
SELECT * FROM invoice_history WHERE invoice_id = 'uuid';

# Count by status
SELECT status, COUNT(*) FROM invoices GROUP BY status;
```

### Files Reference

- **Admin Dashboard:** `src/pages/Admin.jsx`
- **Invoice Detail:** `src/pages/InvoiceDetail.jsx`
- **Email Functions:** `supabase/functions/send-email/`

## Next Steps

1. ✅ Review pending invoices daily
2. ✅ Set up regular export schedule
3. ✅ Document your approval criteria
4. ✅ Train team on admin actions
5. ✅ Monitor invoice patterns

---

**Admin Dashboard:** `/admin`
**Quick Actions:** Approve, Reject, Void, Mark Paid
**Bulk Actions:** Available for pending invoices
**CSV Export:** One-click for Safe integration
