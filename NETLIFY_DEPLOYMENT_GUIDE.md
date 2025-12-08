# 🚀 Netlify Deployment Guide

## Problem Solved

**Issue:** 404 errors when navigating to inner pages (e.g., `/dashboard`, `/invoices`, etc.)

**Cause:** Single Page Applications (SPAs) use client-side routing. When you refresh or directly access a route like `/dashboard`, Netlify tries to find a file at that path and returns 404.

**Solution:** Configure Netlify to redirect all routes to `index.html`, allowing React Router to handle routing.

## ✅ Files Created

1. **netlify.toml** - Main Netlify configuration
2. **public/_redirects** - Backup redirect rules

Both files ensure your SPA routes work correctly!

## 🔧 Configuration Details

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This tells Netlify:
- Build command: `npm run build`
- Publish directory: `dist` (Vite's output)
- Redirect all routes to `index.html` with 200 status

### public/_redirects

```
/*    /index.html   200
```

Simple redirect rule as a backup.

## 📦 Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push to GitHub** (Already done! ✅)
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"

3. **Connect GitHub**
   - Choose "GitHub"
   - Authorize Netlify
   - Select your repository: `celo-invoice-app`

4. **Configure Build Settings**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `dist` (auto-detected)
   - Click "Deploy site"

5. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. **Trigger Redeploy**
   - Go to Deploys → Trigger deploy → Deploy site

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## 🔐 Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `invoice.celoafricadao.org`)
4. Follow DNS configuration instructions

### DNS Configuration

Add these records to your DNS provider:

```
Type: CNAME
Name: invoice (or @)
Value: your-site-name.netlify.app
```

Or for apex domain:

```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer)
```

### SSL Certificate

Netlify automatically provisions SSL certificates via Let's Encrypt!

## 🧪 Testing After Deployment

### Test Routes

Visit these URLs directly (not by clicking links):

- ✅ `https://your-site.netlify.app/`
- ✅ `https://your-site.netlify.app/dashboard`
- ✅ `https://your-site.netlify.app/invoices`
- ✅ `https://your-site.netlify.app/clients`
- ✅ `https://your-site.netlify.app/settings`
- ✅ `https://your-site.netlify.app/admin`

All should work without 404 errors!

### Test Refresh

1. Navigate to `/dashboard`
2. Refresh the page (F5 or Cmd+R)
3. Should stay on dashboard, not 404

### Test Direct Access

1. Copy a deep link (e.g., `/invoices/123`)
2. Paste in new browser tab
3. Should load correctly

## 📊 Netlify Features

### Automatic Deployments

- Every push to `main` branch triggers a deploy
- Pull requests get preview deployments
- Rollback to any previous deploy

### Deploy Previews

- Each PR gets a unique URL
- Test changes before merging
- Share with team for review

### Analytics

- Page views
- Unique visitors
- Top pages
- Bandwidth usage

### Forms (Future)

If you add forms later:

```html
<form netlify>
  <!-- Netlify handles form submissions -->
</form>
```

## 🔍 Troubleshooting

### Issue: Still Getting 404s

**Solution:**
1. Check `netlify.toml` is in root directory
2. Verify `_redirects` is in `public/` folder
3. Clear Netlify cache: Deploys → Trigger deploy → Clear cache and deploy

### Issue: Environment Variables Not Working

**Solution:**
1. Check variable names start with `VITE_`
2. Redeploy after adding variables
3. Check for typos in variable names

### Issue: Build Fails

**Solution:**
1. Check build logs in Netlify dashboard
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are in `package.json`
4. Try building locally: `npm run build`

### Issue: Blank Page

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase URL and keys are correct
4. Ensure `dist` folder is being published

## 📱 Mobile Testing

After deployment, test on:
- iPhone Safari
- Android Chrome
- iPad
- Various screen sizes

## 🎯 Performance Optimization

### Already Configured

- ✅ Asset caching (1 year)
- ✅ HTML no-cache
- ✅ Gzip compression
- ✅ Image optimization
- ✅ CSS/JS minification

### Additional Optimizations

1. **Enable Netlify Analytics**
   - Site settings → Analytics → Enable

2. **Add Lighthouse Plugin**
   - Already configured in `netlify.toml`
   - Runs performance tests on each deploy

3. **Enable Asset Optimization**
   - Site settings → Build & deploy → Post processing
   - Enable all optimizations

## 🔒 Security Headers

Already configured in `netlify.toml`:

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Content-Security-Policy
- ✅ Referrer-Policy

## 📈 Monitoring

### Netlify Dashboard

Monitor:
- Deploy status
- Build times
- Error rates
- Bandwidth usage

### Supabase Dashboard

Monitor:
- API requests
- Database queries
- Edge Function invocations
- Storage usage

## 🚀 Deployment Checklist

Before going live:

- [ ] `netlify.toml` created
- [ ] `public/_redirects` created
- [ ] Environment variables set
- [ ] Test build locally: `npm run build`
- [ ] Push to GitHub
- [ ] Deploy to Netlify
- [ ] Test all routes
- [ ] Test on mobile
- [ ] Configure custom domain (optional)
- [ ] SSL certificate active
- [ ] Monitor for errors

## 🎉 Success!

Once deployed, your app will:
- ✅ Work on all routes
- ✅ Handle refreshes correctly
- ✅ Support direct URL access
- ✅ Have automatic SSL
- ✅ Deploy on every push
- ✅ Be fast and optimized

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com/)
- [SPA Routing](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)

## 🆘 Need Help?

- Netlify Support: [support.netlify.com](https://support.netlify.com)
- Community Forum: [answers.netlify.com](https://answers.netlify.com)
- Status Page: [netlifystatus.com](https://netlifystatus.com)

---

**Your app is ready to deploy! 🚀**

No more 404 errors on inner pages! 🎉
