# Payment Requests Feature - Complete Guide

## 🎯 Overview
This feature allows users to receive payment requests through their personalized payment links (`/pay/username`). Requests are stored in the database and displayed in a dedicated UI where users can review and convert them into invoices.

## 📁 Documentation Files

### Quick Start
- **`QUICK_FIX_PAYMENT_REQUESTS.md`** - 2-minute quick fix guide
- **`apply-payment-requests-fix.sh`** - Interactive bash script

### Detailed Guides
- **`FIX_PAYMENT_REQUESTS_DISPLAY.md`** - Complete fix documentation
- **`APPLY_PAYMENT_REQUESTS_FIX_CHECKLIST.md`** - Step-by-step checklist
- **`PAYMENT_REQUESTS_FIX_SUMMARY.md`** - Technical summary

### Technical Documentation
- **`PAYMENT_REQUESTS_DATA_FLOW.md`** - Architecture and data flow
- **`diagnose-payment-requests.sql`** - Diagnostic queries
- **`fix-payment-requests-display.sql`** - Main fix script ⭐
- **`sync-analytics-to-requests.sql`** - Manual sync utility

## 🚀 Quick Start (3 Steps)

### Step 1: Apply Database Fix
```bash
# Open Supabase SQL Editor and run:
cat fix-payment-requests-display.sql
```

### Step 2: Verify Code Changes
The following files have been updated:
- ✅ `src/App.jsx` - Route added
- ✅ `src/components/Layout.jsx` - Navigation link added
- ✅ `src/pages/PaymentRequests.jsx` - UI improvements

### Step 3: Test
```bash
# Start dev server
npm run dev

# Navigate to:
http://localhost:5173/payment-requests
```

## 🏗️ Architecture

### Data Flow
```
User visits /pay/username
    ↓
Submits payment request
    ↓
Stored in TWO places:
    ├─> public_payment_requests (UI display)
    └─> payment_link_analytics (analytics)
    ↓
Displayed in /payment-requests
    ↓
User creates invoice
    ↓
Request marked as completed
```

### Database Tables

#### `public_payment_requests` (Primary)
Stores payment requests for UI display and processing.

#### `payment_link_analytics` (Secondary)
Tracks all events (views, payments, shares) for analytics.

## 🔧 Features

### For Recipients (Users)
- ✅ View all payment requests in one place
- ✅ Filter by status (pending, completed, rejected)
- ✅ Create invoices from requests with one click
- ✅ Auto-create clients if they don't exist
- ✅ Reject unwanted requests
- ✅ View stats (total requests, amounts, pending count)
- ✅ Link to created invoices

### For Payers (Public)
- ✅ Submit payment requests via `/pay/username`
- ✅ No account required
- ✅ Simple form (name, email, amount, description)
- ✅ Instant confirmation

## 📱 UI Components

### Navigation
- Desktop: Sidebar menu item "Payment Requests" (💰)
- Mobile: Bottom navigation "Payment Requests" (💰)

### Payment Requests Page
- Header with refresh button
- Status filter dropdown
- Request cards with:
  - Payer information
  - Amount and currency
  - Description
  - Status badge
  - Action buttons
- Stats cards at bottom

### Actions
- **Create Invoice** - Converts request to invoice
- **Reject** - Marks request as expired
- **View Invoice** - Links to created invoice (completed requests)

## 🔒 Security

### RLS Policies
```sql
-- Users can only see their own requests
SELECT: auth.uid() = recipient_user_id

-- Anyone can create requests (public links)
INSERT: true

-- Users can only update their own requests
UPDATE: auth.uid() = recipient_user_id
```

## 🧪 Testing

### Manual Test
1. Get your username from Settings → Payment Link
2. Open `/pay/your-username` in incognito window
3. Submit a test payment request
4. Go to `/payment-requests` in logged-in browser
5. Verify request appears
6. Click "Create Invoice"
7. Verify invoice is created

### Automated Checks
```sql
-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'public_payment_requests'
);

-- Check your requests
SELECT * FROM public_payment_requests 
WHERE recipient_user_id = auth.uid();

-- Check analytics
SELECT * FROM payment_link_analytics 
WHERE event_type = 'payment' 
AND user_id = auth.uid();
```

## 🐛 Troubleshooting

### Problem: Requests not showing
**Solution:** Run `fix-payment-requests-display.sql`

### Problem: Can't create invoice
**Solution:** Check browser console for errors, verify RLS policies

### Problem: Route not found
**Solution:** Verify `src/App.jsx` has PaymentRequests route

### Problem: No navigation link
**Solution:** Verify `src/components/Layout.jsx` has Payment Requests item

## 📊 Analytics

Track payment request metrics:
```sql
-- Get stats for a user
SELECT * FROM get_payment_request_stats('user-uuid');

-- View with profile info
SELECT * FROM payment_requests_with_profile
WHERE recipient_user_id = 'user-uuid';

-- Payment link stats
SELECT * FROM payment_link_stats
WHERE user_id = 'user-uuid';
```

## 🔄 Workflow

### Complete User Journey
1. **Setup** → Enable payment link in settings
2. **Share** → Share `/pay/username` link
3. **Receive** → Someone submits payment request
4. **Review** → View in Payment Requests page
5. **Process** → Create invoice or reject
6. **Track** → Monitor in analytics

## 📈 Future Enhancements

Potential improvements:
- Email notifications for new requests
- Automatic invoice creation option
- Request expiration reminders
- Bulk actions (approve/reject multiple)
- Export requests to CSV
- Request templates
- Custom fields

## 🆘 Support

### Documentation
- Read all `.md` files in this directory
- Check SQL scripts for database queries
- Review code comments in source files

### Debugging
1. Check browser console
2. Check Supabase logs
3. Run diagnostic script
4. Verify RLS policies
5. Check authentication

### Common Issues
- **404 on route:** Check App.jsx routing
- **Empty list:** Run fix script, check database
- **Can't create invoice:** Check RLS policies
- **No navigation link:** Check Layout.jsx

## ✅ Checklist

Before going to production:
- [ ] Database fix applied
- [ ] Code changes deployed
- [ ] Routes working
- [ ] Navigation visible
- [ ] Can view requests
- [ ] Can create invoices
- [ ] Can reject requests
- [ ] Stats displaying correctly
- [ ] Mobile responsive
- [ ] Tested end-to-end

## 📝 Notes

- Payment requests expire after 7 days by default
- Requests are auto-approved when converted to invoices
- Clients are auto-created if they don't exist
- Analytics tracks all events separately
- RLS ensures users only see their own data

---

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Ready for Production
