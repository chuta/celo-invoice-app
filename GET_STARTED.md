# 🚀 Get Started with CELOAfricaDAO Invoice App

Welcome! This guide will get you up and running in minutes.

## 📋 Prerequisites

- Node.js 20+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))
- A code editor (VS Code recommended)

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd celo-invoice-app
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Wait ~2 minutes for setup

2. **Run the database schema:**
   - In Supabase dashboard, go to **SQL Editor**
   - Open `supabase-schema.sql` from this project
   - Copy all contents and paste into SQL Editor
   - Click **Run**

3. **Get your API credentials:**
   - Go to **Settings > API**
   - Copy **Project URL** and **anon/public key**

### Step 3: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_PROJECT_ID=pijcliprhnxulqctfeik
VITE_SUPABASE_URL=https://pijcliprhnxulqctfeik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpamNsaXByaG54dWxxY3RmZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTgxMjMsImV4cCI6MjA4MDY3NDEyM30.9jz2COrneWyw-0Q0kbGowDl8kENcbIhtE_iKSUYKE1Y

VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpamNsaXByaG54dWxxY3RmZWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA5ODEyMywiZXhwIjoyMDgwNjc0MTIzfQ.Et2zNRikItqlAVchYXHTMkmkjPhe0HjuN4Fs3Q0gYGA
```

### Step 4: Start the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

### Step 5: Create Your Account

1. Click **Sign up**
2. Enter your details
3. You're in! 🎉

### Step 6: Make Yourself Admin

1. Go to Supabase dashboard
2. Navigate to **Table Editor > profiles**
3. Find your user (search by email)
4. Change `role` from `user` to `admin`
5. Refresh the app

You now have full admin access!

## 📚 What to Read Next

Depending on what you need:

### For Quick Setup
→ **QUICKSTART.md** - Detailed 10-minute setup guide

### For Supabase Configuration
→ **SUPABASE_SETUP.md** - Complete Supabase setup including Google OAuth

### For Understanding the Project
→ **PROJECT_STRUCTURE.md** - Architecture and code organization

### For Development
→ **DEVELOPMENT_CHECKLIST.md** - Track progress and see what's next

### For Overview
→ **README.md** - Complete project documentation

## 🎯 What Works Now

✅ User registration and login
✅ Google OAuth (if configured)
✅ Dashboard with statistics
✅ User settings and profile
✅ Wallet address configuration
✅ Role-based access (Admin/User)
✅ Secure authentication

## 🚧 What's Coming Next (Phase 2)

- Client management (add/edit/delete clients)
- Invoice creation with line items
- Invoice preview and submission
- Invoice list and filtering
- Admin approval workflow

## 🆘 Need Help?

**App won't start?**
- Check Node.js version: `node --version` (need 20+)
- Make sure you ran `npm install`
- Verify `.env` file exists with correct values

**Can't connect to Supabase?**
- Double-check your `.env` credentials
- Restart dev server after changing `.env`
- Verify Supabase project is active (not paused)

**Login not working?**
- Check browser console for errors
- Verify database schema was created
- Make sure you can see tables in Supabase Table Editor

**More help:**
- Check **QUICKSTART.md** for detailed troubleshooting
- Review **SUPABASE_SETUP.md** for Supabase issues
- Check browser console for error messages

## 🎨 Project Features

### For Regular Users
- Create and manage invoices
- Track invoice status
- Manage client information
- Configure payment wallet
- View dashboard statistics

### For Admins
- All user features, plus:
- Approve/reject invoices
- View all users' invoices
- Export invoices to CSV
- Manage user roles

## 🔐 Security

- Row Level Security (RLS) in database
- JWT authentication
- Role-based access control
- Secure environment variables
- Protected API endpoints

## 📱 Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** TailwindCSS
- **Backend:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + Google)
- **Routing:** React Router v6
- **Hosting:** Netlify-ready

## 🚀 Deploy to Production

When you're ready:

```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

Then deploy to Netlify:
1. Push code to GitHub
2. Connect repo to Netlify
3. Add environment variables
4. Deploy!

## 📖 Documentation Index

| Document | Purpose |
|----------|---------|
| **GET_STARTED.md** | This file - quick start |
| **QUICKSTART.md** | Detailed 10-min setup |
| **README.md** | Complete documentation |
| **SUPABASE_SETUP.md** | Supabase configuration |
| **PROJECT_STRUCTURE.md** | Architecture guide |
| **DEVELOPMENT_CHECKLIST.md** | Development roadmap |
| **PHASE1_COMPLETE.md** | Phase 1 summary |

## 💡 Tips

- Use Chrome DevTools for debugging
- Check Supabase logs for database errors
- Enable email confirmation in Supabase for production
- Set up Google OAuth for better UX
- Test with both admin and regular user accounts

## 🎉 You're Ready!

You now have a working invoice management system. Start by:

1. ✅ Creating your account
2. ✅ Making yourself admin
3. ✅ Exploring the dashboard
4. ✅ Updating your settings
5. 🚀 Building Phase 2 features!

---

**Questions?** Check the other documentation files or review the code comments.

**Ready to build?** See **DEVELOPMENT_CHECKLIST.md** for what's next.

**Happy coding!** 💪
