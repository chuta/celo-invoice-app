# Email Function Testing Guide

## Issue Identified
The send-email edge function was encountering CORS errors (400 on OPTIONS requests) and had a bug where it tried to read the request body twice.

## Fixes Applied

### 1. Added CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 2. Handle OPTIONS Requests
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

### 3. Fixed Double Body Read Bug
- Removed duplicate `await req.json()` call
- Now reads `notes` parameter in single request parse

### 4. Added CORS to All Responses
- Success responses include CORS headers
- Error responses include CORS headers

### 5. Enhanced Error Logging
- Added `console.error` for better debugging

## Manual Testing Steps

### Step 1: Verify Edge Function Deployment
```bash
cd celo-invoice-app
supabase functions deploy send-email
```

Expected output: "Deployed Functions on project..."

### Step 2: Check Environment Variables in Supabase

Go to: **Supabase Dashboard > Project Settings > Edge Functions**

Verify these secrets are set:
- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- ✅ `ADMIN_EMAIL` - Admin email (e.g., blockspacetechnologies@gmail.com)
- ✅ `APP_URL` - Your app URL (e.g., https://celo-invoice.netlify.app)
- ✅ `FROM_EMAIL` - Sender email (e.g., CeloAfricaDAO Invoice <hello@heirvault.pro>)

### Step 3: Test CORS with cURL

```bash
curl -X OPTIONS \
  https://pijcliprhnxulqctfeik.supabase.co/functions/v1/send-email \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

Expected: Status 200 with CORS headers in response

### Step 4: Test Email Function via Browser Console

1. Open your deployed app: https://celo-invoice.netlify.app
2. Login as a user
3. Open browser console (F12)
4. Run this test:

```javascript
// Get Supabase client from window
const { supabase } = window

// Test with a real invoice ID (replace with actual ID)
const testInvoiceId = 'YOUR_INVOICE_ID_HERE'

// Test invoice_pending email
const result = await supabase.functions.invoke('send-email', {
  body: {
    type: 'invoice_pending',
    invoiceId: testInvoiceId,
    notes: 'Test email from console'
  }
})

console.log('Result:', result)
```

Expected: `{ success: true, data: { id: '...' } }`

### Step 5: Test via App Workflow

#### Test 1: Invoice Submission (invoice_pending)
1. Login as regular user
2. Create a new invoice
3. Fill in all details
4. Click "Submit for Approval"
5. Check admin email for notification

#### Test 2: Invoice Approval (invoice_approved)
1. Login as admin
2. Go to Admin Dashboard
3. Find pending invoice
4. Click "Approve" with optional notes
5. Check user email for approval notification

#### Test 3: Invoice Rejection (invoice_rejected)
1. Login as admin
2. Find pending invoice
3. Click "Reject" with reason
4. Check user email for rejection notification

#### Test 4: Invoice Payment (invoice_paid)
1. Login as admin
2. Find approved invoice
3. Click "Mark as Paid"
4. Check user email for payment notification

#### Test 5: Invoice Void (invoice_voided)
1. Login as admin
2. Find approved invoice
3. Click "Void" with reason
4. Check user email for void notification

#### Test 6: Invoice Cancellation (invoice_cancelled)
1. Login as user
2. Find draft or pending invoice
3. Click "Cancel"
4. Check admin email for cancellation notification

### Step 6: Check Logs

#### Supabase Edge Function Logs
1. Go to: **Supabase Dashboard > Edge Functions > send-email**
2. Click "Logs" tab
3. Look for recent invocations
4. Check for errors or successful executions

#### Resend Dashboard
1. Go to: https://resend.com/emails
2. Check recent emails
3. Verify delivery status
4. Check for any bounces or errors

## Common Issues & Solutions

### Issue: 400 Bad Request on OPTIONS
**Solution:** ✅ Fixed - CORS headers now included

### Issue: "Cannot read body twice"
**Solution:** ✅ Fixed - Removed duplicate `req.json()` call

### Issue: Email not received
**Possible causes:**
- Check spam/junk folder
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery status
- Verify FROM_EMAIL domain is verified in Resend
- Check recipient email is valid

### Issue: "Invalid email type"
**Solution:** Use one of these types:
- `invoice_pending`
- `invoice_approved`
- `invoice_rejected`
- `invoice_paid`
- `invoice_voided`
- `invoice_cancelled`
- `recurring_generated`

### Issue: "Invoice not found"
**Solution:** Verify invoice ID exists in database

### Issue: Missing environment variables
**Solution:** Set all required secrets in Supabase Dashboard

## Automated Test Script

Run the comprehensive test script:

```bash
cd celo-invoice-app
node test-email-function.js
```

This will:
- ✅ Check environment variables
- ✅ Test CORS configuration
- ✅ Test error handling
- ✅ Validate email types (dry run by default)

To send real test emails, edit `test-email-function.js`:
```javascript
const TEST_CONFIG = {
  SEND_REAL_EMAILS: true, // Change to true
}
```

## Verification Checklist

- [ ] Edge function deployed successfully
- [ ] All environment variables set in Supabase
- [ ] CORS OPTIONS request returns 200
- [ ] Test email sent via console works
- [ ] Invoice submission sends email to admin
- [ ] Invoice approval sends email to user
- [ ] Invoice rejection sends email to user
- [ ] Invoice payment sends email to user
- [ ] Invoice void sends email to user
- [ ] Invoice cancellation sends email to admin
- [ ] Emails appear in Resend dashboard
- [ ] Email styling looks correct
- [ ] Links in emails work correctly
- [ ] No errors in Supabase logs

## Expected Email Flow

### User Creates Invoice → Admin Receives Email
```
From: CeloAfricaDAO Invoice
To: blockspacetechnologies@gmail.com
Subject: 📋 New Invoice Submitted: INV-001
Content: Invoice details + "Review Invoice" button
```

### Admin Approves → User Receives Email
```
From: CeloAfricaDAO Invoice
To: user@example.com
Subject: ✅ Invoice Approved: INV-001
Content: Approval confirmation + wallet address + "View Invoice" button
```

### Admin Marks Paid → User Receives Email
```
From: CeloAfricaDAO Invoice
To: user@example.com
Subject: 💰 Payment Completed: INV-001
Content: Payment confirmation + transaction details
```

## Monitoring

### Real-time Monitoring
1. Keep Supabase Edge Function logs open
2. Keep Resend dashboard open
3. Perform actions in app
4. Watch logs for invocations and errors

### Email Delivery Metrics
Check in Resend dashboard:
- Sent count
- Delivered count
- Opened count (if tracking enabled)
- Bounced count
- Failed count

## Next Steps After Testing

1. ✅ Verify all email types work
2. ✅ Check email formatting on mobile devices
3. ✅ Test with different email providers (Gmail, Outlook, etc.)
4. ✅ Monitor delivery rates
5. ✅ Set up email tracking (optional)
6. ✅ Configure custom domain for FROM_EMAIL (optional)
7. ✅ Add email templates to version control

---

**Status:** 🔧 Fixed and Ready for Testing
**Last Updated:** December 8, 2025
**Deployed:** ✅ Yes
