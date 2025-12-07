# CELOAfricaDAO Invoice Management System

A modern invoice management platform for CELOAfricaDAO payments, built with React, Vite, TailwindCSS, and Supabase.

## Features

- 🔐 User authentication (Email + Google OAuth)
- 👥 Two user roles: Admin and Regular users
- 📄 Invoice creation (One-time and Recurring)
- 👤 Client management
- 💰 cUSD payment tracking
- 📊 Dashboard with analytics
- 📧 Email notifications
- 📥 CSV export for bulk payments
- ⚙️ User settings and wallet configuration

## Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Functions)
- **Routing:** React Router v6
- **Hosting:** Netlify

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd celo-invoice-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
4. Get your project credentials:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up First Admin User

After creating your first user account:

1. Go to Supabase Dashboard > Table Editor > profiles
2. Find your user and change the `role` from `user` to `admin`

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles with roles and wallet addresses
- **clients** - Client information for invoicing
- **invoices** - Invoice records with line items and status
- **invoice_history** - Audit log for invoice changes

### Invoice Statuses

- `draft` - Invoice being created
- `pending` - Submitted for approval
- `approved` - Approved by admin
- `paid` - Payment completed
- `cancelled` - Cancelled by user
- `voided` - Voided by admin
- `rejected` - Rejected by admin

### Invoice Numbering

Invoices are auto-numbered with format: `YYYY-MM-XXXXX`
- Example: `2025-12-00001`

## Recurring Invoices

Recurring invoices can be set up with the following frequencies:
- Weekly
- Monthly
- Quarterly
- Yearly

A Supabase Edge Function or cron job should call the `generate_recurring_invoices()` function daily to auto-generate new invoices.

## Email Notifications

Email notifications are sent for:
- Invoice submission (to admins)
- Invoice approval (to user)
- Invoice rejection/cancellation (to user)

Configure email templates in Supabase Dashboard > Authentication > Email Templates

## CSV Export for Bulk Payments

Admins can export approved invoices to CSV format for bulk payment processing via [Safe (Gnosis Safe)](https://app.safe.global/).

The CSV includes:
- Recipient wallet address
- Amount in cUSD
- Invoice reference

## Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

Build settings:
- Build command: `npm run build`
- Publish directory: `dist`

## Project Structure

```
celo-invoice-app/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/            # Utilities and configs
│   ├── pages/          # Page components
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── supabase-schema.sql # Database schema
└── package.json
```

## Development Roadmap

### Phase 1: Setup & Auth ✅
- [x] Project setup
- [x] Database schema
- [x] Authentication (Email + Google)
- [x] Basic routing and layout
- [x] Dashboard
- [x] Settings page

### Phase 2: User Features (Next)
- [ ] Client management (CRUD)
- [ ] Invoice creation form
- [ ] Invoice preview
- [ ] User invoice list

### Phase 3: Recurring Invoices
- [ ] Recurring invoice settings
- [ ] Auto-generation function

### Phase 4: Admin Features
- [ ] Admin dashboard
- [ ] Invoice approval workflow
- [ ] CSV export
- [ ] Bulk actions

### Phase 5: Polish
- [ ] Email notifications
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design improvements

## Contributing

This project is maintained by CELOAfricaDAO.

## License

MIT
