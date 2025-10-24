# PWA Manual Testing Guide

## Overview
This guide walks you through manually testing the PWA installation and offline features on real devices. Browser-controlled behaviors like install prompts can't be automated, so manual validation is essential.

**Production URL**: https://fasting-nine.vercel.app/

---

## Prerequisites

### Required Devices
- **iOS Device**: iPhone or iPad with Safari 16.4+ (iOS 16.4+)
- **Android Device**: Phone/tablet with Chrome 90+ (Android 8.0+)
- **Desktop**: Chrome 90+ or Edge 90+ (optional but recommended)

### Before You Start
1. Ensure you're testing on the **production URL** (https://fasting-nine.vercel.app/)
2. Have a test account ready or create one during testing
3. Clear browser data if testing multiple times
4. Have good internet connection, then ability to go offline

---

## Test 1: iOS Safari Installation

### Prerequisites
- iPhone or iPad with iOS 16.4+
- Safari browser

### Steps

#### 1.1 Initial Visit
1. Open Safari on your iOS device
2. Navigate to: https://fasting-nine.vercel.app/
3. **Wait for page to fully load**
4. Check for service worker registration:
   - Safari Dev Tools (if available) should show SW registered
   - No visible errors in console

#### 1.2 Meet Engagement Criteria
The app requires user engagement before showing install instructions:

**Option A: Time-based (30 seconds)**
- Stay on the homepage
- Interact with the page (scroll, click elements)
- Wait 30+ seconds

**Option B: Page views (2+ pages)**
- Navigate to Features page: `/features`
- Then navigate to FAQ: `/faq`
- Return to homepage: `/`

#### 1.3 Custom Install Instructions Should Appear

After meeting criteria, you should see a **custom prompt** with:
- ✅ Title: "Install Fasting Tracker"
- ✅ Text: "Install our app for quick access and offline use"
- ✅ iOS-specific instructions:
  - Tap the Share button (square with up arrow)
  - Scroll down and tap "Add to Home Screen"
  - Tap "Add" in the top right
- ✅ "Not Now" button to dismiss

**If prompt doesn't appear:**
- Check if you're already in standalone mode (no Safari UI)
- Try refreshing and waiting again
- Ensure you're on HTTPS (not localhost)

#### 1.4 Follow iOS Install Process

1. **Tap Share button** in Safari toolbar (bottom center)
2. **Scroll down** in the share sheet
3. **Tap "Add to Home Screen"**
4. You'll see:
   - App icon preview (your 192x192 icon)
   - App name: "Fasting Tracker"
   - URL: fasting-nine.vercel.app
5. **Tap "Add"** in top right corner

#### 1.5 Verify Installation

1. **Return to Home Screen**
   - New app icon should appear
   - Icon: 192x192 PNG with your branding
   
2. **Launch the App**
   - Tap the "Fasting Tracker" icon
   - App should open **without Safari UI** (no address bar, no browser controls)
   - Top status bar should match your theme color

3. **Verify Standalone Mode**
   - No browser chrome visible
   - Full screen experience
   - Native-like appearance

#### 1.6 Test Offline Functionality

1. **While app is open**, create a test entry:
   - Go to Entries page
   - Create a new fasting entry
   - Note the details

2. **Enable Airplane Mode** (Settings → Airplane Mode)

3. **Close and reopen the app**
   - App should load from cache
   - Previously viewed pages should work
   - Your entry should still be visible

4. **Try to create a new entry while offline**
   - Create another entry
   - Should show "Offline - will sync when online" indicator
   - Entry should be queued in IndexedDB

5. **Return online**
   - Disable Airplane Mode
   - App should auto-sync queued entries
   - Check that offline entry now appears on server

### Expected Results (iOS) ✅
- [ ] Custom install instructions appeared after engagement
- [ ] Successfully added app to Home Screen
- [ ] App icon visible on Home Screen
- [ ] App launches in standalone mode (no Safari UI)
- [ ] App works offline (previously viewed pages)
- [ ] Offline entries queued and synced when back online
- [ ] Service worker caches resources correctly

### Known iOS Limitations ⚠️
- No native `beforeinstallprompt` event (Safari doesn't support it)
- Must use custom instructions instead
- No browser-triggered install banner
- Push notifications may have limitations

---

## Test 2: Android Chrome Installation

### Prerequisites
- Android device with Android 8.0+
- Chrome browser 90+

### Steps

#### 2.1 Initial Visit
1. Open Chrome on your Android device
2. Navigate to: https://fasting-nine.vercel.app/
3. **Wait for page to fully load**
4. Check Chrome DevTools if available

#### 2.2 Meet Engagement Criteria

**Option A: Time-based (30 seconds)**
- Stay on homepage
- Interact with the page
- Wait 30+ seconds

**Option B: Page views (2+ pages)**
- Visit Features: `/features`
- Visit FAQ: `/faq`
- Return to homepage: `/`

#### 2.3 Install Prompt Should Appear

After meeting criteria, you should see **either**:

**A) Chrome's Native Prompt** (if supported):
- Bottom banner with "Add Fasting Tracker to Home screen"
- "Install" button
- Chrome icon and app name

**B) Custom Prompt** (if Chrome doesn't show native):
- Title: "Install Fasting Tracker"
- Description: "Install our app for quick access"
- "Install" and "Not Now" buttons

#### 2.4 Install the App

**If using Chrome's native prompt:**
1. Tap "Install" or "Add to Home screen"
2. Confirm on the dialog that appears
3. App will be added to home screen and app drawer

**If using custom prompt:**
1. Tap "Install" button
2. Chrome should show native install dialog
3. Confirm installation

#### 2.5 Verify Installation

1. **Check Home Screen**
   - App icon should appear
   - Icon: 192x192 PNG (can be maskable on supported devices)
   - Name: "Fasting Tracker"

2. **Check App Drawer**
   - App should appear in full app list
   - Can be moved like any other app

3. **Launch the App**
   - Tap icon from home screen or app drawer
   - Opens in standalone window (separate from Chrome)
   - No browser address bar or controls
   - Native-like appearance

4. **Verify Standalone Mode**
   - Status bar shows your theme color
   - No Chrome UI elements
   - Back button acts as in-app navigation
   - Feels like a native app

#### 2.6 Test Offline Functionality

1. **While app is running**, navigate around:
   - Visit Entries page
   - Create a fasting entry
   - Visit Settings, Features, FAQ

2. **Enable Airplane Mode**
   - Swipe down and enable Airplane Mode
   - Or go to Settings → Network → Airplane Mode

3. **Close and reopen the app**
   - App should load instantly from cache
   - Previously visited pages work offline
   - Navigation works
   - Your entry is visible

4. **Create offline entries**
   - Try to create new fasting entries
   - Should see sync queue indicator
   - Check sync status in UI
   - Entries saved locally in IndexedDB

5. **Test Background Sync** (if device supports)
   - Disable Airplane Mode
   - App should automatically sync in background
   - Check that queued entries appear on server
   - Sync indicator should clear

#### 2.7 Test Push Notifications (Optional)

1. **Enable notifications** when prompted
2. **Test notification receipt** (requires server-side trigger)
3. **Verify notification actions** work correctly

### Expected Results (Android) ✅
- [ ] Install prompt appeared (native or custom)
- [ ] Successfully installed to home screen
- [ ] App appears in app drawer
- [ ] App launches in standalone mode
- [ ] App works offline completely
- [ ] Offline entries queue and sync automatically
- [ ] Background sync works (when back online)
- [ ] Service worker caches all resources
- [ ] Push notifications work (if implemented)

### Known Android Behaviors ⚠️
- Chrome 90+ has stricter install criteria
- Some devices may not show native prompt immediately
- Background sync requires device/Chrome support
- Push notifications require explicit permission

---

## Test 3: Desktop Chrome/Edge

### Prerequisites
- Desktop with Chrome 90+ or Edge 90+
- Mouse and keyboard

### Steps

#### 3.1 Initial Visit
1. Open Chrome or Edge
2. Navigate to: https://fasting-nine.vercel.app/
3. Open DevTools (F12) → Application tab
4. Check Service Worker is registered and active

#### 3.2 Look for Install Indicator

Chrome/Edge shows install availability in **address bar**:
- Look for install icon (⊕ or ⬇️) on the right side of address bar
- May appear immediately or after engagement

#### 3.3 Install the App

**Method 1: Address Bar Icon**
1. Click the install icon in address bar
2. Click "Install" in the dialog
3. App window opens separately

**Method 2: Chrome Menu**
1. Click three dots (⋮) in Chrome
2. Select "Install Fasting Tracker..."
3. Confirm installation

**Method 3: Custom Prompt** (if implemented for desktop)
1. Meet engagement criteria
2. Click "Install" in custom prompt
3. Confirm in browser dialog

#### 3.4 Verify Installation

1. **App Window Opens**
   - Separate window from browser
   - Has its own taskbar/dock icon
   - Own window controls (minimize, maximize, close)

2. **Check Start Menu/Applications**
   - Windows: Search for "Fasting Tracker"
   - macOS: Check Applications folder
   - Linux: Check applications menu

3. **Verify Standalone Experience**
   - No browser address bar
   - No browser navigation buttons
   - Clean, native-like interface
   - App-specific title bar

#### 3.5 Test Offline Functionality

1. **Navigate around the app**
   - Visit multiple pages
   - Create entries if logged in

2. **Open DevTools** in app window
   - Right-click → Inspect
   - Go to Network tab
   - Check "Offline" checkbox

3. **Reload the page**
   - Page should load from cache
   - All visited pages work offline
   - Images and assets cached

4. **Try creating offline entries**
   - Create new fasting entry while "offline"
   - Check IndexedDB in DevTools
   - Verify entry is queued

5. **Uncheck "Offline"** and refresh
   - Queued entries should sync
   - Check network requests fire

#### 3.6 Test Service Worker Updates

1. **Deploy a change** to production (if able)
2. **Leave app open**
3. **Wait for update notification** (if implemented)
4. **Refresh to get new version**
5. **Verify new content loads**

### Expected Results (Desktop) ✅
- [ ] Install icon appears in address bar
- [ ] Successfully installed as desktop app
- [ ] App appears in OS applications
- [ ] App runs in separate window
- [ ] Taskbar/dock icon shows app icon
- [ ] Offline functionality works
- [ ] Service worker caches resources
- [ ] Updates properly (if tested)

---

## Test 4: Lighthouse PWA Audit

This validates your PWA meets Google's standards.

### Steps

#### 4.1 Run Lighthouse Audit

**In Chrome DevTools:**
1. Open Chrome on desktop
2. Navigate to: https://fasting-nine.vercel.app/
3. Open DevTools (F12)
4. Click "Lighthouse" tab
5. Check "Progressive Web App"
6. Click "Analyze page load"

**Via CLI:**
```bash
npm install -g lighthouse
lighthouse https://fasting-nine.vercel.app/ --view
```

#### 4.2 Check PWA Score

**Target: 90+**

Key checks Lighthouse performs:
- ✅ Page served over HTTPS
- ✅ Service worker registered
- ✅ Manifest file valid
- ✅ Viewport meta tag present
- ✅ Icons correct sizes
- ✅ Theme color set
- ✅ Start URL accessible
- ✅ Display mode standalone/fullscreen
- ✅ Offline fallback works

#### 4.3 Review Failed Audits (if any)

Common issues:
- **Icons**: Missing sizes or incorrect format
- **Manifest**: Invalid JSON or missing properties
- **Service Worker**: Not caching start_url
- **HTTPS**: Mixed content warnings
- **Viewport**: Missing meta tag

#### 4.4 Take Screenshots

Save Lighthouse report for documentation:
- PWA score
- Installability checks
- Any warnings or errors

### Expected Results ✅
- [ ] PWA score ≥ 90
- [ ] "Installable" badge shown
- [ ] All core PWA checks pass
- [ ] Service worker audit passes
- [ ] Manifest audit passes

---

## Test 5: Cross-Browser Compatibility

### Quick Checks

#### Firefox (Desktop/Android)
- ✅ Service worker registers
- ⚠️ No install prompt (Firefox doesn't support PWA install on most platforms)
- ✅ Offline caching works
- ✅ Manifest loads correctly

#### Safari (Desktop)
- ⚠️ Limited PWA support on macOS
- ✅ Service worker works
- ⚠️ No install to dock (macOS Safari doesn't support this)
- ✅ Basic offline caching works

#### Edge (Desktop)
- ✅ Full PWA support (Chromium-based)
- ✅ Install to taskbar/Start Menu
- ✅ Same features as Chrome

---

## Troubleshooting

### Install Prompt Not Appearing

**Possible Causes:**
1. **Already installed** - Check if app is on home screen
2. **Recently dismissed** - Wait 3+ months or clear browser data
3. **Not meeting criteria** - Wait 30s or visit more pages
4. **HTTPS issues** - Ensure production URL, not localhost
5. **Service worker not registered** - Check DevTools → Application

**Solutions:**
- Clear browser cache and data
- Try incognito/private mode
- Ensure HTTPS connection
- Check service worker in DevTools
- Wait full 30 seconds on page

### App Not Working Offline

**Check:**
1. **Service worker active** - DevTools → Application → Service Workers
2. **Cache populated** - DevTools → Application → Cache Storage
3. **Visit pages while online first** - SW caches on first visit
4. **Check SW scope** - Should be `/` not `/sw.js`

**Debug:**
```javascript
// In browser console
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('SW:', reg))
```

### Offline Sync Not Working

**Check:**
1. **IndexedDB entries** - DevTools → Application → IndexedDB
2. **Sync queue hook working** - Console logs
3. **Network comes back online** - Event listeners firing
4. **API endpoints working** - Test with curl/Postman

### Icons Not Showing

**Check:**
1. **Icon files exist** - `/icons/icon-192x192.png`, etc.
2. **Manifest references correct paths** - `/manifest.json`
3. **Icons are PNG format** - Not JPEG or WebP
4. **Sizes are correct** - 192x192, 512x512
5. **Icons are square** - Not rectangular

---

## Documentation Template

After testing, document your results:

### Test Results: [Date]

#### iOS Safari (iPhone [Model], iOS [Version])
- [ ] Install prompt appeared: YES/NO
- [ ] Installation successful: YES/NO
- [ ] Standalone mode working: YES/NO
- [ ] Offline functionality: YES/NO
- [ ] Sync working: YES/NO
- **Issues found**: [List any issues]
- **Screenshots**: [Attach screenshots]

#### Android Chrome ([Device], Android [Version])
- [ ] Install prompt appeared: YES/NO
- [ ] Installation successful: YES/NO
- [ ] Standalone mode working: YES/NO
- [ ] Offline functionality: YES/NO
- [ ] Background sync: YES/NO
- [ ] Push notifications: YES/NO
- **Issues found**: [List any issues]
- **Screenshots**: [Attach screenshots]

#### Desktop Chrome ([OS], Chrome [Version])
- [ ] Install icon appeared: YES/NO
- [ ] Installation successful: YES/NO
- [ ] Desktop app works: YES/NO
- [ ] Offline functionality: YES/NO
- **Issues found**: [List any issues]
- **Screenshots**: [Attach screenshots]

#### Lighthouse Audit
- **PWA Score**: [Score]/100
- **Installability**: PASS/FAIL
- **Failed Audits**: [List any failures]
- **Report Link**: [Link to saved report]

### Overall Status
- **Phase 2.7 Manual Testing**: COMPLETE/INCOMPLETE
- **PWA Ready for Production**: YES/NO
- **Known Issues**: [List any blockers]

---

## Quick Reference

### Key URLs
- **Production**: https://fasting-nine.vercel.app/
- **Manifest**: https://fasting-nine.vercel.app/manifest.json
- **Service Worker**: https://fasting-nine.vercel.app/sw.js

### Key Criteria
- **Engagement Time**: 30 seconds
- **OR Page Views**: 2+ pages
- **Target PWA Score**: 90+
- **Required Icons**: 192x192, 512x512

### Support Matrix
| Feature | iOS Safari | Android Chrome | Desktop Chrome |
|---------|-----------|----------------|----------------|
| Install Prompt | Custom | Native/Custom | Address Bar |
| Standalone Mode | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ |
| Offline Caching | ✅ | ✅ | ✅ |
| Background Sync | ❌ | ✅ | ✅ |
| Push Notifications | ⚠️ Limited | ✅ | ✅ |

---

## Next Steps After Manual Testing

1. **Document all results** using template above
2. **Create GitHub issues** for any bugs found
3. **Update main documentation** with findings
4. **Mark Phase 2.7 complete** if all tests pass
5. **Plan fixes** for any issues discovered

---

**Questions?** Check the automated test documentation in:
- `docs/PWA-TESTING-SUMMARY.md`
- `docs/PHASE-2.7-TESTING-COMPLETE.md`
