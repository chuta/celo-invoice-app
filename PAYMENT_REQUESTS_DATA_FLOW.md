# Payment Requests - Data Flow

## Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Link Flow                         │
└─────────────────────────────────────────────────────────────┘

1. User visits: /pay/username
   │
   ├─> Fetches public profile (get_public_profile function)
   ├─> Tracks view event → payment_link_analytics
   └─> Increments view counter on profile

2. User submits payment request form
   │
   ├─> Creates entry in public_payment_requests ✅ PRIMARY
   │   └─> Fields: payer_name, payer_email, amount, description
   │
   ├─> Tracks payment event → payment_link_analytics 📊 ANALYTICS
   │   └─> Fields: event_type='payment', event_data (JSON)
   │
   └─> Increments payment counter on profile

3. Recipient views: /payment-requests
   │
   └─> Fetches from public_payment_requests table
       └─> Displays all pending/completed/expired requests

4. Recipient processes request
   │
   ├─> Creates client (if new)
   ├─> Creates invoice
   └─> Updates request status to 'completed'
```

## Database Tables

### `public_payment_requests` (Primary Storage)
**Purpose:** Store payment requests for UI display and processing

```sql
CREATE TABLE public_payment_requests (
  id UUID PRIMARY KEY,
  recipient_user_id UUID,      -- Who receives the payment
  payer_name VARCHAR(200),      -- Who is paying
  payer_email VARCHAR(255),     -- Payer contact
  amount DECIMAL(10, 2),        -- Payment amount
  currency VARCHAR(10),         -- Default: cUSD
  description TEXT,             -- What it's for
  status VARCHAR(50),           -- pending/completed/expired
  invoice_id UUID,              -- Linked invoice (after processing)
  payment_link VARCHAR(100),    -- Username used
  expires_at TIMESTAMP,         -- Auto-expire after 7 days
  completed_at TIMESTAMP,       -- When processed
  created_at TIMESTAMP          -- When submitted
);
```

### `payment_link_analytics` (Analytics Tracking)
**Purpose:** Track all events for analytics and reporting

```sql
CREATE TABLE payment_link_analytics (
  id UUID PRIMARY KEY,
  user_id UUID,                 -- Profile owner
  event_type VARCHAR(50),       -- 'view', 'payment', 'share'
  event_data JSONB,             -- Event details
  ip_address INET,              -- Visitor IP
  user_agent TEXT,              -- Browser info
  referrer TEXT,                -- Where they came from
  created_at TIMESTAMP          -- When it happened
);
```

## Data Relationships

```
profiles
   │
   ├─> username (unique)
   ├─> payment_link_enabled
   ├─> payment_link_views (counter)
   └─> payment_link_payments (counter)
        │
        ├─────────────────────────────┐
        │                             │
        ▼                             ▼
public_payment_requests      payment_link_analytics
   │                             │
   ├─> recipient_user_id         ├─> user_id
   ├─> status                    ├─> event_type
   ├─> amount                    └─> event_data
   └─> invoice_id                      └─> {amount, payer_email, etc}
        │
        ▼
    invoices
```

## Why Two Tables?

### `public_payment_requests` (Operational)
- ✅ Structured data for easy querying
- ✅ Direct relationship to invoices
- ✅ Status tracking (pending → completed)
- ✅ Optimized for UI display
- ✅ Can be updated (status changes)

### `payment_link_analytics` (Analytics)
- 📊 Tracks ALL events (views, payments, shares)
- 📊 Immutable event log
- 📊 Flexible JSONB for any event data
- 📊 Includes visitor metadata (IP, user agent)
- 📊 Used for reporting and insights

## The Problem We Fixed

### Before Fix:
```
Payment submitted
   │
   ├─> ❌ public_payment_requests table missing
   │      (or RLS blocking access)
   │
   └─> ✅ payment_link_analytics recorded
          (but UI only reads from public_payment_requests)

Result: Data stored but not visible! 😞
```

### After Fix:
```
Payment submitted
   │
   ├─> ✅ public_payment_requests created
   │      (UI can display it)
   │
   └─> ✅ payment_link_analytics recorded
          (for analytics)

Result: Data visible and actionable! 🎉
```

## Migration Strategy

The fix script migrates historical data:

```sql
-- Find payment events in analytics
SELECT * FROM payment_link_analytics 
WHERE event_type = 'payment'

-- Create corresponding requests
INSERT INTO public_payment_requests (...)
SELECT 
  user_id,
  event_data->>'payer_name',
  event_data->>'payer_email',
  event_data->>'amount',
  ...
FROM payment_link_analytics
WHERE event_type = 'payment'
  AND NOT EXISTS (already in requests table)
```

## User Journey

### 1. Setup (One-time)
```
User → Settings → Payment Link Settings
  ├─> Choose username
  ├─> Enable public profile
  ├─> Add bio/tagline
  └─> Upload profile picture
```

### 2. Share Link
```
User → Payment Link Settings → Share
  ├─> Copy link: /pay/username
  ├─> Generate QR code
  └─> Share on social media
```

### 3. Receive Payment Request
```
Someone visits /pay/username
  ├─> Views profile
  ├─> Fills payment form
  └─> Submits request
       │
       └─> Stored in public_payment_requests
```

### 4. Process Request
```
User → Payment Requests page
  ├─> See all pending requests
  ├─> Click "Create Invoice"
  │    ├─> Creates/finds client
  │    ├─> Creates invoice
  │    └─> Updates request status
  └─> Invoice ready for payment
```

## Security (RLS Policies)

### `public_payment_requests`
```sql
-- Users can only see their own requests
SELECT: auth.uid() = recipient_user_id

-- Anyone can create requests (public payment links)
INSERT: true

-- Users can only update their own requests
UPDATE: auth.uid() = recipient_user_id
```

### `payment_link_analytics`
```sql
-- Users can only see their own analytics
SELECT: auth.uid() = user_id

-- Anyone can insert analytics (tracking)
INSERT: true
```

## Performance Optimizations

### Indexes Created:
```sql
-- Fast lookup by recipient
idx_public_payment_requests_recipient (recipient_user_id)

-- Filter by status
idx_public_payment_requests_status (status)

-- Search by email
idx_public_payment_requests_payer_email (payer_email)

-- Sort by date
idx_public_payment_requests_created_at (created_at DESC)
```

## Monitoring & Analytics

### Key Metrics:
- Total payment requests received
- Pending vs completed ratio
- Average request amount
- Time to process requests
- Conversion rate (requests → invoices)

### Query Examples:
```sql
-- Get stats for a user
SELECT * FROM get_payment_request_stats('user-uuid');

-- View payment requests with profile info
SELECT * FROM payment_requests_with_profile
WHERE recipient_user_id = 'user-uuid';

-- Analytics summary
SELECT * FROM payment_link_stats
WHERE user_id = 'user-uuid';
```

---

**This architecture ensures:**
- ✅ Data integrity (structured storage)
- ✅ UI performance (optimized queries)
- ✅ Analytics capability (event tracking)
- ✅ Security (RLS policies)
- ✅ Scalability (indexed tables)
