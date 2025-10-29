# Phase 0: Research - Mobile UX Quick Fixes

**Feature**: 022 - Mobile UX Improvements  
**Phase**: Research (Phase 0)  
**Date**: January 2025  

---

## 1. Problem Space Research

### 1.1 Mobile UX Pain Points

**Current Issues** (from spec edge cases and assumptions):
- Entries table shows all 6 columns on mobile → horizontal scrolling required
- Text sizes optimized for desktop (16px+) → too large on mobile screens
- Form layouts horizontal (side-by-side) → poor mobile ergonomics
- Padding/spacing generous for desktop → wastes limited mobile space
- Button positions varied → inconsistent with mobile conventions

**Real-World Usage Patterns**:
- Mobile users primarily view recent entries (last 7-14 days)
- Mobile users focus on quick data entry, not extensive editing
- Mobile sessions are shorter (<2 minutes typical)
- Touch targets must be ≥44×44px (Apple HIG, Material Design)
- One-handed operation preferred (thumb zone optimization)

**Inspiration: Zero Fasting App**:
- Card-based entry design (out of scope for Feature 022, but future consideration)
- Minimal information density on mobile
- Large, bottom-positioned primary actions
- Compact typography (12-14px body text)
- Generous touch targets despite compact spacing

### 1.2 Industry Standards & Best Practices

**Responsive Breakpoints**:
- **Mobile**: <768px (industry standard, matches Tailwind `md:` breakpoint)
- **Tablet**: 768px-1024px
- **Desktop**: ≥1024px
- **Common mobile viewports**: 375×667 (iPhone SE), 390×844 (iPhone 12/13), 360×640 (Android)

**Mobile Typography Scale**:
- **Body text**: 14px minimum (WCAG readability)
- **Small text**: 12px minimum (labels, metadata)
- **Headings**: 16-20px (mobile h2-h3)
- **Line height**: 1.5 for body, 1.2 for headings
- **Letter spacing**: -0.01em for compact feel

**Touch Target Sizing** (WCAG 2.5.5, Level AAA):
- **Minimum**: 44×44px (Apple HIG, WCAG AAA)
- **Comfortable**: 48×48px (Material Design)
- **Spacing**: 8px minimum between targets
- **Exception**: Inline text links (handled by surrounding padding)

**Mobile Form Best Practices**:
- Vertical stacking (single-column layout)
- Labels above inputs (not side-by-side)
- Full-width inputs
- Large, bottom-positioned primary buttons
- Sticky footers for CTAs
- Minimize typing (use native inputs: date pickers, number pads)

---

## 2. Technical Research

### 2.1 Tailwind CSS Responsive Utilities

**Breakpoint System** (verify in `tailwind.config.js`):
```javascript
// Default Tailwind breakpoints (Tailwind CSS 4.0)
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',   // ← OUR MOBILE THRESHOLD
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

**Mobile-First Approach**:
- Base styles = mobile (<768px)
- `md:` prefix = desktop (≥768px)
- Example: `text-sm md:text-base` → 14px mobile, 16px desktop

**Key Utilities for Feature 022**:

**Responsive Display**:
```html
<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only</div>
```

**Responsive Typography**:
```html
<!-- 12px mobile, 14px desktop -->
<p class="text-xs md:text-sm">Compact text</p>

<!-- 14px mobile, 16px desktop -->
<p class="text-sm md:text-base">Body text</p>

<!-- 16px mobile, 20px desktop -->
<h2 class="text-base md:text-xl">Heading</h2>
```

**Responsive Spacing**:
```html
<!-- 12px mobile, 16px desktop -->
<div class="p-3 md:p-4">Content</div>

<!-- 8px mobile, 12px desktop -->
<div class="gap-2 md:gap-3">Flex/Grid</div>
```

**Responsive Layout**:
```html
<!-- Vertical mobile, horizontal desktop -->
<div class="flex flex-col md:flex-row">

<!-- Full-width mobile, auto desktop -->
<button class="w-full md:w-auto">Button</button>
```

**Touch Target Optimization**:
```html
<!-- 44px minimum height -->
<button class="min-h-[44px] px-4">Touch-friendly</button>

<!-- 48px comfortable height -->
<button class="h-12 px-4">Material Design size</button>
```

### 2.2 Table Responsive Patterns

**Pattern 1: Hide Columns** (CHOSEN for Feature 022):
```html
<!-- Show only essential columns on mobile -->
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th class="hidden md:table-cell">Start</th>
      <th class="hidden md:table-cell">End</th>
      <th>Duration</th>
      <th class="hidden md:table-cell">Status</th>
      <th>Actions</th>
    </tr>
  </thead>
</table>
```
**Pros**: Simple, no JavaScript, preserves table structure  
**Cons**: Loss of information (acceptable for mobile)

**Pattern 2: Card-Based Layout** (OUT OF SCOPE - future Feature 023):
```html
<!-- Desktop: table, Mobile: cards -->
<div class="block md:hidden">
  <!-- Card layout for mobile -->
</div>
<table class="hidden md:table">
  <!-- Full table for desktop -->
</table>
```
**Pros**: Better mobile UX, more information density  
**Cons**: Higher complexity, more code, duplicate markup

**Pattern 3: Horizontal Scroll** (REJECTED):
```html
<div class="overflow-x-auto">
  <table class="min-w-full">...</table>
</div>
```
**Pros**: All columns visible  
**Cons**: Poor UX (requires horizontal scrolling), violates mobile-first principle

### 2.3 Form Optimization Patterns

**Vertical Stacking Pattern** (CHOSEN):
```html
<!-- Mobile: vertical, Desktop: horizontal -->
<form>
  <div class="flex flex-col md:flex-row gap-4">
    <label class="flex-1">
      <span class="block mb-2">Start Time</span>
      <input type="time" class="w-full" />
    </label>
    <label class="flex-1">
      <span class="block mb-2">End Time</span>
      <input type="time" class="w-full" />
    </label>
  </div>
</form>
```

**Bottom-Positioned Buttons** (CHOSEN):
```html
<!-- Sticky footer on mobile, inline on desktop -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:static md:border-0">
  <button class="w-full md:w-auto">Submit</button>
</div>
```

### 2.4 Testing Strategy Research

**Component Testing** (Jest + React Testing Library):
```javascript
// Test responsive visibility
test('hides columns on mobile', () => {
  render(<EntryList entries={mockData} />);
  
  // Mock mobile viewport
  global.innerWidth = 375;
  global.dispatchEvent(new Event('resize'));
  
  // Assert mobile columns hidden
  expect(screen.queryByText('Start Time')).not.toBeVisible();
  expect(screen.getByText('Date')).toBeVisible();
});
```

**E2E Testing** (Playwright):
```javascript
// Test mobile viewport
test.use({ viewport: { width: 375, height: 667 } });

test('mobile entries table displays correctly', async ({ page }) => {
  await page.goto('/entries');
  
  // Assert mobile layout
  await expect(page.locator('table th').nth(1)).toBeHidden();
  await expect(page.locator('.md\\:table-cell')).toBeHidden();
  
  // Assert touch targets
  const button = page.locator('button').first();
  const box = await button.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});
```

**Visual Regression Testing** (Playwright screenshots):
```javascript
test('mobile layout snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/entries');
  await expect(page).toHaveScreenshot('entries-mobile.png');
});
```

---

## 3. Dependency Analysis

### 3.1 Existing Codebase Dependencies

**Required Files** (must exist and be reviewed):
1. `src/components/organisms/EntryList.js` - Primary modification target
2. `tailwind.config.js` - Verify breakpoint configuration
3. `src/app/globals.css` - Add mobile typography utilities
4. Form components in `src/components/molecules/` - Apply responsive patterns
5. `tests/components/organisms/EntryList.test.js` - Extend with mobile tests

**External Dependencies** (already installed):
- `tailwindcss@4.0` - Responsive utilities
- `next@15.5.6` - Server/Client Components
- `react@19.1.0` - Component rendering
- `jest@29.x` - Unit/component testing
- `@testing-library/react@16.x` - Component test utilities
- `playwright@1.x` - E2E testing

**No New Dependencies Required**: Feature uses existing tech stack.

### 3.2 Third-Party Library Research

**NOT NEEDED**: This feature requires zero external libraries beyond existing dependencies.

**Rejected Alternatives**:
- `react-responsive` - Unnecessary (Tailwind CSS handles all responsive logic)
- `react-table` - Overkill (simple table, no sorting/filtering needed)
- `styled-components` - Against constitution (use Tailwind CSS)

---

## 4. Risk Analysis

### 4.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking desktop layout | Low | High | TDD: Write tests for desktop first, ensure `md:` classes preserve current behavior |
| Touch targets too small | Medium | High | Follow 44px minimum rule, add explicit `min-h-[44px]` classes, validate with Playwright bounding box tests |
| Text too small (WCAG) | Low | Medium | Use 14px minimum body text (`text-sm`), maintain 4.5:1 contrast ratios |
| Table unusable on mobile | Low | High | Show only Date/Duration/Actions columns, hide secondary data (Start/End/Status) |
| Forms don't fit viewport | Low | Medium | Use vertical stacking (`flex-col`), full-width inputs, test on 375px viewport |
| CSS specificity conflicts | Low | Low | Tailwind utilities have high specificity, but check for custom CSS overrides in globals.css |

### 4.2 UX Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Information loss (hidden columns) | High | Low | Acceptable tradeoff for mobile (users can view details page), show most critical data only |
| Sticky button covers content | Medium | Medium | Add bottom padding to content, use `pb-20` on parent containers |
| Landscape mode issues | Low | Low | Test both portrait and landscape, use height-based media queries if needed |
| Existing users resist change | Low | Low | Desktop unchanged (no disruption), mobile is net improvement |

### 4.3 Testing Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS changes hard to test | Medium | Medium | Use visual regression tests (Playwright screenshots), test rendered output not CSS classes |
| Viewport tests flaky | Medium | Low | Use consistent viewport sizes (375×667), add explicit waits for layout shifts |
| Missing edge cases | Low | Medium | Test multiple viewports (375, 390, 414), test both orientations |

---

## 5. Alternative Approaches (Considered & Rejected)

### 5.1 Card-Based Mobile Layout

**Description**: Replace table with card-based layout on mobile (like Zero app).

**Pros**:
- Better mobile UX (more native feel)
- More information density (can show all data in card format)
- Easier touch interactions

**Cons**:
- Higher implementation complexity (2-3× effort)
- Requires duplicate markup (table for desktop, cards for mobile)
- More components to test
- OUT OF SCOPE for Feature 022 (this is "quick fixes")

**Decision**: **REJECTED** - Deferred to future Feature 023 (Mobile UX Phase 2)

### 5.2 Horizontal Scrolling Table

**Description**: Keep all columns, allow horizontal scroll on mobile.

**Pros**:
- All data visible
- Minimal code changes

**Cons**:
- Poor mobile UX (horizontal scrolling is anti-pattern)
- Violates mobile-first principle
- Difficult to discover scrollability

**Decision**: **REJECTED** - Poor UX, violates constitution

### 5.3 CSS Media Queries (not Tailwind)

**Description**: Use custom CSS media queries instead of Tailwind utilities.

**Pros**:
- More control over exact breakpoints

**Cons**:
- Violates constitution (use Tailwind CSS)
- More verbose (separate CSS file)
- Harder to maintain
- No utility-first benefits

**Decision**: **REJECTED** - Violates constitution Principle I (use existing tools)

### 5.4 JavaScript-Based Responsive Logic

**Description**: Use `useMediaQuery` hook to conditionally render components.

**Pros**:
- Full programmatic control
- Can render different component trees

**Cons**:
- Requires JavaScript (violates CSS-only constraint)
- Performance impact (client-side rendering)
- More complex testing
- Violates progressive enhancement

**Decision**: **REJECTED** - Violates CSS-only constraint (NFR-004), poor performance

---

## 6. Recommended Approach

### 6.1 Technical Strategy

**Pattern**: Mobile-First Responsive CSS using Tailwind Utilities

**Core Principles**:
1. **Base styles = Mobile** (<768px default)
2. **`md:` prefix = Desktop** (≥768px overrides)
3. **CSS-only** (zero JavaScript)
4. **Progressive enhancement** (desktop unchanged)
5. **TDD workflow** (tests first, implementation second)

### 6.2 Implementation Plan

**Phase 1: Entries Table Optimization** (US1)
- Hide non-essential columns on mobile (`hidden md:table-cell`)
- Show only: Date, Duration, Actions
- Reduce padding: `p-3 md:p-4` → `p-2 md:p-4`
- Ensure 44px touch targets on action buttons

**Phase 2: Typography & Spacing** (US2)
- Reduce mobile text: `text-sm md:text-base` (14px → 16px)
- Compact spacing: `gap-2 md:gap-4` (8px → 16px)
- Add mobile typography utilities to `globals.css`

**Phase 3: Form Layout** (US3)
- Vertical stacking: `flex-col md:flex-row`
- Full-width inputs: `w-full md:w-auto`
- Bottom-positioned buttons: `fixed bottom-0 md:static`
- Sticky footer with padding

**Testing Strategy**:
1. Write component tests (Jest + RTL) for responsive classes
2. Write E2E tests (Playwright) for mobile viewports
3. Visual regression tests (screenshots)
4. Manual testing on real devices (iPhone SE, Android)

### 6.3 Success Metrics

**Quantitative**:
- Lighthouse Mobile score: ≥90 (maintain current)
- Touch targets: 100% ≥44px
- WCAG contrast: 100% ≥4.5:1
- Test coverage: ≥80% (new mobile tests)

**Qualitative**:
- No horizontal scrolling required
- All critical data visible on mobile
- Forms completable without zooming
- Desktop experience unchanged

---

## 7. Open Questions

**Q1**: Should we add a "View Details" button to see hidden columns on mobile?  
**A**: No - out of scope for Feature 022. Users can tap the entry row to view full details page (existing functionality).

**Q2**: What about tablet (768px-1024px) - mobile or desktop layout?  
**A**: Desktop layout (≥768px shows all columns). Tablets have enough screen space for full table.

**Q3**: Should buttons have icon-only mode on mobile?  
**A**: No - keep text labels for accessibility. Icons can be added as enhancement but not replacement.

**Q4**: Do we need different padding for iPhone SE (375px) vs. larger phones (390px+)?  
**A**: No - single mobile breakpoint (<768px) is sufficient. Tailwind utilities scale well across mobile sizes.

**Q5**: Should we test on Android Chrome AND iOS Safari?  
**A**: Yes - Playwright supports both. Test on both to catch browser-specific rendering issues.

---

## 8. Next Steps (Phase 1)

1. ✅ **Research Complete** - Proceed to Phase 1: Design
2. 📝 **Create data-model.md** - N/A (no data model changes)
3. 📝 **Create contracts/** - N/A (no API changes)
4. 📝 **Create quickstart.md** - Implementation guide with code samples
5. 🔄 **Re-run Constitution Check** - Verify design compliance
6. ➡️ **Proceed to `/speckit.tasks`** - Generate TDD task breakdown

---

**Phase 0 Status**: ✅ **COMPLETE**  
**Next Phase**: Phase 1 (Design & Contracts)  
**Estimated Time**: Phase 1 = 30 minutes (quickstart.md only)
