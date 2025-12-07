# Project Structure & Architecture

## Directory Structure

```
celo-invoice-app/
├── public/                      # Static assets
│   └── vite.svg
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Layout.jsx          # Main app layout with sidebar
│   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.jsx    # Authentication state & methods
│   │
│   ├── lib/                    # Utilities and configurations
│   │   └── supabase.js        # Supabase client setup
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   └── Settings.jsx       # User settings
│   │
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles (Tailwind)
│
├── .env.example                # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
│
├── supabase-schema.sql        # Database schema
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick setup guide
├── SUPABASE_SETUP.md          # Detailed Supabase guide
└── PROJECT_STRUCTURE.md       # This file
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │  Contexts  │            │
│  │            │  │            │  │            │            │
│  │ - Login    │  │ - Layout   │  │ - Auth     │            │
│  │ - Register │  │ - Protected│  │            │            │
│  │ - Dashboard│  │   Route    │  │            │            │
│  │ - Settings │  │            │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │   Supabase  │                           │
│                   │   Client    │                           │
│                   └──────┬──────┘                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS/WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │    Auth    │  │   Storage  │            │
│  │  Database  │  │  Service   │  │  (Future)  │            │
│  │            │  │            │  │            │            │
│  │ - profiles │  │ - Email    │  │ - Files    │            │
│  │ - clients  │  │ - Google   │  │ - Images   │            │
│  │ - invoices │  │ - JWT      │  │            │            │
│  │ - history  │  │            │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ┌────────────┐  ┌────────────┐                            │
│  │    RLS     │  │   Edge     │                            │
│  │  Policies  │  │ Functions  │                            │
│  │            │  │  (Future)  │                            │
│  │ - User     │  │            │                            │
│  │ - Admin    │  │ - Emails   │                            │
│  │ - Security │  │ - Cron     │                            │
│  └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Action (Login/Register)
    │
    ▼
AuthContext.signIn/signUp()
    │
    ▼
Supabase Auth API
    │
    ▼
JWT Token Generated
    │
    ▼
Profile Fetched from Database
    │
    ▼
User State Updated
    │
    ▼
Redirect to Dashboard
```

### Invoice Creation Flow (Future)

```
User Creates Invoice
    │
    ▼
Form Validation
    │
    ▼
Submit to Supabase
    │
    ▼
Trigger: Auto-generate Invoice Number
    │
    ▼
Insert into invoices table
    │
    ▼
RLS Check: User owns invoice
    │
    ▼
Success Response
    │
    ▼
Update UI
    │
    ▼
(If submitted) Trigger: Email Notification to Admin
```

### Admin Approval Flow (Future)

```
Admin Views Pending Invoices
    │
    ▼
RLS Check: User is Admin
    │
    ▼
Fetch All Pending Invoices
    │
    ▼
Admin Clicks Approve
    │
    ▼
Update invoice status
    │
    ▼
Trigger: Log to invoice_history
    │
    ▼
Trigger: Email Notification to User
    │
    ▼
Update UI
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Login
│   ├── Register
│   └── ProtectedRoute
│       └── Layout
│           ├── Dashboard
│           ├── Invoices (Future)
│           │   ├── InvoiceList
│           │   ├── InvoiceForm
│           │   └── InvoiceDetail
│           ├── Clients (Future)
│           │   ├── ClientList
│           │   └── ClientForm
│           ├── Admin (Future)
│           │   ├── AdminDashboard
│           │   ├── InvoiceApproval
│           │   └── UserManagement
│           └── Settings
```

## State Management

### Global State (Context)
- **AuthContext**: User authentication state, profile, role
  - `user`: Current authenticated user
  - `profile`: User profile data
  - `loading`: Auth loading state
  - `isAdmin`: Boolean for admin check
  - Methods: `signIn`, `signUp`, `signOut`, `updateProfile`

### Local State (Component)
- Form inputs
- Loading states
- Error messages
- UI toggles

### Server State (Supabase)
- Database records
- Real-time subscriptions (future)
- File storage (future)

## Security Layers

### 1. Frontend Protection
- Protected routes (ProtectedRoute component)
- Role-based UI rendering
- Client-side validation

### 2. Backend Protection (Supabase)
- Row Level Security (RLS) policies
- JWT token validation
- Role-based access control

### 3. Database Protection
- Foreign key constraints
- Check constraints
- Triggers for data integrity

## API Endpoints (Supabase)

### Authentication
- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout
- `GET /auth/v1/user` - Get current user

### Database (REST API)
- `GET /rest/v1/profiles` - Get profiles
- `GET /rest/v1/clients` - Get clients
- `GET /rest/v1/invoices` - Get invoices
- `POST /rest/v1/invoices` - Create invoice
- `PATCH /rest/v1/invoices?id=eq.{id}` - Update invoice

### Realtime (WebSocket)
- Subscribe to table changes
- Real-time invoice updates (future)

## Environment Variables

```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Supabase anonymous key
```

## Build & Deployment

### Development
```bash
npm run dev          # Start dev server (port 5173)
npm run lint         # Run ESLint
```

### Production
```bash
npm run build        # Build for production (outputs to /dist)
npm run preview      # Preview production build
```

### Netlify Deployment
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Set in Netlify dashboard

## Database Schema Summary

### profiles
- User account information
- Role (admin/user)
- Wallet address for payments

### clients
- Client contact information
- Linked to user who created them

### invoices
- Invoice details and line items
- Status tracking
- Recurring invoice settings
- Auto-generated invoice numbers

### invoice_history
- Audit log for all invoice changes
- Tracks who made changes and when

## Future Enhancements

### Phase 2: Core Features
- Client CRUD operations
- Invoice creation and management
- Invoice preview

### Phase 3: Recurring Invoices
- Recurring invoice setup
- Auto-generation via Edge Functions
- Cron job integration

### Phase 4: Admin Features
- Admin dashboard
- Bulk invoice approval
- CSV export for Safe payments
- User management

### Phase 5: Polish
- Email notifications (Supabase Edge Functions)
- Real-time updates (Supabase Realtime)
- File attachments (Supabase Storage)
- Advanced filtering and search
- Invoice templates
- Multi-currency support (future)

## Performance Considerations

- Lazy loading for routes (future)
- Pagination for large lists
- Debounced search inputs
- Optimistic UI updates
- Cached queries (React Query - future)

## Testing Strategy (Future)

- Unit tests: Vitest
- Component tests: React Testing Library
- E2E tests: Playwright
- API tests: Supabase test database

## Monitoring & Analytics (Future)

- Error tracking: Sentry
- Analytics: Plausible/PostHog
- Performance: Lighthouse CI
- Uptime: Netlify monitoring
