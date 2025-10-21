# Resend Email Setup - Quick Start

## ✅ What's Already Done

1. ✅ `resend` package installed
2. ✅ Email utility updated to use Resend
3. ✅ Beautiful HTML email template created
4. ✅ Development mode still shows yellow dev box
5. ✅ Production mode will send real emails

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for Resend

1. Go to https://resend.com
2. Click "Sign Up" (top right)
3. Use your email or "Continue with GitHub"
4. Verify your email address

### Step 2: Get Your API Key

1. After login, go to **API Keys**: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Give it a name (e.g., "Fasting Tracker Dev")
4. Select permissions: **"Sending access"**
5. Click **"Create"**
6. **COPY THE API KEY** (starts with `re_`)
   - ⚠️ You can only see it once!

### Step 3: Add API Key to `.env.local`

Open your `.env.local` file and add this line at the end:

```bash
# Resend Email Service
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here
```

**Example:**
```bash
RESEND_API_KEY=re_AbCdEf123456_YourActualKeyHere
```

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🧪 Testing

### Development Mode (Current)
- Yellow dev box still works! 📦
- No emails sent (saves API calls)
- Reset URL displayed in browser

### Production Mode
To test real emails in development:

1. Temporarily change `NODE_ENV` in `.env.local`:
   ```bash
   NODE_ENV=production
   ```

2. Restart server

3. Test forgot password flow

4. Check your email inbox! 📧

5. Change back to development:
   ```bash
   NODE_ENV=development
   ```

## 📧 Email Template Preview

The email includes:
- ✨ Beautiful gradient header
- 🎨 Professional styling
- 📱 Mobile-responsive design
- 🔘 Big "Reset Password" button
- ⏰ Expiration warning (24 hours)
- 🔗 Plain text fallback URL
- ✅ Plain text version for compatibility

## 🆓 Free Tier Limits

**Resend Free Plan:**
- 100 emails per day
- 3,000 emails per month
- ✅ Perfect for development and small apps
- No credit card required

## 🎯 Domain Setup (Optional - For Production)

For production with custom domain (`noreply@yourapp.com`):

### Option 1: Use Resend's Domain (Easiest)
In `src/lib/utils/email.js`, update line 88:
```javascript
from: 'Fasting Tracker <onboarding@resend.dev>',
```

### Option 2: Custom Domain (Professional)

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourapp.com`)
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM record
5. Wait for verification (5-30 minutes)
6. Update email code:
   ```javascript
   from: 'Fasting Tracker <noreply@yourapp.com>',
   ```

**For now:** Use `onboarding@resend.dev` (works immediately!)

## 🐛 Troubleshooting

### Error: "Email service not configured"
- ✅ Check `.env.local` has `RESEND_API_KEY=...`
- ✅ Restart dev server after adding key
- ✅ API key starts with `re_`

### Error: "Invalid API key"
- ✅ Copy key correctly from Resend dashboard
- ✅ No spaces before/after the key
- ✅ Key should be ~40-50 characters

### Emails not arriving
- ✅ Check spam folder
- ✅ Verify email address is correct
- ✅ Check Resend dashboard logs: https://resend.com/emails
- ✅ Verify domain (if using custom domain)

### Still seeing yellow dev box
- ✅ `NODE_ENV=development` means dev mode (expected!)
- ✅ To send real emails, set `NODE_ENV=production`

## 📊 Monitoring Emails

View sent emails in Resend dashboard:
- https://resend.com/emails
- See delivery status
- View email content
- Check open rates (if enabled)
- Track bounces

## 🔐 Security Best Practices

1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ✅ Use different API keys for dev/staging/prod
3. ✅ Rotate keys periodically
4. ✅ Limit API key permissions (only "Sending access")
5. ✅ Monitor usage in Resend dashboard

## 📝 Current Code Location

Email sending code is in:
```
src/lib/utils/email.js
```

Used by:
```
src/app/api/auth/forgot-password/route.js
```

## 🎉 What Happens Next?

1. **Development:**
   - Yellow dev box still works
   - No API calls to Resend
   - Free testing

2. **Production (after deployment):**
   - Real emails sent via Resend
   - Professional HTML template
   - High deliverability (99%+)
   - Automatic retries
   - Delivery tracking

## 📚 Additional Resources

- **Resend Docs:** https://resend.com/docs
- **Resend Examples:** https://resend.com/docs/send-with-nextjs
- **API Reference:** https://resend.com/docs/api-reference/emails/send-email
- **Email Guide:** See `docs/EMAIL-INTEGRATION-GUIDE.md`

---

**Need Help?** Just ask! The setup is super simple. 🚀
