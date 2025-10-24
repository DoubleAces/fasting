# PWA Quickstart Guide

**Feature**: 010-pwa-conversion  
**Date**: October 24, 2025

## Overview

This guide provides step-by-step instructions for setting up, testing, and deploying the Progressive Web App (PWA) features for the fasting tracker. Follow these steps to enable offline functionality, push notifications, and installability.

---

## Prerequisites

- Node.js 18+ installed
- Next.js 15.5.6 project set up
- HTTPS-enabled development environment (required for service workers)
- Modern browser (Chrome 90+, Safari 16.4+, Firefox 90+)

---

## Installation

### Step 1: Install Dependencies

```bash
npm install next-pwa@^5.6.0 idb@^8.0.0 web-push@^3.6.0
npm install --save-dev sharp@^0.33.0
```

**What this does:**
- `next-pwa`: Generates service worker using Workbox
- `idb`: Promise-based IndexedDB wrapper
- `web-push`: Server-side Web Push Protocol implementation
- `sharp`: Image processing for icon generation (dev dependency)

---

### Step 2: Generate VAPID Keys

VAPID keys are required for push notifications. Generate them once and store securely.

```bash
npx web-push generate-vapid-keys
```

**Output:**
```
=======================================

Public Key:
BKxS5HL-nVH3j3xQw...

Private Key:
3jKLm9pR2sT5vW8x...

=======================================
```

**Add to `.env.local`:**
```env
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=BKxS5HL-nVH3j3xQw...
VAPID_PRIVATE_KEY=3jKLm9pR2sT5vW8x...
VAPID_EMAIL=your-email@example.com

# Cron Secret for Vercel Cron Jobs
CRON_SECRET=your-secure-random-string-here
```

**Add to `.env.production`:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxS5HL-nVH3j3xQw...
```

⚠️ **Important**: 
- Never commit `.env.local` to version control
- Add VAPID keys to Vercel environment variables
- Use `NEXT_PUBLIC_` prefix for client-accessible variables

---

### Step 3: Configure Next.js with Workbox

Edit `next.config.mjs`:

```javascript
import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in dev
  runtimeCaching: [
    // API: Entries (Network-First)
    {
      urlPattern: /^\/api\/entries.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-entries-v1',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        },
        networkTimeoutSeconds: 10
      }
    },
    // API: Settings (Stale-While-Revalidate)
    {
      urlPattern: /^\/api\/settings.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-settings-v1',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    },
    // Images (Cache-First)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v1',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Google Fonts (Cache-First)
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    }
  ],
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/],
  publicExcludes: ['!noprecache/**/*']
};

const nextConfig = {
  // Your existing config...
};

export default withPWA(pwaConfig)(nextConfig);
```

---

### Step 4: Create Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Fasting Tracker",
  "short_name": "Fasting",
  "description": "Track your intermittent fasting journey, log meals, and monitor health metrics",
  "start_url": "/entries",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9333ea",
  "orientation": "any",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Log Entry",
      "short_name": "Log",
      "description": "Quickly log today's fasting entry",
      "url": "/entries/new",
      "icons": [{ "src": "/icons/shortcut-log.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["health", "lifestyle", "productivity"]
}
```

---

### Step 5: Generate PWA Icons

Create `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Source SVG or high-res PNG
const source = path.join(__dirname, '../public/logo.svg');

const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 512, name: 'icon-512x512.png' }
];

const maskableSizes = [
  { size: 192, name: 'icon-maskable-192x192.png' },
  { size: 512, name: 'icon-maskable-512x512.png' }
];

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  // Generate regular icons
  for (const { size, name } of sizes) {
    await sharp(source)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, name));
    console.log(`✓ Generated ${name}`);
  }
  
  // Generate maskable icons (with 20% padding)
  for (const { size, name } of maskableSizes) {
    const padding = Math.round(size * 0.2);
    const iconSize = size - (padding * 2);
    
    await sharp(source)
      .resize(iconSize, iconSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 147, g: 51, b: 234, alpha: 1 } // Purple theme
      })
      .png()
      .toFile(path.join(iconDir, name));
    console.log(`✓ Generated ${name} (maskable)`);
  }
  
  // Generate badge (72x72 monochrome)
  await sharp(source)
    .resize(72, 72)
    .greyscale()
    .png()
    .toFile(path.join(iconDir, 'badge-72x72.png'));
  console.log('✓ Generated badge-72x72.png');
  
  // Generate shortcut icon (96x96)
  await sharp(source)
    .resize(96, 96)
    .png()
    .toFile(path.join(iconDir, 'shortcut-log.png'));
  console.log('✓ Generated shortcut-log.png');
  
  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
```

**Run the script:**
```bash
node scripts/generate-icons.js
```

**Required source file**: `public/logo.svg` (your app logo in SVG format)

---

### Step 6: Link Manifest in Layout

Edit `src/app/layout.tsx`:

```tsx
export const metadata = {
  title: 'Fasting Tracker',
  description: 'Track your intermittent fasting journey',
  manifest: '/manifest.json',
  themeColor: '#9333ea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fasting'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### Step 7: Create Offline Fallback Page

Create `public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Fasting Tracker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.9; }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you're not connected to the internet. Some features may be limited, but you can still view cached entries and create new entries offline.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>
```

---

## Testing Locally

### Step 1: Build for Production

Service workers only work in production mode (or with HTTPS in dev).

```bash
npm run build
npm run start
```

---

### Step 2: Open DevTools

**Chrome/Edge:**
1. Open `http://localhost:3000` (or use `https://localhost:3000` with `mkcert`)
2. Press `F12` to open DevTools
3. Go to **Application** tab
4. Check **Service Workers** section

**Expected:**
- ✅ Service worker status: "Activated and is running"
- ✅ Scope: `/`
- ✅ Source: `/sw.js`

---

### Step 3: Verify Manifest

In DevTools **Application** tab:
1. Click **Manifest** in left sidebar
2. Verify all fields populated
3. Check icons load correctly

**Expected:**
- ✅ Name: "Fasting Tracker"
- ✅ Short name: "Fasting"
- ✅ Start URL: "/entries"
- ✅ Display: "standalone"
- ✅ Icons: All sizes present

---

### Step 4: Test Offline Mode

1. In DevTools, go to **Network** tab
2. Check **Offline** checkbox
3. Navigate to `/entries`

**Expected:**
- ✅ Page loads from cache
- ✅ UI shows offline indicator
- ✅ Can view cached entries

---

### Step 5: Test Install Prompt

**Desktop:**
1. Open Chrome/Edge
2. Visit site (HTTPS required)
3. Look for install icon in address bar (right side)
4. Click icon → "Install"

**Mobile (Android):**
1. Open Chrome
2. Visit site
3. Tap menu (3 dots) → "Add to Home screen"
4. Tap "Add"
5. Check home screen for app icon

**iOS (Safari 16.4+):**
1. Open Safari
2. Visit site
3. Tap Share icon → "Add to Home Screen"
4. Tap "Add"
5. Check home screen for app icon

---

### Step 6: Test Push Notifications

**In browser console:**
```javascript
// Request permission
await Notification.requestPermission();

// Subscribe
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
});

// Send subscription to server
await fetch('/api/pwa/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscription: subscription.toJSON(),
    preferences: { fastingWindowReminder: true }
  })
});

// Send test notification
await fetch('/api/pwa/send-notification', { method: 'POST' });
```

**Expected:**
- ✅ Permission prompt appears
- ✅ Subscription saved to server
- ✅ Test notification received

---

## Deployment to Vercel

### Step 1: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VAPID_PUBLIC_KEY=BKxS5HL-nVH3j3xQw...
VAPID_PRIVATE_KEY=3jKLm9pR2sT5vW8x...
VAPID_EMAIL=your-email@example.com
CRON_SECRET=your-secure-random-string
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxS5HL-nVH3j3xQw...
```

---

### Step 2: Configure Vercel Cron

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

### Step 3: Deploy

```bash
git add .
git commit -m "Add PWA support"
git push origin 010-pwa-conversion
```

Vercel will auto-deploy. Monitor build logs for errors.

---

### Step 4: Verify Production

1. Visit deployed URL (e.g., `https://your-app.vercel.app`)
2. Run Lighthouse audit:
   - Open DevTools → Lighthouse tab
   - Check **Progressive Web App** category
   - Click "Generate report"

**Expected:**
- ✅ PWA score: 90+
- ✅ "Installable" badge
- ✅ All PWA checks passed

---

## Troubleshooting

### Service Worker Not Registering

**Symptom**: Console error: "Failed to register service worker"

**Solutions**:
- ✅ Ensure HTTPS (or localhost)
- ✅ Check `next.config.mjs` has `withPWA()` wrapper
- ✅ Build in production mode (`npm run build`)
- ✅ Clear browser cache and hard reload

---

### Manifest Not Loading

**Symptom**: DevTools shows "No manifest detected"

**Solutions**:
- ✅ Verify `public/manifest.json` exists
- ✅ Check `<link rel="manifest">` in `<head>`
- ✅ Validate JSON syntax (use jsonlint.com)
- ✅ Check Network tab for 404 errors

---

### Offline Mode Not Working

**Symptom**: Page shows error when offline

**Solutions**:
- ✅ Check cache strategies in `next.config.mjs`
- ✅ Verify `offline.html` exists in `public/`
- ✅ Check service worker activated (DevTools → Application → Service Workers)
- ✅ Test with `Cache Storage` inspector (DevTools → Application → Cache Storage)

---

### Push Notifications Not Received

**Symptom**: Subscription succeeds but no notifications

**Solutions**:
- ✅ Verify VAPID keys match (public and private)
- ✅ Check `VAPID_EMAIL` set correctly
- ✅ Ensure user granted notification permission
- ✅ Check browser console for service worker errors
- ✅ Verify cron job running (Vercel dashboard → Deployments → Functions → Logs)
- ✅ Test with `/api/pwa/send-notification` endpoint

---

### Install Prompt Not Showing

**Symptom**: No install icon in browser

**Solutions**:
- ✅ Ensure HTTPS (PWAs require secure context)
- ✅ Verify manifest has all required fields
- ✅ Check icons exist and are correct sizes
- ✅ Ensure `start_url` is valid
- ✅ Wait 30 seconds after first visit (Chrome engagement requirement)
- ✅ On iOS, use Safari (not Chrome/Firefox)

---

### Icons Not Displaying

**Symptom**: Broken image icons in manifest

**Solutions**:
- ✅ Run `node scripts/generate-icons.js`
- ✅ Verify `public/icons/` directory exists
- ✅ Check file sizes match manifest (192x192, 512x512)
- ✅ Ensure `public/logo.svg` source file exists
- ✅ Check Network tab for 404 errors on icon paths

---

## Testing Checklist

Use this checklist before marking PWA implementation complete:

### Installability
- [ ] Install prompt shows on desktop (Chrome/Edge)
- [ ] Install prompt shows on Android Chrome
- [ ] Add to Home Screen works on iOS Safari 16.4+
- [ ] Installed app opens in standalone mode (no browser UI)
- [ ] App icon displays on home screen/desktop

### Offline Functionality
- [ ] Service worker registers successfully
- [ ] Page loads when offline (cached)
- [ ] Offline indicator shows when disconnected
- [ ] Can create entries offline
- [ ] Entries sync when back online
- [ ] Offline fallback page shows for uncached routes

### Push Notifications
- [ ] Permission prompt shows
- [ ] Subscription saves to server
- [ ] Test notification received
- [ ] Notification shows correct icon and text
- [ ] Clicking notification opens app
- [ ] Scheduled notifications sent at correct time (test cron)

### Performance
- [ ] Lighthouse PWA score 90+
- [ ] Cached page loads <1s
- [ ] Initial load <3s
- [ ] Service worker registers <500ms

### Cross-Browser
- [ ] Works in Chrome 90+ (desktop and mobile)
- [ ] Works in Safari 16.4+ (iOS)
- [ ] Works in Edge 90+
- [ ] Works in Firefox 90+

---

## Next Steps

After PWA setup complete:

1. **Write Tests**: Unit tests for IndexedDB, integration tests for sync, E2E tests for install flow
2. **Monitor Errors**: Check `/api/pwa/log-error` endpoint for production issues
3. **Optimize Caching**: Adjust cache strategies based on usage patterns
4. **User Onboarding**: Add UI tours explaining offline mode and install prompt
5. **Analytics**: Track PWA install rate, offline usage, notification engagement

---

## Resources

- **Next.js PWA**: https://github.com/shadowwalker/next-pwa
- **Workbox Documentation**: https://developer.chrome.com/docs/workbox/
- **Web Push Protocol**: https://web.dev/push-notifications-overview/
- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **PWA Builder**: https://www.pwabuilder.com/ (testing tool)
- **Can I Use PWA**: https://caniuse.com/?search=pwa

---

**Questions?** Check the contracts in `contracts/` directory for detailed API specifications.
