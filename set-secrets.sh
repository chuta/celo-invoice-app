#!/bin/bash

# CeloAfricaDAO Invoice App - Set Supabase Secrets
# This script helps you set environment variables for Edge Functions

echo "🔐 Setting Supabase Secrets for Edge Functions"
echo "=============================================="
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Please install it first: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Prompt for Resend API Key
echo "📧 Step 1: Resend API Key"
echo "Get your API key from: https://resend.com/api-keys"
read -p "Enter your Resend API Key (starts with re_): " RESEND_API_KEY

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ Error: Resend API Key is required"
    exit 1
fi

# Prompt for Admin Email
echo ""
echo "👤 Step 2: Admin Email"
read -p "Enter admin email [admin@celoafricadao.org]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@celoafricadao.org}

# Prompt for App URL
echo ""
echo "🌐 Step 3: App URL"
read -p "Enter your app URL (e.g., https://your-app.com): " APP_URL

if [ -z "$APP_URL" ]; then
    echo "❌ Error: App URL is required"
    exit 1
fi

# Prompt for From Email
echo ""
echo "📨 Step 4: From Email"
echo "For development, use: CeloAfricaDAO Invoice <onboarding@resend.dev>"
echo "For production, use your verified domain: CeloAfricaDAO Invoice <noreply@yourdomain.com>"
read -p "Enter from email [CeloAfricaDAO Invoice <onboarding@resend.dev>]: " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-"CeloAfricaDAO Invoice <onboarding@resend.dev>"}

# Confirm settings
echo ""
echo "📋 Review Your Settings:"
echo "========================"
echo "Resend API Key: ${RESEND_API_KEY:0:10}..."
echo "Admin Email: $ADMIN_EMAIL"
echo "App URL: $APP_URL"
echo "From Email: $FROM_EMAIL"
echo ""

read -p "Are these settings correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Aborted. Please run the script again."
    exit 0
fi

# Set secrets
echo ""
echo "🚀 Setting secrets..."
echo ""

supabase secrets set \
  RESEND_API_KEY="$RESEND_API_KEY" \
  ADMIN_EMAIL="$ADMIN_EMAIL" \
  APP_URL="$APP_URL" \
  FROM_EMAIL="$FROM_EMAIL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secrets set successfully!"
    echo ""
    echo "📊 Verify your secrets:"
    echo "supabase secrets list"
    echo ""
    echo "🧪 Test your email function:"
    echo "See EDGE_FUNCTIONS_DEPLOYED.md for testing instructions"
    echo ""
    echo "🎉 Your Edge Functions are ready to send emails!"
else
    echo ""
    echo "❌ Error setting secrets"
    echo "Please check your Supabase CLI authentication and try again"
    exit 1
fi
