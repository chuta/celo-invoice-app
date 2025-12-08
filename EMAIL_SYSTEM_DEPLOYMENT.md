# Email System Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the complete email notification system for your CeloAfricaDAO Invoice Management app.

## Prerequisites

- ✅ Supabase project set up
- ✅ Resend account created ([resend.com](https://resend.com))
- ✅ Domain verified in Resend (for production)
- ✅ Supabase CLI installed

## Step 1: Get Resend API Key

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create a free account
   - Verify your email

2. **Get API Key**
   - Go to API Keys section
   - Click "Create API Key"
   - Name it "CeloAfricaDAO Invoice"
   - Copy the API key (starts with `re_`)

3. **Verify Domain (Production Only)**
   - Go to Domains section
   - Add your domain
   - Add DNS records as instructed
   - Wait for verification

## Step 2: Deploy Edge Function

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to your project
cd celo-invoice-app

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the send-email function
supabase functions deploy send-email

# Set environment variables
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set ADMIN_EMAIL=admin@celoafricadao.org
supabase secrets set APP_URL=https://your-app-url.com
supabase secrets set FROM_EMAIL="CeloAfricaDAO Invoice <onboarding@resend.dev>"
```

### Option B: Using Supabase Dashboard

1. **Upload Function**
   - Go to Supabase Dashboard → Edge Functions
   - Click "Deploy new function"
   - Name: `send-email`
   - Upload `supabase/functions/send-email/index.ts`

2. **Set Environment Variables**
   - Go to Edge Functions → send-email → Settings
   - Add secrets:
     - `RESEND_API_KEY`: Your Resend API key
     - `ADMIN_EMAIL`: admin@celoafricadao.org
     - `APP_URL`: Your app URL
     - `FROM_EMAIL`: CeloAfricaDAO Invoice <onboarding@resend.dev>

## Step 3: Configure Environment Variables

### Development (.env.local)

```bash
# Resend API Key
RESEND_API_KEY=re_your_dev_api_key

# Admin Email
ADMIN_EMAIL=admin@celoafricadao.org

# App URL
APP_URL=http://localhost:5173

# From Email (use Resend's test email for dev)
FROM_EMAIL=CeloAfricaDAO Invoice <onboarding@resend.dev>
```

### Production (Supabase Secrets)

```bash
# Set production secrets
supabase secrets set RESEND_API_KEY=re_your_prod_api_key
supabase secrets set ADMIN_EMAIL=admin@celoafricadao.org
supabase secrets set APP_URL=https://your-production-url.com
supabase secrets set FROM_EMAIL="CeloAfricaDAO Invoice <noreply@yourdomain.com>"
```

## Step 4: Test Email System

### Test 1: Submit Invoice (Pending)

```bash
# Create a test invoice and submit it
# Check admin email for notification
```

### Test 2: Approve Invoice

```bash
# As admin, approve the test invoice
# Check user email for approval notification
```

### Test 3: All Email Types

Test each email type:
- [ ] Pending (submit invoice)
- [ ] Approved (approve invoice)
- [ ] Rejected (reject invoice)
- [ ] Voided (void invoice)
- [ ] Paid (mark as paid)
- [ ] Cancelled (cancel invoice)
- [ ] Recurring (auto-generated)

### Test Using cURL

```bash
# Test the Edge Function directly
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice_pending",
    "invoiceId": "your-test-invoice-id",
    "notes": "Test notes"
  }'
```

## Step 5: Verify Deployment

### Check Edge Function Logs

```bash
# View logs
supabase functions logs send-email

# Follow logs in real-time
supabase functions logs send-email --follow
```

### Check Resend Dashboard

1. Go to Resend Dashboard
2. Check "Emails" section
3. Verify emails are being sent
4. Check delivery status

### Test Email Delivery

1. Submit a test invoice
2. Check spam folder if not in inbox
3. Verify email formatting
4. Test all links in email
5. Check mobile display

## Step 6: Production Checklist

### Before Going Live

- [ ] Resend API key set in production
- [ ] Domain verified in Resend
- [ ] FROM_EMAIL uses verified domain
- [ ] ADMIN_EMAIL is correct
- [ ] APP_URL points to production
- [ ] All email types tested
- [ ] Mobile display verified
- [ ] Spam score checked
- [ ] DNS records configured (SPF, DKIM, DMARC)

### DNS Configuration

Add these DNS records for your domain:

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record (provided by Resend)
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

## Troubleshooting

### Issue: Emails Not Sending

**Solution:**
1. Check Resend API key is correct
2. Verify Edge Function is deployed
3. Check Edge Function logs for errors
4. Ensure FROM_EMAIL is valid

```bash
# Check secrets
supabase secrets list

# Check function status
supabase functions list

# View error logs
supabase functions logs send-email --limit 50
```

### Issue: Emails Going to Spam

**Solution:**
1. Verify domain in Resend
2. Configure SPF, DKIM, DMARC
3. Use verified FROM_EMAIL
4. Avoid spam trigger words
5. Test with [mail-tester.com](https://www.mail-tester.com/)

### Issue: Wrong Email Content

**Solution:**
1. Check invoice data in database
2. Verify Edge Function code
3. Test with different invoice IDs
4. Check for null values in data

### Issue: Slow Email Delivery

**Solution:**
1. Check Resend status page
2. Verify Edge Function performance
3. Check database query performance
4. Monitor Supabase logs

## Monitoring

### Set Up Monitoring

1. **Resend Dashboard**
   - Monitor delivery rates
   - Check bounce rates
   - Track failed deliveries

2. **Supabase Logs**
   - Monitor Edge Function errors
   - Track invocation count
   - Check response times

3. **Application Logs**
   - Log email send attempts
   - Track success/failure rates
   - Monitor user feedback

### Key Metrics to Track

- Email delivery rate (target: >95%)
- Average delivery time (target: <5 seconds)
- Bounce rate (target: <2%)
- Error rate (target: <1%)
- User engagement (opens, clicks)

## Cost Estimation

### Resend Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for testing and small deployments

**Pro Tier ($20/month):**
- 50,000 emails/month
- $1 per additional 1,000 emails
- Custom domains
- Priority support

### Supabase Edge Functions

**Free Tier:**
- 500,000 invocations/month
- 2GB bandwidth
- Sufficient for most use cases

**Pro Tier ($25/month):**
- 2,000,000 invocations/month
- 8GB bandwidth
- Better performance

## Security Best Practices

1. **API Keys**
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly
   - Use different keys for dev/prod

2. **Email Content**
   - Sanitize user input
   - Validate email addresses
   - Prevent email injection
   - Rate limit email sending

3. **Access Control**
   - Verify user permissions
   - Check invoice ownership
   - Validate request data
   - Log all email sends

## Maintenance

### Regular Tasks

**Weekly:**
- Check email delivery rates
- Review error logs
- Monitor bounce rates

**Monthly:**
- Review Resend usage
- Check Supabase quotas
- Update email templates
- Test all email types

**Quarterly:**
- Review and update content
- Check spam scores
- Update DNS records
- Review security practices

## Support

### Getting Help

**Resend Support:**
- Documentation: [resend.com/docs](https://resend.com/docs)
- Discord: [resend.com/discord](https://resend.com/discord)
- Email: support@resend.com

**Supabase Support:**
- Documentation: [supabase.com/docs](https://supabase.com/docs)
- Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub: [github.com/supabase/supabase](https://github.com/supabase/supabase)

## Next Steps

After deployment:
1. ✅ Test all email types
2. ✅ Monitor delivery rates
3. ✅ Gather user feedback
4. ✅ Optimize email content
5. ✅ Set up alerts for failures
6. ✅ Document any issues
7. ✅ Train team on email system

## Conclusion

Your email notification system is now deployed and ready for production! 🎉

All invoice status changes will automatically trigger beautiful, branded email notifications to keep users and admins informed.

---

**Need Help?** Check the troubleshooting section or contact support.
**Found a Bug?** Create an issue in the GitHub repository.
**Have Feedback?** We'd love to hear from you!
