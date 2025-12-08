# ⚠️ ACTION REQUIRED: Set Multiple Admin Emails

## 🎯 What You Need to Do

Set the `ADMIN_EMAILS` environment variable in Supabase to enable both admins to receive email notifications.

## ⚡ Quick Steps (2 minutes)

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/settings/functions

### 2. Add/Update Secret
- Click on **Edge Functions** settings
- Find or create secret: `ADMIN_EMAILS`
- Set value to:
  ```
  blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
  ```
- Click **Save**

### 3. Test It
Create a test invoice and verify both admins receive the notification email.

## ✅ What's Already Done

- ✅ Edge function code updated to support multiple emails
- ✅ Function deployed to Supabase
- ✅ Backward compatibility maintained
- ✅ Documentation created
- ✅ Code committed and pushed to GitHub

## 📧 Result

After setting the environment variable:

**Before:**
- Only blockspacetechnologies@gmail.com receives admin notifications

**After:**
- Both blockspacetechnologies@gmail.com AND brisamukunde1@gmail.com receive admin notifications

## 🔍 How to Verify

### Check Environment Variable
```bash
supabase secrets list
```

Should show:
```
ADMIN_EMAILS=blockspacetechnologies@gmail.com, brisamukunde1@gmail.com
```

### Test Email Delivery
1. Login to app as regular user
2. Create and submit an invoice
3. Check both admin inboxes
4. Both should receive "📋 New Invoice Submitted" email

### Check Resend Dashboard
1. Go to: https://resend.com/emails
2. Find recent email
3. "To" field should show both recipients
4. Both should show "Delivered" status

## 📋 Admin Notifications

These emails will go to BOTH admins:

| Event | Email Subject | When |
|-------|--------------|------|
| Invoice Pending | 📋 New Invoice Submitted | User submits invoice for approval |
| Invoice Cancelled | 🚫 Invoice Cancelled | User cancels their invoice |

## 🔗 Quick Links

- **Set Variable:** [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/settings/functions)
- **View Logs:** [Function Logs](https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/functions)
- **Check Emails:** [Resend Dashboard](https://resend.com/emails)
- **Test App:** [Production App](https://celo-invoice.netlify.app)

## 📚 Documentation

- [SETUP_MULTIPLE_ADMINS.md](./SETUP_MULTIPLE_ADMINS.md) - Quick setup guide
- [MULTIPLE_ADMIN_EMAILS.md](./MULTIPLE_ADMIN_EMAILS.md) - Complete documentation
- [EMAIL_FUNCTION_TEST_GUIDE.md](./EMAIL_FUNCTION_TEST_GUIDE.md) - Testing guide

## 🆘 Need Help?

If you encounter issues:
1. Check [MULTIPLE_ADMIN_EMAILS.md](./MULTIPLE_ADMIN_EMAILS.md) troubleshooting section
2. Verify both email addresses are correct
3. Check Supabase function logs for errors
4. Ensure Resend API key is valid

---

**Priority:** 🔴 High
**Time Required:** 2 minutes
**Status:** Waiting for environment variable to be set
**Next Step:** Set `ADMIN_EMAILS` in Supabase Dashboard
