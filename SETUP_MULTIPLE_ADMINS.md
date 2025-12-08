# Quick Setup: Multiple Admin Emails

## 🎯 Goal
Configure the system to send email notifications to both:
- blockspacetechnologies@gmail.com
- brisamukunde1@gmail.com

## ⚡ Quick Setup (2 minutes)

### Step 1: Set Environment Variable in Supabase

1. Go to: https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/settings/functions
2. Click **Edge Functions** in settings
3. Find or add secret: `ADMIN_EMAILS`
4. Set value to:
   ```
   blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
   ```
5. Click **Save**

### Step 2: Verify Deployment

The edge function has already been deployed with the new code. You can verify at:
https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions

### Step 3: Test It

**Option A: Create Test Invoice**
1. Login to https://celo-invoice.netlify.app as a regular user
2. Create and submit an invoice
3. Both admins should receive email

**Option B: Browser Console Test**
1. Open app → F12 → Console
2. Run:
```javascript
const result = await supabase.functions.invoke('send-email', {
  body: {
    type: 'invoice_pending',
    invoiceId: 'YOUR_INVOICE_ID',
    notes: 'Test notification to both admins'
  }
})
console.log(result)
```

### Step 4: Check Emails

Both admins should receive:
- ✅ blockspacetechnologies@gmail.com
- ✅ brisamukunde1@gmail.com

## 📋 What Changed

### Before
- Only one admin email: `ADMIN_EMAIL`
- Single recipient for notifications

### After
- Multiple admin emails: `ADMIN_EMAILS`
- Comma-separated list
- All admins receive notifications simultaneously

## 🔍 Verify Setup

### Check Environment Variable
```bash
supabase secrets list
```

Should show:
```
ADMIN_EMAILS=blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
```

### Check Function Logs
1. Go to: https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions
2. Click "send-email" → "Logs"
3. Look for successful invocations

### Check Resend Dashboard
1. Go to: https://resend.com/emails
2. Recent emails should show both recipients
3. Check delivery status

## 📧 Which Emails Go to Admins?

**Sent to ALL admins:**
- 📋 Invoice Pending (user submits invoice)
- 🚫 Invoice Cancelled (user cancels invoice)

**Sent to individual users:**
- ✅ Invoice Approved
- ❌ Invoice Rejected
- 💰 Invoice Paid
- ⊘ Invoice Voided
- 🔄 Recurring Invoice Generated

## 🐛 Troubleshooting

### Only one admin receives email
- Check `ADMIN_EMAILS` has both emails
- Verify comma separation
- Check for typos

### No emails received
- Verify `ADMIN_EMAILS` is set in Supabase
- Check Resend API key is valid
- Review function logs for errors

### Emails in spam
- Check spam folders
- Whitelist sender: hello@heirvault.pro
- Verify domain in Resend

## ✅ Success Checklist

- [ ] `ADMIN_EMAILS` set in Supabase with both emails
- [ ] Edge function deployed (already done)
- [ ] Test invoice created
- [ ] Both admins received email
- [ ] Emails not in spam
- [ ] Links in emails work
- [ ] Resend dashboard shows delivery

## 🔗 Quick Links

- [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/settings/functions)
- [Supabase Function Logs](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions)
- [Resend Email Dashboard](https://resend.com/emails)
- [App URL](https://celo-invoice.netlify.app)

## 📚 Full Documentation

For detailed information, see:
- [MULTIPLE_ADMIN_EMAILS.md](./MULTIPLE_ADMIN_EMAILS.md) - Complete guide
- [EMAIL_FUNCTION_TEST_GUIDE.md](./EMAIL_FUNCTION_TEST_GUIDE.md) - Testing guide
- [QUICK_EMAIL_TEST.md](./QUICK_EMAIL_TEST.md) - Quick tests

---

**Status:** ✅ Code Deployed - Just Set Environment Variable
**Next Step:** Set `ADMIN_EMAILS` in Supabase Dashboard
**Time Required:** 2 minutes
