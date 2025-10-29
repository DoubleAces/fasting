# Cross-Browser Testing Checklist - Feature 022

## Test Configuration

**Test Date**: ___________  
**Tester**: ___________  
**Build Version**: ___________  
**Test Environment**: Production / Staging (circle one)

---

## Device Matrix

Test on the following devices/browsers (minimum):

### iOS Devices
- [ ] iPhone SE (2nd gen or later) - iOS 14+
- [ ] iPhone 12/13/14 (standard size)
- [ ] iPad Mini (optional - tablet breakpoint)

### Android Devices
- [ ] Chrome Android 90+ on Pixel device
- [ ] Chrome Android 90+ on Samsung device
- [ ] Samsung Internet on Samsung device

---

## Test Pages

For each device, test these pages:
1. **Homepage** (`/`)
2. **Entries List** (`/entries`)
3. **New Entry Form** (`/entries/new`)
4. **Settings Page** (`/settings`)
5. **Admin User Management** (`/dashboard/users`) - if admin access available

---

## Test Scenarios (Complete for EACH device)

### Device: _________________ | Browser: _________________ | OS Version: _________

#### 1. Responsive Breakpoint (768px)
- [ ] **Mobile viewport (<768px)**: Page displays mobile layout
- [ ] **Desktop viewport (≥768px)**: Page displays desktop layout
- [ ] **Rotate device**: Layout switches correctly between portrait/landscape
- [ ] **No horizontal scroll**: At any viewport width (320px to 1920px)

**Notes**: ___________________________________________________________

---

#### 2. Entry Table (US1) - Test on `/entries` page

**Mobile (<768px)**:
- [ ] **3 columns visible**: Date, Duration (with ⏱), Actions
- [ ] **5 hidden columns**: Start Time, End Time, Type, Goal Met, Notes
- [ ] **⏱ emoji renders**: Displays correctly before duration (e.g., "⏱ 16h")
- [ ] **No horizontal scroll**: Table fits within viewport
- [ ] **Touch targets**: Action buttons ≥44px height (easy to tap)
- [ ] **Typography**: Body text is 14px (comfortable to read, no zoom)

**Desktop (≥768px)**:
- [ ] **8 columns visible**: All columns display
- [ ] **Typography**: Body text is 16px
- [ ] **Spacing**: Comfortable padding (16px)

**Issues Found**: ___________________________________________________________

---

#### 3. Typography & Spacing (US2) - Test on ALL pages

**Mobile (<768px)**:
- [ ] **Body text**: 14px (verify with browser inspect)
- [ ] **H1 headings**: 24px (e.g., "Fasting Tracker")
- [ ] **H2 headings**: 18px (e.g., section titles)
- [ ] **H3 headings**: 16px
- [ ] **Padding**: 12px around main content area
- [ ] **Line height**: Text is readable (not cramped)
- [ ] **No zoom triggered**: Forms don't trigger iOS auto-zoom

**Desktop (≥768px)**:
- [ ] **Body text**: 16px
- [ ] **H1 headings**: 32px
- [ ] **H2 headings**: 24px
- [ ] **H3 headings**: 20px
- [ ] **Padding**: 16px around main content area

**Issues Found**: ___________________________________________________________

---

#### 4. Entry Form (US3) - Test on `/entries/new` page

**Mobile (<768px)**:
- [ ] **Vertical layout**: Form fields stack vertically
- [ ] **Full-width buttons**: Submit/Cancel buttons span full width
- [ ] **Touch targets**: All inputs/selects ≥44px height
- [ ] **Date picker**: Native picker opens correctly
- [ ] **Select dropdown**: Native dropdown opens correctly
- [ ] **Text inputs**: No zoom on focus (16px font size or viewport meta tag)
- [ ] **Labels**: 14px text, visible and clear
- [ ] **Spacing**: Comfortable gap between fields

**Desktop (≥768px)**:
- [ ] **Horizontal layout**: Some fields side-by-side
- [ ] **Auto-width buttons**: Buttons are inline, not full width
- [ ] **Typography**: 16px text in inputs

**Issues Found**: ___________________________________________________________

---

#### 5. Settings Form (US3) - Test on `/settings` page

**Mobile (<768px)**:
- [ ] **Vertical layout**: Form fields stack vertically
- [ ] **Full-width buttons**: Save button spans full width
- [ ] **Touch targets**: All inputs ≥44px height
- [ ] **Select dropdown**: Fasting goal dropdown works
- [ ] **Number input**: Hour input works (keyboard pops up correctly)

**Desktop (≥768px)**:
- [ ] **Horizontal layout**: Some fields side-by-side
- [ ] **Auto-width buttons**: Save button is inline

**Issues Found**: ___________________________________________________________

---

#### 6. Admin FilterBar (US3) - Test on `/dashboard/users` (if admin)

**Mobile (<768px)**:
- [ ] **Vertical layout**: Role and Status filters stack vertically
- [ ] **Full-width selects**: Dropdowns span full width
- [ ] **Touch targets**: Filter dropdowns ≥44px height
- [ ] **Clear button**: Full-width on mobile

**Desktop (≥768px)**:
- [ ] **Horizontal layout**: Filters inline
- [ ] **Auto-width selects**: Dropdowns are compact

**Issues Found**: ___________________________________________________________

---

#### 7. Touch Target Validation (WCAG)

Test all interactive elements for minimum 44×44px size:

- [ ] **Buttons**: All buttons ≥44px height
- [ ] **Links**: Navigation links ≥44px height
- [ ] **Inputs**: Text/number inputs ≥44px height
- [ ] **Selects**: Dropdown selects ≥44px height
- [ ] **Checkboxes**: Clickable area ≥44px
- [ ] **Table actions**: Edit/Delete buttons ≥44px height

**Measure with**:
- Browser inspect tool (DevTools)
- Physical measurement (use your thumb - should tap accurately)

**Issues Found**: ___________________________________________________________

---

#### 8. Color Contrast & Readability

- [ ] **Body text**: Easily readable (4.5:1 contrast minimum)
- [ ] **Headings**: Clear hierarchy
- [ ] **Buttons**: Text visible on all backgrounds
- [ ] **Form labels**: Visible and clear
- [ ] **Links**: Distinguishable from body text
- [ ] **⏱ emoji**: Visible and recognizable

**Issues Found**: ___________________________________________________________

---

#### 9. Keyboard Navigation (Mobile Keyboards)

**On form pages**:
- [ ] **Tab order**: Logical progression through fields
- [ ] **Keyboard type**: Correct keyboard for input type (number, date, text)
- [ ] **Return key**: Submits form or moves to next field
- [ ] **No keyboard obstruction**: Form visible when keyboard open

**Issues Found**: ___________________________________________________________

---

#### 10. Performance & Responsiveness

- [ ] **Page load**: Fast load time (<3 seconds)
- [ ] **Smooth scrolling**: No lag or jank
- [ ] **Transitions**: No layout shift during breakpoint change
- [ ] **Form submission**: Responsive feedback
- [ ] **No console errors**: Open browser console, check for errors

**Issues Found**: ___________________________________________________________

---

## Browser-Specific Checks

### iOS Safari Specific
- [ ] **-webkit- prefixes**: Styles render correctly
- [ ] **Safe area**: Content respects notch/home indicator
- [ ] **Date picker**: Native iOS date picker works
- [ ] **Smooth scrolling**: Momentum scrolling works
- [ ] **Zoom**: Pinch-to-zoom disabled (if intended)

### Chrome Android Specific
- [ ] **Material design**: Native select/date pickers work
- [ ] **Address bar**: Layout adjusts when bar hides/shows
- [ ] **Keyboard overlay**: Forms remain accessible

### Samsung Internet Specific
- [ ] **Rendering**: Consistent with Chrome Android
- [ ] **Bottom menu bar**: Doesn't obstruct content
- [ ] **Reader mode**: Page displays correctly

---

## Critical Issues (Blockers)

List any issues that prevent core functionality:

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

---

## Minor Issues (Nice-to-fix)

List any cosmetic or minor usability issues:

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

---

## Overall Assessment

### Pass/Fail Criteria

- [ ] **All critical pages load**: /, /entries, /entries/new, /settings
- [ ] **No horizontal scroll**: On any viewport
- [ ] **Touch targets meet WCAG**: All interactive elements ≥44px
- [ ] **Typography scales**: Mobile (14px) and desktop (16px) work
- [ ] **Forms stack on mobile**: Vertical layout confirmed
- [ ] **Buttons full-width on mobile**: Confirmed
- [ ] **⏱ emoji renders**: Visible on all browsers
- [ ] **No console errors**: Clean console logs

**Overall Result**: PASS / FAIL (circle one)

**Recommendation**: Ready for production / Needs fixes (circle one)

---

## Sign-off

**Tester Name**: ___________________________________________  
**Date**: ___________________________________________  
**Signature**: ___________________________________________

---

## Quick Test URLs

When testing, navigate to:
- Homepage: `https://[your-domain]/`
- Entries: `https://[your-domain]/entries`
- New Entry: `https://[your-domain]/entries/new`
- Settings: `https://[your-domain]/settings`
- Admin: `https://[your-domain]/dashboard/users` (requires admin login)

---

## DevTools Mobile Emulation (Pre-Test)

Before testing on real devices, verify basics in Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375×667)
   - iPhone 12 Pro (390×844)
   - Pixel 5 (393×851)
   - iPad Mini (768×1024) - breakpoint boundary
   - Desktop (1024×768)

**DevTools Pre-Test Result**: PASS / FAIL (circle one)

---

## Troubleshooting Tips

### Issue: Horizontal scroll appears
- Check for fixed-width elements (should use `max-w-full`)
- Verify no absolute positioned elements exceed viewport
- Check table cells have `word-break` or `overflow-hidden`

### Issue: Touch targets too small
- Verify `min-h-[44px]` class applied
- Check for `py-2` or larger (8px vertical padding minimum)
- Ensure buttons/links have adequate padding

### Issue: Typography wrong size
- Clear browser cache
- Check `globals.css` media queries loaded
- Verify viewport meta tag in `<head>`: `width=device-width, initial-scale=1`

### Issue: Forms don't stack on mobile
- Check for `flex-col md:flex-row` pattern
- Verify breakpoint at 768px (not 640px or other)
- Clear cache and hard refresh

### Issue: ⏱ emoji doesn't render
- Check browser emoji support (older browsers may show □)
- Verify font-family includes system emoji fonts
- Consider fallback text if necessary

---

## Post-Test Actions

After completing testing:

1. [ ] Upload screenshots of each page/device to `specs/022-mobile-ux-improvements/screenshots/`
2. [ ] Document all issues in GitHub Issues (label: `bug`, `mobile-ux`)
3. [ ] Update `tasks.md` with T064 results
4. [ ] Share report with team
5. [ ] Schedule fixes for critical issues (if any)

---

**End of Cross-Browser Testing Checklist**
