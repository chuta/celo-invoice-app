## Phase 3 Setup Guide

This guide will help you set up the advanced features: Admin Dashboard, CSV Export, Email Notifications, and Recurring Invoice Generation.

## Part 1: Admin Dashboard & CSV Export ✅

These features are already working! No additional setup needed.

### Admin Dashboard Features:
- View all invoices from all users
- See pending approvals
- Quick approve/reject actions
- Statistics dashboard
- Filter by status

### CSV Export Features:
- Export approved invoices to CSV
- Format compatible with Safe (Gnosis Safe)
- Includes wallet addresses and amounts
- Ready for bulk payments

### How to Use:

1. **Make yourself admin** (if not already):
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user and change `role` to `admin`
   - Refresh the app

2. **Access Admin Dashboard**:
   - Click "Admin" in the sidebar
   - You'll see all pending invoices and statistics

3. **Export to CSV**:
   - Click "📥 Export Approved to CSV" button
   - File will download automatically
   - Upload to Safe app for bulk payments

## Part 2: Email Notifications Setup

Email notifications use Resend.com and Supabase Edge Functions.

### Step 1: Set Up Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email
3. Add and verify your domain (or use their test domain for development)
4. Get your API key from the dashboard

### Step 2: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Step 3: Initialize Supabase in Your Project

```bash
cd celo-invoice-app
supabase init
```

### Step 4: Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

Find your project ref in Supabase Dashboard → Settings → General

### Step 5: Set Environment Variables

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=your_resend_api_key

# Set cron secret (for recurring invoices)
supabase secrets set CRON_SECRET=your_random_secret_key
```

### Step 6: Deploy Edge Functions

```bash
# Deploy send-email function
supabase functions deploy send-email

# Deploy generate-recurring-invoices function
supabase functions deploy generate-recurring-invoices
```

### Step 7: Update Email Addresses

Edit `supabase/functions/send-email/index.ts`:

1. Replace `admin@celoafricadao.org` with your actual admin email
2. Replace `noreply@celoafricadao.org` with your verified Resend domain
3. Update `SUPABASE_URL` references to your actual app URL

Then redeploy:
```bash
supabase functions deploy send-email
```

### Step 8: Test Email Notifications

1. Create a test invoice
2. Submit for approval
3. Check admin email for notification
4. Approve the invoice
5. Check user email for approval notification

## Part 3: Recurring Invoice Auto-Generation

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/recurring-invoices.yml`:

```yaml
name: Generate Recurring Invoices

on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            https://your-project-ref.supabase.co/functions/v1/generate-recurring-invoices \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

Add `CRON_SECRET` to GitHub repository secrets.

### Option 2: Cron-job.org

1. Go to [cron-job.org](https://cron-job.org) and create account
2. Create new cron job:
   - **URL:** `https://your-project-ref.supabase.co/functions/v1/generate-recurring-invoices`
   - **Schedule:** Daily at 9 AM
   - **Headers:** 
     - `Authorization: Bearer your_cron_secret`
     - `Content-Type: application/json`
   - **Method:** POST

### Option 3: Supabase Cron (Coming Soon)

Supabase is adding native cron support. Check their docs for updates.

### Testing Recurring Invoice Generation

Manually trigger the function:

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/generate-recurring-invoices \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

## Email Templates

The system sends these emails:

### 1. Invoice Submitted (to Admin)
- Triggered when user submits invoice for approval
- Contains invoice details and link to review

### 2. Invoice Approved (to User)
- Triggered when admin approves invoice
- Contains payment details and wallet address

### 3. Invoice Rejected (to User)
- Triggered when admin rejects invoice
- Suggests contacting admin or revising

### 4. Invoice Cancelled (to Admin)
- Triggered when user cancels invoice
- Notifies admin of cancellation

### 5. Recurring Invoice Generated (to User)
- Triggered when recurring invoice is auto-generated
- Reminds user to review and submit

## Customizing Email Templates

Edit `supabase/functions/send-email/index.ts`:

1. Find the email type you want to customize
2. Update the `html` content
3. Redeploy: `supabase functions deploy send-email`

You can use HTML and inline CSS for styling.

## Troubleshooting

### Emails Not Sending

1. **Check Resend API key:**
   ```bash
   supabase secrets list
   ```

2. **Check function logs:**
   ```bash
   supabase functions logs send-email
   ```

3. **Verify domain in Resend:**
   - Go to Resend dashboard
   - Check domain verification status

4. **Test function directly:**
   ```bash
   curl -X POST \
     https://your-project-ref.supabase.co/functions/v1/send-email \
     -H "Authorization: Bearer your_service_role_key" \
     -H "Content-Type: application/json" \
     -d '{"type":"invoice_submitted","invoiceId":"your-invoice-id"}'
   ```

### Recurring Invoices Not Generating

1. **Check database function:**
   ```sql
   SELECT generate_recurring_invoices();
   ```

2. **Verify recurring invoice settings:**
   - Check `is_recurring` is true
   - Check `recurrence_frequency` is set
   - Check `recurrence_end_date` hasn't passed

3. **Check cron job is running:**
   - GitHub Actions: Check workflow runs
   - Cron-job.org: Check execution history

### CSV Export Issues

1. **Missing wallet addresses:**
   - Users must set wallet address in Settings
   - Check profiles table for wallet_address field

2. **No approved invoices:**
   - Only approved invoices are exported
   - Approve some invoices first

3. **CSV format issues:**
   - Verify Safe app accepts the format
   - Check cUSD token address is correct

## Safe (Gnosis Safe) Integration

### CSV Format

The exported CSV has this format:
```
token_type,token_address,receiver,amount,id
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x...,1000.00,2025-12-00001
```

### Using in Safe App

1. Go to [app.safe.global](https://app.safe.global)
2. Connect your Safe wallet
3. Go to Apps → CSV Airdrop (or Transaction Builder)
4. Upload the exported CSV
5. Review transactions
6. Sign and execute

### Token Address

- **cUSD on Celo Mainnet:** `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **cUSD on Celo Alfajores (Testnet):** `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

Update in `src/pages/Admin.jsx` if using testnet.

## Environment Variables Summary

### Supabase Secrets (Edge Functions)
```bash
RESEND_API_KEY=re_...
CRON_SECRET=your_random_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (auto-set)
```

### GitHub Secrets (if using GitHub Actions)
```
CRON_SECRET=your_random_secret
```

## Testing Checklist

- [ ] Admin can access admin dashboard
- [ ] Admin can see pending invoices
- [ ] Admin can approve invoices from dashboard
- [ ] Admin can reject invoices from dashboard
- [ ] CSV export downloads successfully
- [ ] CSV contains correct wallet addresses
- [ ] CSV format works in Safe app
- [ ] Email sent when invoice submitted
- [ ] Email sent when invoice approved
- [ ] Email sent when invoice rejected
- [ ] Email sent when invoice cancelled
- [ ] Recurring invoices generate automatically
- [ ] Email sent when recurring invoice generated

## Production Checklist

Before going live:

- [ ] Verify Resend domain
- [ ] Update admin email address
- [ ] Update from email address
- [ ] Set up cron job for recurring invoices
- [ ] Test all email notifications
- [ ] Test CSV export with real Safe wallet
- [ ] Set up monitoring for edge functions
- [ ] Document process for team

## Monitoring

### Check Edge Function Logs

```bash
# View send-email logs
supabase functions logs send-email --tail

# View recurring invoice logs
supabase functions logs generate-recurring-invoices --tail
```

### Check Email Delivery

1. Go to Resend dashboard
2. View "Emails" tab
3. Check delivery status

### Monitor Recurring Invoice Generation

1. Check invoice_history table for new entries
2. Monitor user emails for notifications
3. Check GitHub Actions runs (if using)

## Cost Estimates

### Resend Pricing
- Free tier: 3,000 emails/month
- Pro: $20/month for 50,000 emails

### Supabase Edge Functions
- Free tier: 500,000 invocations/month
- Included in Pro plan

### GitHub Actions
- Free for public repos
- 2,000 minutes/month for private repos

## Support

- **Resend Docs:** https://resend.com/docs
- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Safe App:** https://help.safe.global

## Next Steps

Once Phase 3 is set up:
1. Test all features thoroughly
2. Train team on admin dashboard
3. Document payment process
4. Set up monitoring alerts
5. Plan Phase 4 enhancements
