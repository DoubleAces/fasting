# Google OAuth Setup Guide

## Prerequisites
- Google account
- Access to Google Cloud Console

## Steps to Configure Google OAuth

### 1. Access Google Cloud Console
Navigate to: https://console.cloud.google.com/

### 2. Create or Select a Project
- If you don't have a project, click "Create Project"
- Name it (e.g., "Fasting Tracker")
- Click "Create"

### 3. Enable Google+ API (Required for OAuth)
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" 
- Click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Select "External" (for testing) or "Internal" (if using Google Workspace)
- Click "Create"
- Fill in required fields:
  - **App name**: Fasting Tracker
  - **User support email**: Your email
  - **Developer contact email**: Your email
- Click "Save and Continue"
- **Scopes**: Click "Add or Remove Scopes"
  - Add: `userinfo.email` (View your email address)
  - Add: `userinfo.profile` (See your personal info)
- Click "Save and Continue"
- **Test users** (if External): Add your email for testing
- Click "Save and Continue"

### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "+ CREATE CREDENTIALS"
- Select "OAuth client ID"
- Application type: "Web application"
- Name: "Fasting Tracker Web Client"
- **Authorized JavaScript origins**:
  - `http://localhost:3000` (development)
  - Add production URL when deploying
- **Authorized redirect URIs**:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - Add production URL when deploying (e.g., `https://yourapp.com/api/auth/callback/google`)
- Click "Create"

### 6. Copy Credentials
- You'll see a modal with:
  - **Client ID**: Looks like `123456789-abc123.apps.googleusercontent.com`
  - **Client Secret**: Random string
- Copy these values

### 7. Add to Environment Variables
Create `.env.local` file (copy from `.env.local.example`):

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 8. Security Best Practices
- ✅ Never commit `.env.local` to version control (already in `.gitignore`)
- ✅ Use different credentials for development and production
- ✅ Restrict authorized domains in production
- ✅ Regularly rotate client secrets
- ✅ Monitor OAuth usage in Google Cloud Console

### 9. Testing
After configuration:
1. Start your dev server: `npm run dev`
2. Navigate to login page
3. Click "Sign in with Google"
4. You should see Google's OAuth consent screen
5. After approval, you'll be redirected back and logged in

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that the redirect URI exactly matches what's in Google Cloud Console
- Common issue: Missing `/api/auth/callback/google`
- Check for http vs https mismatch

**Error: "invalid_client"**
- Check that Client ID and Secret are correct in `.env.local`
- Ensure you copied them without extra spaces

**Error: "access_denied"**
- User cancelled the OAuth flow
- Check OAuth consent screen configuration
- Ensure app is not blocked by organization policies

**Error: "Google+ API not enabled"**
- Go to APIs & Services > Library
- Search for "Google+ API"
- Click "Enable"

## Production Deployment

When deploying to production:
1. Update authorized JavaScript origins with production URL
2. Update authorized redirect URIs with production callback URL
3. Create separate OAuth credentials for production (recommended)
4. Set production environment variables
5. Consider publishing OAuth consent screen (if using "External")

## References
- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
