# Multiple Admin Emails Feature

## Overview
The send-email edge function now supports sending notifications to multiple administrators simultaneously. This ensures all admins receive important invoice notifications.

## How It Works

### Environment Variable
Instead of a single `ADMIN_EMAIL`, the function now uses `ADMIN_EMAILS` which accepts:
- **Single email:** `admin@example.com`
- **Multiple emails:** `admin1@example.com, admin2@example.com, admin3@example.com`

### Backward Compatibility
The function maintains backward compatibility:
1. First checks for `ADMIN_EMAILS` (new variable)
2. Falls back to `ADMIN_EMAIL` (old variable)
3. Defaults to `blockspacetechnologies@gmail.com` if neither is set

### Email Delivery
When an admin notification is triggered:
- All emails in the list receive the notification
- Resend sends to all recipients simultaneously
- Each admin gets the same email content

## Setup Instructions

### Method 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/settings/functions)
2. Navigate to **Project Settings** → **Edge Functions**
3. Find or add the `ADMIN_EMAILS` secret
4. Enter comma-separated emails:
   ```
   blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
   ```
5. Click **Save**

### Method 2: Using set-secrets.sh Script

```bash
cd celo-invoice-app
./set-secrets.sh
```

When prompted for admin emails, enter:
```
blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
```

### Method 3: Supabase CLI

```bash
supabase secrets set ADMIN_EMAILS="blockspacetechnologies@gmail.com, brisamukunde1@gmail.com"
```

### Method 4: Manual CLI Commands

```bash
# Set multiple admin emails
supabase secrets set ADMIN_EMAILS="admin1@example.com, admin2@example.com"

# Verify it was set
supabase secrets list

# Test the function
supabase functions invoke send-email --body '{"type":"invoice_pending","invoiceId":"YOUR_INVOICE_ID"}'
```

## Email Notifications Sent to Admins

The following email types are sent to ALL admin emails:

### 1. Invoice Pending (invoice_pending)
**Trigger:** User submits invoice for approval
**Recipients:** All admins
**Content:** Invoice details, user info, review link

### 2. Invoice Cancelled (invoice_cancelled)
**Trigger:** User cancels their own invoice
**Recipients:** All admins
**Content:** Cancellation notice, invoice details

## Email Notifications Sent to Users

These go to individual users (not affected by admin emails):
- Invoice Approved
- Invoice Rejected
- Invoice Paid
- Invoice Voided
- Recurring Invoice Generated

## Configuration Examples

### Two Admins (Current Setup)
```bash
ADMIN_EMAILS="blockspacetechnologies@gmail.com, brisamukunde1@gmail.com"
```

### Three Admins
```bash
ADMIN_EMAILS="admin1@example.com, admin2@example.com, admin3@example.com"
```

### Single Admin (Backward Compatible)
```bash
ADMIN_EMAILS="admin@example.com"
# OR
ADMIN_EMAIL="admin@example.com"
```

### With Spaces (Automatically Trimmed)
```bash
ADMIN_EMAILS="admin1@example.com,  admin2@example.com  ,admin3@example.com"
```
All spaces are automatically removed.

## Testing

### Test 1: Verify Environment Variable

In Supabase Dashboard:
1. Go to **Edge Functions** settings
2. Check `ADMIN_EMAILS` is set correctly
3. Should show: `blockspacetechnologies@gmail.com, brisamukunde1@gmail.com`

### Test 2: Create Test Invoice

1. Login to app as regular user
2. Create a new invoice
3. Submit for approval
4. **Both admins** should receive email notification

### Test 3: Check Email Logs

In Resend Dashboard:
1. Go to https://resend.com/emails
2. Find the recent email
3. Check "To" field shows both recipients
4. Verify both emails were delivered

### Test 4: Console Test

Open browser console on your app:
```javascript
// Test with real invoice ID
const result = await supabase.functions.invoke('send-email', {
  body: {
    type: 'invoice_pending',
    invoiceId: 'YOUR_INVOICE_ID',
    notes: 'Test notification'
  }
})

console.log(result)
```

Check both admin inboxes for the email.

## Technical Implementation

### Code Changes

**Before (Single Admin):**
```typescript
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com'

// Later in code
to = ADMIN_EMAIL  // Single string
```

**After (Multiple Admins):**
```typescript
const ADMIN_EMAILS_RAW = Deno.env.get('ADMIN_EMAILS') || Deno.env.get('ADMIN_EMAIL') || 'admin@example.com'
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.split(',').map(email => email.trim()).filter(email => email.length > 0)

// Later in code
to = ADMIN_EMAILS  // Array of strings
```

### Resend API Support

Resend natively supports multiple recipients:
```json
{
  "from": "sender@example.com",
  "to": ["admin1@example.com", "admin2@example.com"],
  "subject": "Test",
  "html": "<p>Content</p>"
}
```

## Benefits

### 1. Redundancy
- If one admin misses an email, another can respond
- No single point of failure

### 2. Transparency
- All admins stay informed
- Better team coordination

### 3. Faster Response
- Multiple people can review invoices
- Reduces approval bottlenecks

### 4. Audit Trail
- All admins receive same notifications
- Better accountability

## Best Practices

### Email Management
- ✅ Use team/role-based emails when possible
- ✅ Keep admin list updated
- ✅ Remove inactive admins promptly
- ✅ Test after adding new admins

### Security
- 🔒 Only add trusted team members
- 🔒 Use strong passwords for admin accounts
- 🔒 Enable 2FA where available
- 🔒 Monitor admin activity

### Maintenance
- 📝 Document who has admin access
- 📝 Review admin list quarterly
- 📝 Update when team changes
- 📝 Keep backup contact methods

## Troubleshooting

### Issue: Only one admin receives emails
**Solution:**
1. Check `ADMIN_EMAILS` format (comma-separated)
2. Verify no typos in email addresses
3. Check Resend dashboard for delivery status
4. Ensure both emails are valid

### Issue: No admins receive emails
**Solution:**
1. Verify `ADMIN_EMAILS` is set in Supabase
2. Check Resend API key is valid
3. Review edge function logs for errors
4. Test with single email first

### Issue: Emails go to spam
**Solution:**
1. Verify sender domain in Resend
2. Add SPF/DKIM records
3. Ask admins to whitelist sender
4. Check email content for spam triggers

### Issue: Wrong admins receiving emails
**Solution:**
1. Update `ADMIN_EMAILS` in Supabase
2. Redeploy edge function (if needed)
3. Test with new configuration
4. Verify in Resend dashboard

## Migration from Single to Multiple Admins

### Step 1: Check Current Setup
```bash
supabase secrets list | grep ADMIN
```

### Step 2: Update to Multiple Admins
```bash
supabase secrets set ADMIN_EMAILS="admin1@example.com, admin2@example.com"
```

### Step 3: Remove Old Variable (Optional)
```bash
supabase secrets unset ADMIN_EMAIL
```

### Step 4: Test
Create a test invoice and verify both admins receive notification.

## Monitoring

### Check Email Delivery
1. Resend Dashboard → Emails
2. Filter by date
3. Check delivery status for each recipient
4. Monitor bounce/complaint rates

### Check Function Logs
1. Supabase Dashboard → Edge Functions → send-email
2. Click "Logs" tab
3. Look for successful invocations
4. Check for any errors

### Regular Audits
- Weekly: Check email delivery rates
- Monthly: Review admin list
- Quarterly: Test all notification types
- Annually: Security audit

## Future Enhancements

Potential improvements:
- Role-based email routing (super_admin vs admin)
- Email preferences per admin
- Digest mode (batch notifications)
- SMS notifications for urgent items
- Slack/Discord integration
- Custom notification rules

---

**Status:** ✅ Implemented and Ready to Use
**Version:** 2.0
**Date:** December 8, 2025
**Deployed:** Pending (run deployment after setting ADMIN_EMAILS)
