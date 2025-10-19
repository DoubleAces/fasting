# Quickstart: Website Structure & Authentication

**Branch**: `002-website-auth-structure`  
**Feature**: Add website structure with authentication, FAQ, and SEO

## Overview

This feature transforms the fasting tracker from a standalone app into a full website with:
- 🏠 Public homepage with marketing content
- 🔐 User authentication (email/password + Google OAuth)
- 📄 FAQ page with search functionality
- 🔒 Protected routes (entries, settings require login)
- 🎨 Modern, Apple-inspired design
- 🚀 SEO optimization (meta tags, sitemap, structured data)

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection string for remote database
- Git repository set up
- Existing fasting tracker codebase (from phase 1)

## Quick Start

### 1. Switch to Feature Branch

```bash
git checkout 002-website-auth-structure
```

### 2. Install New Dependencies

```bash
npm install next-auth@beta bcrypt
npm install --save-dev @types/bcrypt
```

**Note**: NextAuth.js v5 is currently in beta. Using `@beta` tag installs the latest v5 beta version.

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fasting-tracker

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (for password reset)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

#### Environment Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string (local or Atlas) |
| `NEXTAUTH_URL` | ✅ Yes | Base URL of your application (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret key for encrypting tokens (generate with command below) |
| `GOOGLE_CLIENT_ID` | ⚠️ Optional | Google OAuth Client ID (required for Google login) |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Optional | Google OAuth Client Secret (required for Google login) |
| `EMAIL_SERVER` | ⚠️ Optional | SMTP server URL (required for password reset emails) |
| `EMAIL_FROM` | ⚠️ Optional | Email sender address (required for password reset emails) |

#### Generate NEXTAUTH_SECRET

Use one of these methods:

**Method 1 - Using Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 2 - Using OpenSSL** (if available):
```bash
openssl rand -base64 32
```

**Method 3 - Online Generator**:
Visit: https://generate-secret.vercel.app/32

⚠️ **IMPORTANT**: Use a different secret for each environment (dev, staging, production). Never commit `.env.local` to version control.

#### Google OAuth Setup (Optional)

If you want to enable "Sign in with Google":

1. Follow the detailed guide: [`docs/google-oauth-setup.md`](../../docs/google-oauth-setup.md)
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
3. Add credentials to `.env.local`

**Quick Summary**:
- Create project in Google Cloud Console
- Enable Google+ API
- Configure OAuth consent screen
- Create OAuth 2.0 Client ID
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Secret to `.env.local`

### 4. Seed FAQ Data (Optional)

Run the FAQ seeder to populate initial FAQ items:

```bash
npm run seed:faq
```

### 5. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Key Routes

### Public Routes (No Authentication Required)

- **`/`** - Homepage with hero, features, and CTAs
- **`/faq`** - FAQ page with search
- **`/login`** - Login page
- **`/register`** - Registration page
- **`/forgot-password`** - Password reset request

### Protected Routes (Authentication Required)

- **`/entries`** - Fasting entries (existing feature)
- **`/settings`** - User settings (existing feature)

### API Endpoints

- **`/api/auth/register`** - POST: Register new user
- **`/api/auth/[...nextauth]`** - NextAuth handler (login, logout, session)
- **`/api/auth/forgot-password`** - POST: Request password reset
- **`/api/auth/reset-password`** - POST: Reset password with token
- **`/api/faq`** - GET: Retrieve FAQs (with optional search/category filter)
- **`/api/entries`** - GET/POST: User's fasting entries (protected)
- **`/api/settings`** - GET/PUT: User's settings (protected)

## Testing

### Run All Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Specific Feature

```bash
# Auth tests only
npm test -- --testPathPattern=auth

# Component tests only
npm test -- --testPathPattern=components

# FAQ tests
npm test -- --testPathPattern=faq
```

## Architecture Overview

### Authentication Flow

1. **Registration**:
   - User submits email, password, name via `/register`
   - Password validated (min 8 chars, uppercase, lowercase, number)
   - Password hashed with bcrypt (10 rounds)
   - User saved to database
   - Automatic login after registration

2. **Login**:
   - User submits email, password via `/login`
   - Credentials verified with NextAuth
   - Session created (JWT or database)
   - Cookie set (httpOnly, secure, sameSite=strict)
   - Redirect to `/entries`

3. **Google OAuth**:
   - User clicks "Sign in with Google"
   - Redirected to Google OAuth consent screen
   - User approves
   - Google returns user data
   - User created/updated in database
   - Session created
   - Redirect to `/entries`

4. **Password Reset**:
   - User submits email via `/forgot-password`
   - Reset token generated (32 bytes random)
   - Email sent with reset link
   - User clicks link, redirected to `/reset-password?token=...`
   - User submits new password
   - Token validated (not used, not expired)
   - Password updated
   - Token marked as used

### Route Protection

Implemented via Next.js middleware (`src/middleware.js`):

```javascript
// Middleware protects routes based on authentication
export function middleware(req) {
  const token = await getToken({ req });
  
  if (!token && req.nextUrl.pathname.startsWith('/entries')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (token && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/entries', req.url));
  }
}

export const config = {
  matcher: ['/entries/:path*', '/settings/:path*', '/login', '/register']
};
```

### Data Isolation

- Each user sees only their own entries and settings
- `userId` field added to Entry and Settings models
- API routes filter by `req.session.user.id`
- No client-side userId manipulation (enforced server-side)

## Component Structure

### Atomic Design

- **Atoms**: Button, Input, Link, Logo (basic building blocks)
- **Molecules**: NavLink, FAQItem, SearchBar (compound components)
- **Organisms**: Navbar, LoginForm, RegisterForm, FAQList (complex components)

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Navbar | Main navigation (public/protected variants) | `src/components/organisms/Navbar.js` |
| LoginForm | Email/password + Google OAuth | `src/components/organisms/LoginForm.js` |
| RegisterForm | Registration with validation | `src/components/organisms/RegisterForm.js` |
| FAQList | FAQ display with search | `src/components/organisms/FAQList.js` |
| Hero | Homepage hero section | `src/components/organisms/Hero.js` |

## Database Models

### New Models

- **User**: Email, password (hashed), name, profile, auth method, timestamps
- **PasswordResetToken**: Token, userId, expiration, used flag
- **FAQItem**: Question, answer, category, order, keywords

### Updated Models

- **Entry**: Added `userId` field (references User)
- **Settings**: Added `userId` field (references User, unique)

## Common Tasks

### Create a Test User

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  email: "test@example.com",
  password: "$2b$10$...", // bcrypt hash of "password123"
  name: "Test User",
  authMethod: "email",
  registrationDate: new Date(),
  lastLogin: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

Or use registration endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "name": "Test User"
  }'
```

### Add FAQ Items

```javascript
db.faqItems.insertMany([
  {
    question: "What is intermittent fasting?",
    answer: "Intermittent fasting is an eating pattern that cycles between periods of fasting and eating.",
    category: "Getting Started",
    order: 1,
    keywords: ["fasting", "intermittent", "eating", "pattern"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "How do I track my fasting?",
    answer: "Use the Entries page to log your fasting start and end times.",
    category: "Fasting",
    order: 1,
    keywords: ["track", "entries", "log", "fasting"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### Test Rate Limiting

```bash
# Attempt 6 logins rapidly (should fail on 6th)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

### Check Session

```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Debugging

### Common Issues

**1. "Error: Cannot find module 'next-auth'"**
- Solution: Run `npm install next-auth@5`

**2. "NextAuth configuration error"**
- Check `.env.local` has `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- Verify Google OAuth credentials if using Google login

**3. "Password hashing fails"**
- Ensure `bcrypt` is installed
- Check Node.js version (18+ required)

**4. "FAQ search not working"**
- Verify FAQ items are published (`isPublished: true`)
- Check MongoDB connection
- Inspect browser console for errors

**5. "Protected routes accessible without login"**
- Verify middleware is configured correctly
- Check `src/middleware.js` exists
- Ensure NextAuth session is working

### Debug Logs

Enable debug logging:

```env
# .env.local
DEBUG=next-auth*
```

Check logs:
```bash
npm run dev
# Watch console for NextAuth debug output
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Seed FAQ data
4. ✅ Run development server
5. ✅ Test authentication flow
6. ⏭ Run test suite
7. ⏭ Generate implementation tasks (`/speckit.tasks`)
8. ⏭ Begin TDD implementation
9. ⏭ Deploy to production

## Resources

- **NextAuth.js Docs**: https://authjs.dev
- **Next.js App Router**: https://nextjs.org/docs/app
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Bcrypt**: https://www.npmjs.com/package/bcrypt

## Support

For questions or issues:
1. Check `spec.md` for functional requirements
2. Review `data-model.md` for database schemas
3. See `contracts/api-spec.json` for API contracts
4. Run tests to identify failures
5. Check `.specify/logs/` for error logs

---

**Ready to implement?** Run `/speckit.tasks` to generate implementation task breakdown.
