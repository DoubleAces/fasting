# Google OAuth Setup - Next Steps

## ✅ What's Already Done:

1. ✅ Google Client ID added to `.env.local`
2. ✅ NextAuth secret generated
3. ✅ MongoDB configured

## ⚠️ What You Need to Do:

### Get Your Google Client Secret

1. **Go to Google Cloud Console**: 
   https://console.cloud.google.com/apis/credentials

2. **Find your OAuth 2.0 Client ID**:
   - Look for the client that has ID: `159189296281-3dsdvhg0s4n6dj5jv84p5n8bp2gglm9d`
   - Click on it to view details

3. **Copy the Client Secret**:
   - You'll see "Client Secret" field
   - Click the copy icon or select and copy the secret
   - It looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

4. **Add to `.env.local`**:
   - Open `C:\Code projects\fasting\.env.local`
   - Replace `YOUR_GOOGLE_CLIENT_SECRET_HERE` with your actual secret
   - Save the file

### Verify Redirect URI

Make sure your Google Cloud Console OAuth client has this redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

**To check/add it:**
1. In Google Cloud Console → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add if not present:
   - `http://localhost:3000/api/auth/callback/google`
4. Click "Save"

### Test It

1. **Restart your dev server** (if running):
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Go to register or login page**:
   - http://localhost:3000/register
   - http://localhost:3000/login

3. **Click "Sign up with Google" or "Continue with Google"**

4. **Expected flow**:
   - ✅ Redirects to Google sign-in
   - ✅ Shows consent screen
   - ✅ After approval, redirects back to your app
   - ✅ Creates account or logs you in
   - ✅ Redirects to /entries page

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (secrets won't be committed)
- ⚠️ Never share your Client Secret publicly
- ⚠️ Use different credentials for production

## 📚 Full Documentation

See: `docs/google-oauth-setup.md` for complete setup guide

## ❓ Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`

**Error: "invalid_client"**
- Check Client ID and Secret in `.env.local` are correct
- Make sure there are no extra spaces

**Error: "Configuration"**
- Restart dev server after adding credentials
- Check both Client ID and Secret are set

**Still having issues?**
- Check browser console for errors
- Check terminal/dev server logs
- Verify OAuth consent screen is configured in Google Cloud Console
