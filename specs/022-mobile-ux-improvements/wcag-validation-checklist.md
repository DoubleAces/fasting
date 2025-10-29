# WCAG 2.1 AA Validation Checklist - Feature 022

## Overview
This checklist ensures Feature 022 (Mobile UX Quick Fixes) meets WCAG 2.1 Level AA accessibility standards.

## Mobile Viewport Testing (375×667)

### Touch Targets (WCAG 2.5.5 - Target Size)
**Standard**: Minimum 44×44 CSS pixels for interactive elements

- [ ] **Entry Table**
  - [ ] Action buttons (Edit, Delete) ≥ 44px height
  - [ ] Row links (entry navigation) ≥ 44px height
  - [ ] All table cells with links ≥ 44px total height

- [ ] **Forms (EntryForm, SettingsForm)**
  - [ ] Text inputs ≥ 44px height (min-h-[44px])
  - [ ] Select dropdowns ≥ 44px height
  - [ ] Time input dropdowns ≥ 44px height
  - [ ] Submit buttons ≥ 44px height
  - [ ] Cancel buttons ≥ 44px height

- [ ] **Navigation**
  - [ ] Navbar links ≥ 44px tap target
  - [ ] Footer links ≥ 44px tap target

**How to validate**: Use browser DevTools > Elements > Computed > Box Model to check height values

---

### Color Contrast (WCAG 1.4.3 - Contrast Minimum)
**Standard**: 4.5:1 for normal text, 3:1 for large text (≥18pt or ≥14pt bold)

- [ ] **Text on backgrounds**
  - [ ] Body text (14px mobile) on white: Check contrast ratio
  - [ ] Table text on gray-50 background
  - [ ] Button text on primary/secondary backgrounds
  - [ ] Link text (blue-600) on white
  - [ ] Error messages (red text) on white

- [ ] **Disabled states**
  - [ ] Disabled button text contrast (should be exempt or pass 3:1)

**How to validate**: 
1. Use Chrome DevTools > Elements > Styles > Color picker > Contrast ratio indicator
2. Or use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

---

### Text Sizing and Zoom (WCAG 1.4.4 - Resize Text)
**Standard**: Text can be resized up to 200% without loss of content or functionality

- [ ] **200% zoom test**
  - [ ] Entry table remains usable (3 columns visible)
  - [ ] Forms remain usable (no horizontal scrolling)
  - [ ] All text remains readable
  - [ ] No overlapping content
  - [ ] No text cut off

**How to validate**: 
1. Set browser zoom to 200% (Ctrl/Cmd + +)
2. Navigate through all pages
3. Verify no content is hidden or inaccessible

---

### Mobile Keyboard Navigation (WCAG 2.1.1 - Keyboard)
**Standard**: All functionality available via keyboard

- [ ] **Tab order**
  - [ ] Tab through entry table (should skip hidden columns)
  - [ ] Tab through forms (logical order)
  - [ ] Tab through navigation (all links reachable)

- [ ] **Focus indicators**
  - [ ] All interactive elements show visible focus ring
  - [ ] Focus ring ≥ 2px, contrasting color

**How to validate**: 
1. Use keyboard only (Tab, Shift+Tab, Enter, Space)
2. Navigate entire app without mouse/touch
3. Verify focus indicators visible at all times

---

### Semantic HTML (WCAG 4.1.2 - Name, Role, Value)
**Standard**: Elements use correct semantic HTML and ARIA attributes

- [ ] **Tables**
  - [ ] `<table>` element used (not divs)
  - [ ] `<thead>`, `<tbody>` present
  - [ ] `<th>` headers have scope attribute
  - [ ] Table has accessible name (aria-label or caption)

- [ ] **Forms**
  - [ ] All inputs have associated `<label>`
  - [ ] Labels use `htmlFor` matching input `id`
  - [ ] Required fields marked with `required` attribute
  - [ ] Error messages associated via `aria-describedby`

- [ ] **Buttons**
  - [ ] All buttons use `<button>` element
  - [ ] Buttons have descriptive text or `aria-label`

**How to validate**: 
1. Run Lighthouse accessibility audit (Chrome DevTools > Lighthouse > Accessibility)
2. Or use axe DevTools extension
3. Verify no semantic HTML violations

---

### Responsive Reflow (WCAG 1.4.10 - Reflow)
**Standard**: No horizontal scrolling at 320px width with 400% zoom

- [ ] **Mobile viewport (375px)**
  - [ ] No horizontal scrolling on any page
  - [ ] Entry table uses 3 columns (no overflow)
  - [ ] Forms stack vertically (no side-by-side overflow)

- [ ] **Narrow viewport (320px)**
  - [ ] All content remains accessible
  - [ ] No text truncated
  - [ ] All buttons remain usable

**How to validate**: 
1. Set DevTools responsive mode to 320×568
2. Navigate through all pages
3. Verify no horizontal scroll bars appear

---

## Lighthouse Audit Results

### Run Lighthouse
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select:
   - ✅ Accessibility
   - ✅ Mobile device
   - ✅ Clear storage
4. Click "Analyze page load"

### Target Scores
- **Accessibility**: ≥ 95/100
- **Performance**: ≥ 90/100 (verify no performance regression from CSS changes)
- **Best Practices**: ≥ 90/100

### Expected Results
- [ ] **Accessibility Score**: ___/100
- [ ] **Touch targets ≥ 44px**: Pass
- [ ] **Color contrast ≥ 4.5:1**: Pass
- [ ] **Semantic HTML**: Pass
- [ ] **ARIA attributes**: Pass
- [ ] **Focus indicators**: Pass

---

## Issues Found

### Issue Template
```
**Issue**: [Brief description]
**WCAG Criterion**: [1.4.3, 2.5.5, etc.]
**Severity**: [Critical / High / Medium / Low]
**Location**: [File path and component]
**Fix Required**: [What needs to change]
**Status**: [Open / Fixed / Won't Fix]
```

### Issues Log

_(Add issues here as they're discovered)_

---

## Sign-Off

- [ ] All touch targets ≥ 44px validated
- [ ] All color contrasts ≥ 4.5:1 validated
- [ ] 200% zoom test passed
- [ ] Keyboard navigation verified
- [ ] Semantic HTML validated
- [ ] No horizontal scrolling at 320px
- [ ] Lighthouse accessibility score ≥ 95

**Tested By**: ___________________  
**Date**: ___________________  
**Lighthouse Score**: ___/100  
**Notes**: ___________________
