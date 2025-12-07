# Quick Start Guide

Get your CELOAfricaDAO Invoice Management System up and running in 10 minutes!

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works!)
- Git

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
cd celo-invoice-app
npm install
```

### 2. Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to initialize (~2 minutes)
3. Go to SQL Editor and paste the contents of `supabase-schema.sql`
4. Click "Run" to create all tables and functions

### 3. Configure Environment (1 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to Settings > API in Supabase dashboard
   - Copy Project URL and anon key

3. Update `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```

### 4. Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

## First Steps

### Create Your Account

1. Click "Sign up" on the login page
2. Enter your details and create an account
3. You'll be automatically logged in

### Make Yourself Admin

1. Go to your Supabase dashboard
2. Navigate to Table Editor > profiles
3. Find your user and change `role` to `admin`
4. Refresh the app - you'll now see the Admin menu!

### Configure Your Wallet

1. Click "Settings" in the sidebar
2. Add your cUSD wallet address (where you want to receive payments)
3. Save changes

## What's Working Now

✅ User authentication (email signup/login)
✅ Dashboard with stats
✅ Settings page
✅ User profile management
✅ Role-based access (admin vs user)
✅ Protected routes

## What's Coming Next

🚧 Client management
🚧 Invoice creation
🚧 Invoice approval workflow
🚧 CSV export for bulk payments
🚧 Email notifications
🚧 Recurring invoices

## Optional: Enable Google Sign-In

If you want Google OAuth:

1. Follow the detailed steps in `SUPABASE_SETUP.md`
2. Get Google OAuth credentials from Google Cloud Console
3. Add them to Supabase Authentication > Providers > Google
4. Test by clicking "Sign in with Google" button

## Testing the App

### As a Regular User:
1. Sign up with a new email
2. Explore the dashboard
3. Update your profile in Settings
4. Try to access /admin (you should be redirected)

### As an Admin:
1. Set your role to 'admin' in Supabase
2. Refresh the app
3. You should now see the Admin menu item
4. Access /admin route

## Troubleshooting

**App won't start?**
- Make sure you ran `npm install`
- Check Node.js version: `node --version` (should be 20+)

**Can't connect to Supabase?**
- Verify `.env` file exists and has correct values
- Restart dev server after changing `.env`
- Check Supabase project is active (not paused)

**Login not working?**
- Check browser console for errors
- Verify database schema was created successfully
- Make sure email confirmation is disabled in Supabase (Auth > Settings > Email Auth > Confirm email: OFF for development)

**Google sign-in not working?**
- This is optional - skip it for now if you want
- Follow full setup in SUPABASE_SETUP.md when ready

## Development Tips

- Hot reload is enabled - changes appear instantly
- Check browser console for errors
- Use React DevTools for debugging
- Supabase dashboard shows real-time database changes

## Next Steps

Once you're comfortable with the basics:

1. Read the full `README.md` for detailed documentation
2. Check `SUPABASE_SETUP.md` for advanced Supabase configuration
3. Start building Phase 2 features (Clients & Invoices)

## Need Help?

- Check the main README.md
- Review Supabase documentation
- Check browser console for error messages
- Verify database schema is correctly set up

Happy coding! 🚀
