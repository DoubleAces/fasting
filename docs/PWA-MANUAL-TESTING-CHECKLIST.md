# PWA Manual Testing Checklist

**Production URL**: https://fasting-nine.vercel.app/  
**Tester**: ___________________  
**Date**: ___________________

---

## 📱 iOS Safari Testing

**Device**: _________________ **iOS Version**: _________

### Installation
- [ ] Navigate to production URL
- [ ] Wait 30+ seconds OR visit 2+ pages
- [ ] Custom install instructions appeared
- [ ] Followed iOS install process (Share → Add to Home Screen)
- [ ] App icon added to Home Screen
- [ ] App name shows as "Fasting Tracker"

### Standalone Mode
- [ ] Launched app from Home Screen
- [ ] No Safari UI visible (no address bar)
- [ ] Full screen experience
- [ ] Status bar matches theme color

### Offline Functionality
- [ ] Created test entry while online
- [ ] Enabled Airplane Mode
- [ ] Closed and reopened app
- [ ] App loaded from cache
- [ ] Previously viewed content accessible
- [ ] Created entry while offline
- [ ] Entry queued (shown in UI)
- [ ] Disabled Airplane Mode
- [ ] Offline entry synced to server

### Issues Found
```
[Write any issues here]




```

---

## 📱 Android Chrome Testing

**Device**: _________________ **Android Version**: _________

### Installation
- [ ] Navigate to production URL
- [ ] Wait 30+ seconds OR visit 2+ pages
- [ ] Install prompt appeared (native or custom)
- [ ] Tapped "Install" button
- [ ] App added to Home Screen
- [ ] App appears in App Drawer
- [ ] App name shows as "Fasting Tracker"

### Standalone Mode
- [ ] Launched app from icon
- [ ] Opens in separate window (not Chrome tab)
- [ ] No Chrome address bar or controls
- [ ] Status bar shows theme color
- [ ] Back button works as in-app navigation

### Offline Functionality
- [ ] Visited multiple pages while online
- [ ] Created test entry while online
- [ ] Enabled Airplane Mode
- [ ] Closed and reopened app
- [ ] App loaded from cache
- [ ] Navigation works offline
- [ ] Created entry while offline
- [ ] Entry queued in sync status
- [ ] Disabled Airplane Mode
- [ ] Background sync triggered automatically
- [ ] Offline entry appeared on server

### Push Notifications (if implemented)
- [ ] Notification permission requested
- [ ] Granted permission
- [ ] Received test notification
- [ ] Notification actions work

### Issues Found
```
[Write any issues here]




```

---

## 💻 Desktop Chrome/Edge Testing

**OS**: _________________ **Browser**: _________ **Version**: _________

### Installation
- [ ] Navigate to production URL
- [ ] Install icon appeared in address bar
- [ ] Clicked install icon/menu option
- [ ] Confirmed installation
- [ ] App window opened separately
- [ ] App appears in Start Menu/Applications

### Standalone Mode
- [ ] App has its own window
- [ ] Own taskbar/dock icon
- [ ] No browser address bar
- [ ] Window controls work (minimize, maximize, close)
- [ ] Can launch from OS applications menu

### Offline Functionality
- [ ] Visited multiple pages
- [ ] Created test entry
- [ ] Enabled "Offline" in DevTools Network tab
- [ ] Reloaded page - loaded from cache
- [ ] All visited pages work offline
- [ ] Created entry while offline
- [ ] Checked IndexedDB - entry queued
- [ ] Disabled "Offline" mode
- [ ] Queued entry synced to server

### DevTools Checks
- [ ] Service Worker registered and active
- [ ] Cache Storage populated with resources
- [ ] IndexedDB contains app data
- [ ] No console errors on load

### Issues Found
```
[Write any issues here]




```

---

## 🔍 Lighthouse Audit

**Run Date**: _________________ **Chrome Version**: _________

### Audit Results
- **PWA Score**: _______ / 100
- **Performance Score**: _______ / 100
- **Accessibility Score**: _______ / 100

### PWA Checks
- [ ] Served over HTTPS
- [ ] Service worker registered
- [ ] Manifest file valid
- [ ] Viewport meta tag present
- [ ] Theme color set
- [ ] Icons correct sizes (192x192, 512x512)
- [ ] Start URL accessible
- [ ] Display mode: standalone/fullscreen
- [ ] Offline fallback works
- [ ] "Installable" badge shown

### Failed Audits (if any)
```
[List any failed checks]




```

### Screenshots Saved
- [ ] PWA score screenshot
- [ ] Installability checks
- [ ] Any warnings/errors

---

## 🌐 Cross-Browser Quick Checks

### Firefox Desktop
- [ ] Service worker registers: YES / NO
- [ ] Offline caching works: YES / NO
- [ ] Manifest loads correctly: YES / NO

### Safari Desktop (macOS)
- [ ] Service worker registers: YES / NO
- [ ] Offline caching works: YES / NO
- [ ] Basic functionality works: YES / NO

### Edge Desktop
- [ ] Full PWA support: YES / NO
- [ ] Install to taskbar works: YES / NO
- [ ] Same features as Chrome: YES / NO

---

## 📊 Summary

### Overall Status
- [ ] All iOS tests passed
- [ ] All Android tests passed
- [ ] All Desktop tests passed
- [ ] Lighthouse score ≥ 90
- [ ] No critical issues found

### Test Coverage
- **iOS Safari**: PASS / FAIL / NOT TESTED
- **Android Chrome**: PASS / FAIL / NOT TESTED
- **Desktop Chrome**: PASS / FAIL / NOT TESTED
- **Lighthouse Audit**: PASS / FAIL / NOT TESTED

### Critical Issues (Blockers)
```
[List any issues that prevent release]




```

### Minor Issues (Can Fix Later)
```
[List any non-critical issues]




```

### Recommendations
```
[Any suggestions for improvements]




```

---

## ✅ Sign-Off

**Phase 2.7 Manual Testing**: COMPLETE / INCOMPLETE

**PWA Ready for Production**: YES / NO

**Tested By**: _______________________

**Date**: _______________________

**Signature**: _______________________

---

## 📎 Attachments

**Screenshots Attached:**
- [ ] iOS Home Screen with app icon
- [ ] iOS app in standalone mode
- [ ] iOS offline mode working
- [ ] Android Home Screen with app icon
- [ ] Android app in standalone mode
- [ ] Android offline mode working
- [ ] Desktop app window
- [ ] Lighthouse audit results

**Files to Include:**
- [ ] Lighthouse HTML report
- [ ] Console log screenshots (if errors)
- [ ] Network tab screenshots
- [ ] Service Worker status screenshots

---

## 🔗 Resources

- **Full Testing Guide**: `docs/PWA-MANUAL-TESTING-GUIDE.md`
- **Test Summary**: `docs/PWA-TESTING-SUMMARY.md`
- **Phase 2.7 Report**: `docs/PHASE-2.7-TESTING-COMPLETE.md`
- **Production URL**: https://fasting-nine.vercel.app/

---

**Note**: If you don't have access to iOS or Android devices, consider:
- Using BrowserStack (browserstack.com) for device testing
- Testing on desktop Chrome/Edge (most comprehensive)
- Running Lighthouse audit (validates most PWA features)
- Asking team members with devices to test
