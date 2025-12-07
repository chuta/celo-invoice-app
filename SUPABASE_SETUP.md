# Supabase Setup Guide

This guide will walk you through setting up Supabase for the CELOAfricaDAO Invoice Management System.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name:** celo-invoice-app (or your preferred name)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to your users
4. Click "Create new project" and wait for setup to complete

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, clients, invoices, invoice_history)
- Row Level Security (RLS) policies
- Functions for invoice numbering and recurring invoices
- Triggers for automatic updates

## Step 3: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication > Providers**
2. Email provider should be enabled by default
3. Configure email templates (optional):
   - Go to **Authentication > Email Templates**
   - Customize "Confirm signup", "Magic Link", etc.

### Enable Google OAuth

1. Go to **Authentication > Providers**
2. Find "Google" and toggle it on
3. You'll need Google OAuth credentials:

#### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure OAuth consent screen if prompted
6. Choose "Web application"
7. Add authorized redirect URIs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   (Replace [YOUR-PROJECT-REF] with your actual Supabase project reference)
8. Copy the Client ID and Client Secret
9. Paste them into Supabase Google provider settings
10. Save

## Step 4: Get API Credentials

1. Go to **Settings > API**
2. Copy the following:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon/public key** (starts with "eyJ...")
3. Add these to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 5: Set Up First Admin User

After running the app and creating your first user:

1. Go to **Table Editor > profiles**
2. Find your user row (search by email)
3. Click on the row to edit
4. Change `role` from `user` to `admin`
5. Save

## Step 6: Configure Email Notifications (Optional)

### Using Supabase's Built-in Email:

Supabase provides email sending for auth emails by default. For custom notifications:

1. Go to **Settings > Auth**
2. Configure SMTP settings if you want to use your own email service
3. Or use Supabase's default (limited to auth emails)

### Using Edge Functions for Custom Emails:

For invoice notifications, you'll need to create Supabase Edge Functions:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

3. Create an edge function for email notifications:
   ```bash
   supabase functions new send-invoice-notification
   ```

4. Implement the function (we'll do this in Phase 5)

## Step 7: Set Up Recurring Invoice Generation (Optional)

For auto-generating recurring invoices, you have two options:

### Option 1: Supabase Edge Function with Cron

1. Create an edge function:
   ```bash
   supabase functions new generate-recurring-invoices
   ```

2. Deploy it:
   ```bash
   supabase functions deploy generate-recurring-invoices
   ```

3. Set up a cron job to call it daily (use a service like cron-job.org or GitHub Actions)

### Option 2: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Configure it to call your Supabase function daily.

## Step 8: Configure Row Level Security (RLS)

RLS is already configured in the schema, but verify:

1. Go to **Authentication > Policies**
2. Check each table has policies enabled
3. Verify policies are working by testing with different user roles

## Step 9: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test user registration
3. Test login with email
4. Test Google OAuth login
5. Verify profile creation
6. Test admin access (after setting first user as admin)

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your `.env` file has correct credentials
- Restart your dev server after changing `.env`

### Issue: "Row Level Security policy violation"
- Check that RLS policies are properly set up
- Verify user is authenticated
- Check user role matches required permissions

### Issue: Google OAuth not working
- Verify redirect URI is correct in Google Console
- Check that Google provider is enabled in Supabase
- Ensure credentials are correctly entered

### Issue: Profile not created after signup
- Check the `profiles` table trigger is working
- Verify RLS policies allow insert
- Check browser console for errors

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use environment variables** for all sensitive data
3. **Keep RLS enabled** on all tables
4. **Regularly review** access policies
5. **Use service_role key** only in secure backend functions
6. **Enable MFA** for admin accounts (in Supabase dashboard)

## Next Steps

Once Supabase is set up:
1. Test authentication flow
2. Create test clients
3. Create test invoices
4. Verify admin can see all data
5. Test CSV export functionality

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Support

For issues specific to this project, check the main README.md or create an issue in the repository.
