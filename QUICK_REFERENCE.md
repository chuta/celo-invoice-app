# Quick Reference Guide

Fast reference for common tasks in the CELOAfricaDAO Invoice Management System.

## 🚀 Getting Started

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 👤 User Actions

### Create Invoice
1. Dashboard → "+ Create Invoice"
2. Select client
3. Add line items
4. Submit for approval or save as draft

### Manage Clients
1. Sidebar → "Clients"
2. "+ Add Client" button
3. Fill in details and save

### Configure Wallet
1. Sidebar → "Settings"
2. Add cUSD wallet address
3. Save changes

### View Invoices
1. Sidebar → "Invoices"
2. Filter by status
3. Click invoice number for details

## 🔐 Admin Actions

### Make User Admin
```
Supabase Dashboard → Table Editor → profiles
Find user → Change role to 'admin' → Save
```

### Access Admin Dashboard
```
Sidebar → "Admin" (admin users only)
```

### Approve Invoice
```
Admin Dashboard → Pending Invoices → "✓ Approve"
OR
Invoice Detail Page → "✓ Approve Invoice"
```

### Reject Invoice
```
Admin Dashboard → Pending Invoices → "✗ Reject"
OR
Invoice Detail Page → "✗ Reject Invoice"
```

### Export to CSV
```
Admin Dashboard → "📥 Export Approved to CSV"
```

## 📧 Email Setup (One-Time)

```bash
# 1. Get Resend API key from resend.com

# 2. Install Supabase CLI
brew install supabase/tap/supabase

# 3. Link project
supabase link --project-ref your-project-ref

# 4. Set secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set CRON_SECRET=your_secret

# 5. Deploy functions
supabase functions deploy send-email
supabase functions deploy generate-recurring-invoices
```

## 🔄 Recurring Invoices Setup

### GitHub Actions (Recommended)
Create `.github/workflows/recurring-invoices.yml`:
```yaml
name: Generate Recurring Invoices
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Function
        run: |
          curl -X POST \
            https://your-project.supabase.co/functions/v1/generate-recurring-invoices \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Manual Trigger
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/generate-recurring-invoices \
  -H "Authorization: Bearer your_cron_secret"
```

## 💰 Safe (Gnosis Safe) Integration

### Export & Upload
1. Admin Dashboard → Export to CSV
2. Go to app.safe.global
3. Apps → CSV Airdrop
4. Upload CSV file
5. Review and execute

### Token Address
- **cUSD Mainnet:** `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **cUSD Testnet:** `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## 🗄️ Database Quick Access

### Supabase Dashboard
```
https://supabase.com/dashboard/project/your-project-ref
```

### Common Tables
- `profiles` - User accounts and roles
- `clients` - Client information
- `invoices` - All invoices
- `invoice_history` - Audit log

### Make User Admin
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### View Pending Invoices
```sql
SELECT * FROM invoices 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting

### Can't Login
- Check Supabase project is active
- Verify `.env` file has correct credentials
- Clear browser cache

### No Invoices Showing
- Check RLS policies are enabled
- Verify user is authenticated
- Check browser console for errors

### CSV Export Fails
- Ensure users have wallet addresses set
- Check there are approved invoices
- Verify you're an admin

### Emails Not Sending
```bash
# Check secrets
supabase secrets list

# View logs
supabase functions logs send-email --tail

# Test manually
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer your_service_role_key" \
  -d '{"type":"invoice_submitted","invoiceId":"invoice-id"}'
```

### Recurring Invoices Not Generating
```sql
-- Test database function
SELECT generate_recurring_invoices();

-- Check recurring invoices
SELECT * FROM invoices 
WHERE is_recurring = true;
```

## 📊 Invoice Statuses

- **draft** - Being created, not submitted
- **pending** - Submitted, awaiting approval
- **approved** - Approved by admin, ready for payment
- **paid** - Payment completed
- **cancelled** - Cancelled by user
- **rejected** - Rejected by admin
- **voided** - Voided by admin

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Secrets
```
RESEND_API_KEY=re_...
CRON_SECRET=your_secret
```

## 📱 User Roles

### Regular User Can:
- Create invoices
- Manage own clients
- View own invoices
- Cancel own invoices (draft/pending)
- Configure wallet address

### Admin Can:
- All user actions
- View all invoices
- Approve/reject invoices
- Void invoices
- Export to CSV
- Access admin dashboard

## 🔗 Important Links

- **App:** http://localhost:5173 (dev)
- **Supabase:** https://supabase.com/dashboard
- **Resend:** https://resend.com/dashboard
- **Safe App:** https://app.safe.global
- **Celo Docs:** https://docs.celo.org

## 📞 Support

### Documentation
- `README.md` - Complete overview
- `QUICKSTART.md` - 10-minute setup
- `PHASE1_COMPLETE.md` - Auth & setup
- `PHASE2_COMPLETE.md` - Core features
- `PHASE3_COMPLETE.md` - Advanced features
- `PHASE3_SETUP.md` - Email & cron setup

### Common Commands
```bash
# Development
npm run dev

# Check diagnostics
npm run lint

# Build
npm run build

# Supabase
supabase link
supabase functions deploy function-name
supabase secrets set KEY=value
supabase functions logs function-name

# Git
git add .
git commit -m "message"
git push
```

## 🎯 Quick Workflows

### New User Onboarding
1. User signs up
2. User adds wallet address in Settings
3. User adds clients
4. User creates first invoice
5. Admin approves
6. Payment processed via Safe

### Monthly Recurring Payment
1. Recurring invoice auto-generates
2. User receives email notification
3. User reviews and submits
4. Admin approves
5. Included in next CSV export
6. Bulk payment via Safe

### Bulk Payment Process
1. Admin exports approved invoices to CSV
2. Admin uploads CSV to Safe app
3. Admin reviews transactions
4. Admin signs and executes
5. Payments sent to user wallets

## 💡 Pro Tips

- Set up email notifications early for better workflow
- Use recurring invoices for regular payments
- Export CSV weekly for consistent payment schedule
- Keep wallet addresses updated
- Use memo field for payment references
- Check admin dashboard daily for pending approvals
- Test with small amounts first
- Keep Supabase project active (free tier pauses after inactivity)

## 🚨 Important Notes

- Only cUSD currency supported
- Wallet addresses must be valid Celo addresses
- CSV export requires all users to have wallet addresses
- Email notifications require Resend setup
- Recurring invoices require cron job setup
- Admin role must be set manually in database
- RLS policies protect all data access

---

**Need more help?** Check the full documentation files or contact support.
