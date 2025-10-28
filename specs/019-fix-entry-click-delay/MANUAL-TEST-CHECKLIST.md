# Manual Test Checklist - Link Optimization (T022)

**Date**: October 28, 2025  
**Feature**: 019-fix-entry-click-delay  
**Phase**: User Story 2 - Optimization Testing

## Test Environment

- **Browser**: Chrome/Edge
- **URL**: http://localhost:3000
- **Test User**: test@example.com / TestPass123

## Desktop Tests (1920x1080)

### Navigation Tests
- [ ] Click on Date column → Navigates to entry details
- [ ] Click on First Meal Time → Navigates to entry details
- [ ] Click on Last Meal Time → Navigates to entry details
- [ ] Click on Fasting Duration → Navigates to entry details
- [ ] Click on Morning Weight → Navigates to entry details
- [ ] Click on Hours of Sleep → Navigates to entry details
- [ ] Click on Ratings column → Navigates to entry details

### Prefetch Tests (Check Network Tab)
- [ ] Hover over any entry row → Prefetch request visible in Network tab
- [ ] Prefetch happens on first hover (not on every hover)
- [ ] Click after hover → Navigation is instant (<100ms)

### Action Button Tests
- [ ] Click "Edit" button → Opens edit modal (does NOT navigate)
- [ ] Click "Delete" button → Shows delete confirmation (does NOT navigate)
- [ ] Edit entry successfully → Modal closes, table updates
- [ ] Delete entry successfully → Entry removed from table

### Visual Tests
- [ ] Row hover shows gray background (hover:bg-gray-50)
- [ ] Cursor shows pointer on hovering row
- [ ] Link text shows hover color change (hover:text-blue-600 on date)
- [ ] Table columns aligned correctly
- [ ] No layout shifts or visual glitches

## Mobile Tests (375x667 - iPhone SE)

### Touch Navigation Tests
- [ ] Tap on Date column → Navigates to entry details
- [ ] Tap on First Meal Time → Navigates to entry details
- [ ] Tap on Fasting Duration → Navigates to entry details
- [ ] Tap on any cell → Navigates correctly

### Touch Action Tests
- [ ] Tap "Edit" button → Opens edit modal (does NOT navigate)
- [ ] Tap "Delete" button → Shows delete confirmation (does NOT navigate)
- [ ] No double-tap required for navigation
- [ ] Touch target size adequate (no mis-taps)

### Mobile Visual Tests
- [ ] Row hover states work on touch (if applicable)
- [ ] Table scrolls horizontally if needed
- [ ] Buttons remain clickable on mobile
- [ ] No touch delay (300ms delay removed by browser)

## Performance Tests

### Subjective Performance
- [ ] Navigation feels instant after hover
- [ ] No visible loading spinner on navigation
- [ ] Page transition smooth and fast
- [ ] No janky animations or delays

### DevTools Performance (Chrome)
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Hover over entry row
4. Click to navigate
5. Stop recording when page loads

**Expected Results**:
- [ ] Click-to-navigation < 100ms
- [ ] Full page load < 300ms
- [ ] No long tasks blocking main thread

### Network Tab Verification
- [ ] Prefetch requests visible on hover
- [ ] Prefetch status: 200 OK
- [ ] Navigation reuses prefetched data
- [ ] No duplicate requests for same entry

## Regression Tests

### Existing Functionality
- [ ] Sort entries by clicking column headers (if implemented)
- [ ] Filter entries by date range (if implemented)
- [ ] Pagination works (if implemented)
- [ ] Keyboard navigation (Tab, Enter) works

### Edge Cases
- [ ] Empty table state renders correctly
- [ ] Single entry renders correctly
- [ ] Many entries (20+) render without lag
- [ ] Long entry values don't break layout

## Accessibility Tests

### Screen Reader
- [ ] Row links announced correctly
- [ ] Action buttons have proper labels
- [ ] Navigate with screen reader (Tab + Enter) works

### Keyboard Navigation
- [ ] Tab to entry row links
- [ ] Enter key on link navigates
- [ ] Tab to action buttons
- [ ] Enter/Space on buttons triggers action (no navigation)

## Test Results

**Date Tested**: _________________  
**Tested By**: _________________  
**Browser/Version**: _________________  

**All Tests Passed**: ☐ Yes ☐ No

**Issues Found**:
```

---

## Next Steps After Manual Testing

1. If all tests pass → Mark T022 complete
2. Re-run baseline script → Generate POST-OPTIMIZATION-REPORT.md (T023)
3. Compare reports → Verify 50%+ improvement (T024)
4. If improvement insufficient → Investigate alternative optimizations (T025-T027)
