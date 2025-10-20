# Vercel Deployment Guide

## ✅ Deployment Status
- **Vercel Project Created**: ✅ fasting
- **GitHub Connected**: ✅ DoubleAces/fasting
- **Auto-deploy Enabled**: ✅ (pushes to 002-website-auth-structure will auto-deploy)

## 🔧 Required: Environment Variables Configuration

Your app **will not work** until you configure these environment variables in Vercel:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/raido-purgas-projects/fasting
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar

### Step 2: Add Environment Variables

Add each of these variables:

#### 1. MONGODB_URI
```
mongodb+srv://your-username:your-password@cluster.mongodb.net/fasting-tracker?retryWrites=true&w=majority
```
- **Where to get it**: MongoDB Atlas dashboard → Connect → Connection String
- **Environment**: Production, Preview, Development (select all)

#### 2. NEXTAUTH_SECRET
Generate a new secure secret for production:
```bash
# Run this in your terminal to generate a new secret:
openssl rand -base64 32
```
- **Value**: The output from the command above (a random 32-byte string)
- **Environment**: Production, Preview, Development (select all)
- ⚠️ **IMPORTANT**: Use a DIFFERENT secret than your local .env file

#### 3. NEXTAUTH_URL
```
https://fasting-5xtmcf69p-raido-purgas-projects.vercel.app
```
- **Value**: Your Vercel deployment URL (shown after deployment)
- **Environment**: Production
- **Note**: You'll update this to `https://fasting-tracker.com` after you connect your custom domain

#### 4. GOOGLE_CLIENT_ID
```
your-google-client-id.apps.googleusercontent.com
```
- **Where to get it**: Google Cloud Console → APIs & Services → Credentials
- **Environment**: Production, Preview, Development (select all)
- **Same as**: The value in your local .env file

#### 5. GOOGLE_CLIENT_SECRET
```
GOCSPX-your-google-client-secret
```
- **Where to get it**: Google Cloud Console → APIs & Services → Credentials
- **Environment**: Production, Preview, Development (select all)
- **Same as**: The value in your local .env file

### Step 3: Update Google OAuth Redirect URIs

After adding environment variables, you need to update Google OAuth settings:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://fasting-5xtmcf69p-raido-purgas-projects.vercel.app/api/auth/callback/google
   ```
4. Click "Save"

### Step 4: Redeploy

After setting environment variables:
1. Go to Vercel dashboard → Deployments tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. ✅ Your app should now work!

## 🌐 Custom Domain Setup (fasting-tracker.com)

### Prerequisites
- ✅ Purchase fasting-tracker.com
- ✅ Have access to your domain registrar's DNS settings

### Step 1: Add Domain in Vercel
1. Go to: https://vercel.com/raido-purgas-projects/fasting/settings/domains
2. Enter: `fasting-tracker.com`
3. Click "Add"
4. Also add: `www.fasting-tracker.com` (for www redirect)

### Step 2: Configure DNS Records

Vercel will show you DNS records to add. Typically:

**For root domain (fasting-tracker.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Note**: DNS propagation can take 24-48 hours

### Step 3: Update Environment Variables

After domain is connected:
1. Update `NEXTAUTH_URL` to: `https://fasting-tracker.com`
2. Update Google OAuth redirect URIs to:
   ```
   https://fasting-tracker.com/api/auth/callback/google
   ```
3. Redeploy

### Step 4: Configure SSL (Automatic)
- Vercel automatically provisions SSL certificates
- Your site will be HTTPS by default
- No configuration needed! ✅

## 🔒 MongoDB Atlas IP Whitelist

**IMPORTANT**: Vercel uses dynamic IPs, so you need to allow all IPs for serverless functions.

### Option 1: Allow All IPs (Recommended for Vercel)
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Enter: `0.0.0.0/0`
5. Click "Confirm"

⚠️ **Security Note**: This is safe because:
- Your database still requires username/password
- Connection string includes credentials
- Only your app has the MONGODB_URI

### Option 2: Use MongoDB Atlas Vercel Integration (Alternative)
1. Visit: https://vercel.com/integrations/mongodbatlas
2. Follow the integration setup
3. This automatically configures IP whitelisting

## 📊 Monitoring & Logs

### View Deployment Logs
1. Go to: https://vercel.com/raido-purgas-projects/fasting
2. Click "Deployments" tab
3. Click on a deployment to see build and runtime logs

### View Runtime Logs
1. In deployment details, click "Functions" tab
2. See serverless function invocations and errors
3. Use this to debug production issues

### Analytics (Included in Hobby Plan)
1. Click "Analytics" tab
2. See page views, load times, and Core Web Vitals

## 🚨 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Common issues:
  - Missing dependencies in package.json
  - Import errors
  - TypeScript errors

### App Loads But Auth Doesn't Work
- Verify all environment variables are set
- Check Google OAuth redirect URIs include your Vercel URL
- Check browser console for errors

### Database Connection Fails
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Test connection string locally first

### OAuth Fails
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Check Google Console redirect URIs
- Verify NEXTAUTH_URL matches your deployment URL

## 🎉 Post-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] MongoDB Atlas IP whitelist configured
- [ ] App loads successfully
- [ ] Login with email/password works
- [ ] Login with Google works
- [ ] Create entry works
- [ ] View entries works
- [ ] Settings page works
- [ ] Custom domain connected (fasting-tracker.com)
- [ ] SSL certificate active (automatic)
- [ ] Monitor logs for errors

## 📈 Next Steps

### Immediate
1. Configure environment variables
2. Test all functionality
3. Fix any deployment issues

### Short-term
1. Connect custom domain (fasting-tracker.com)
2. Set up monitoring/alerts
3. Plan Phase 2 features

### Long-term
1. Monitor Vercel usage (bandwidth, function invocations)
2. Upgrade to Pro if needed ($20/month when you hit limits)
3. Consider Redis for rate limiting (when scaling)

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/raido-purgas-projects/fasting
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google Cloud Console**: https://console.cloud.google.com
- **NextAuth.js Docs**: https://next-auth.js.org

## 💡 Tips

- **Use Preview Deployments**: Every branch push creates a preview URL for testing
- **Environment Variables**: Can be different per environment (Production/Preview/Development)
- **Git Integration**: Vercel auto-deploys on push - no manual deployments needed!
- **Logs**: Check function logs regularly to catch errors early
- **Monitoring**: Set up alerts when you start getting real traffic

---

**Last Updated**: October 20, 2025
**Deployment URL**: https://fasting-5xtmcf69p-raido-purgas-projects.vercel.app
**Status**: Waiting for environment variables configuration
