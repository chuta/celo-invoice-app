# Email Template Setup Guide

## Overview

Beautiful, branded email confirmation templates that match the new Celo-inspired landing page design.

## Templates Created

### 1. Full HTML Template
**File:** `email-templates/confirmation-email.html`
- Complete, feature-rich email design
- Includes all branding elements
- Best for custom email services
- ~8KB in size

### 2. Compact Supabase Template
**File:** `email-templates/supabase-confirmation-template.html`
- Optimized for Supabase email templates
- Inline CSS for better compatibility
- Smaller file size
- All essential features included

### 3. Plain Text Template
**File:** `email-templates/confirmation-email.txt`
- Fallback for email clients without HTML support
- Clean, readable format
- All essential information included

## Design Features

### Visual Elements

1. **Celo Brand Colors**
   - Gradient background: Yellow (#FCFF52) → Orange (#FBCC5C) → Green (#35D07F)
   - Accent color: Celo Green (#35D07F)
   - Clean white content area

2. **CeloAfricaDAO Logo**
   - Prominently displayed in header
   - Rounded corners with shadow
   - Responsive sizing

3. **Modern Layout**
   - Split sections with gradient borders
   - Card-based feature highlights
   - Rounded corners throughout
   - Professional spacing

### Content Sections

1. **Header**
   - Logo
   - Welcome message
   - Platform name

2. **Main Content**
   - Personalized greeting
   - Clear call-to-action button
   - Feature highlights with icons
   - Alternative link (for accessibility)
   - Security notice

3. **Footer**
   - Company information
   - Social media links
   - Copyright notice

### Interactive Elements

1. **CTA Button**
   - Gradient background (Green to Yellow)
   - Large, easy to click
   - Hover effects (in supported clients)
   - High contrast text

2. **Feature Cards**
   - Three key benefits
   - Icon + Title + Description
   - Light background for separation

3. **Security Notice**
   - Yellow warning background
   - Important information highlighted
   - Clear expiration notice

## Implementation Guide

### Option 1: Supabase Email Templates (Recommended)

1. **Access Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to Authentication → Email Templates

2. **Update Confirmation Email Template**
   - Select "Confirm signup" template
   - Copy content from `supabase-confirmation-template.html`
   - Paste into the template editor

3. **Configure Variables**
   Supabase provides these variables automatically:
   - `{{ .ConfirmationURL }}` - The confirmation link
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email (optional to use)

4. **Test the Template**
   - Create a test account
   - Check email rendering
   - Test the confirmation link
   - Verify on mobile devices

### Option 2: Custom Email Service

If using a custom email service (SendGrid, Mailgun, etc.):

1. **Upload Logo**
   - Ensure `celologo.jpg` is publicly accessible
   - Update the image U