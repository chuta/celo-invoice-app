# Quick Email Function Test

## ✅ What Was Fixed
1. **CORS Error (400 on OPTIONS)** - Added proper CORS headers
2. **Body Parsing Error** - Fixed duplicate `req.json()` call
3. **Missing Error Logs** - Added console.error for debugging

## 🚀 Quick Test (5 minutes)

### Test 1: CORS Check
```bash
curl -X OPTIONS https://pijcliprhnxulqctfeik.supabase.co/functions/v1/send-email -v
```
✅ Should return: Status 200 with `Access-Control-Allow-Origin: *`

### Test 2: Real Invoice Test
1. Go to: https://celo-invoice.netlify.app
2. Login as user
3. Create invoice → Submit for Approval
4. Check admin email: blockspacetechnologies@gmail.com

### Test 3: Check Logs
1. Go to: [Supabase Edge Functions](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions)
2. Click "send-email" → "Logs"
3. Look for recent invocations

### Test 4: Check Resend
1. Go to: https://resend.com/emails
2. Look for recent emails
3. Check delivery status

## 🔍 Environment Variables to Verify

In Supabase Dashboard > Project Settings > Edge Functions:

```
✅ RESEND_API_KEY
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ ADMIN_EMAIL = blockspacetechnologies@gmail.com
✅ APP_URL = https://celo-invoice.netlify.app
✅ FROM_EMAIL = CeloAfricaDAO Invoice <hello@heirvault.pro>
```

## 📧 Email Types to Test

| Action | Email Type | Recipient | Test By |
|--------|-----------|-----------|---------|
| Submit Invoice | `invoice_pending` | Admin | Create & submit invoice |
| Approve Invoice | `invoice_approved` | User | Admin approves invoice |
| Reject Invoice | `invoice_rejected` | User | Admin rejects invoice |
| Mark Paid | `invoice_paid` | User | Admin marks as paid |
| Void Invoice | `invoice_voided` | User | Admin voids invoice |
| Cancel Invoice | `invoice_cancelled` | Admin | User cancels invoice |

## ⚡ Quick Browser Console Test

Open app → F12 → Console:

```javascript
// Replace with real invoice ID
const invoiceId = 'YOUR_INVOICE_ID'

// Test email
const result = await supabase.functions.invoke('send-email', {
  body: {
    type: 'invoice_pending',
    invoiceId: invoiceId,
    notes: 'Test from console'
  }
})

console.log(result)
```

Expected: `{ data: { success: true, data: { id: '...' } } }`

## 🐛 If Emails Still Don't Work

1. **Check Resend API Key**
   - Valid and not expired?
   - Has sending permissions?

2. **Check FROM_EMAIL Domain**
   - Domain verified in Resend?
   - Using verified domain?

3. **Check Recipient Email**
   - Not in spam folder?
   - Valid email address?

4. **Check Supabase Logs**
   - Any error messages?
   - Function invoked successfully?

5. **Check Resend Dashboard**
   - Email sent?
   - Delivery status?
   - Any bounces?

## 📊 Success Indicators

✅ CORS OPTIONS returns 200
✅ Function logs show successful invocations
✅ Resend dashboard shows sent emails
✅ Emails received in inbox
✅ Email styling looks good
✅ Links in emails work

## 🔗 Quick Links

- [Supabase Functions](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions)
- [Resend Dashboard](https://resend.com/emails)
- [App URL](https://celo-invoice.netlify.app)
- [Full Test Guide](./EMAIL_FUNCTION_TEST_GUIDE.md)

---

**Status:** ✅ Fixed & Deployed
**Next:** Test in production by creating/approving invoices
