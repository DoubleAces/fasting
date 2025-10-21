# Quickstart: Terms and Conditions Page

**Feature**: Terms and Conditions Page  
**Sprint**: Sprint 003  
**Last Updated**: October 21, 2025

Quick reference guide for developers implementing the Terms and Conditions page feature.

---

## 🎯 Feature Summary

Add a comprehensive Terms and Conditions page with:
- Standalone `/terms` page accessible to all users (authenticated or not)
- Section anchors for direct linking to specific clauses
- Health-specific disclaimers for fasting tracker app
- Terms acceptance checkbox integrated into registration flow
- User consent timestamp tracking in database

**Priority**: P1 (Required for legal compliance before public launch)

---

## 📋 Prerequisites

### Required Knowledge
- Next.js 15 App Router (Server Components)
- React with Tailwind CSS v4
- MongoDB with Mongoose
- Jest + React Testing Library
- TDD workflow (constitution requirement)

### Environment Setup
```powershell
# Clone repository (if not already done)
git clone <repository-url>
cd fasting

# Install dependencies
npm install

# Set up environment variables (no new vars needed for this feature)
# Verify existing .env.local has:
# - MONGODB_URI
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL

# Start development server
npm run dev
```

### Database Setup
```powershell
# No database initialization needed beyond existing User model
# Feature extends User model with new field (automatic on first migration)
```

---

## 🚀 Quick Start

### 1. Create Feature Branch
```powershell
git checkout -b 003-terms-conditions-page
```

### 2. Component Structure Overview

```
src/
├── app/
│   └── terms/
│       └── page.js              # Main terms page (Server Component)
│
├── components/
│   ├── atoms/
│   │   └── TermsSection.js      # Individual section with anchor
│   │
│   ├── molecules/
│   │   └── TermsCheckbox.js     # Acceptance checkbox for registration
│   │
│   └── organisms/
│       └── TermsContent.js      # Full terms content with all sections
│
└── lib/
    └── models/
        └── User.js              # Extend with termsAcceptedAt field
```

### 3. Development Workflow (TDD)

**Step 1: Write Tests First**
```powershell
# Create test file for component
# Example: tests/components/atoms/TermsSection.test.js

# Run tests (should fail - red phase)
npm test -- TermsSection
```

**Step 2: Implement Component**
```powershell
# Create component file
# Example: src/components/atoms/TermsSection.js

# Run tests (should pass - green phase)
npm test -- TermsSection
```

**Step 3: Refactor**
```powershell
# Improve code quality without changing behavior
# Re-run tests to ensure no regressions
npm test -- TermsSection
```

**Repeat for each component** (atoms → molecules → organisms → pages)

---

## 🧪 Testing Commands

### Unit Tests
```powershell
# Run all unit tests
npm test

# Run tests for specific component
npm test -- TermsSection
npm test -- TermsCheckbox
npm test -- TermsContent

# Run tests in watch mode (during development)
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Integration Tests
```powershell
# Run integration tests (registration form with terms)
npm test -- tests/integration/registration-with-terms.test.js

# Run all integration tests
npm test -- tests/integration/
```

### E2E Tests
```powershell
# Run Playwright tests (headless)
npm run test:e2e

# Run Playwright tests with UI
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e -- tests/e2e/terms-page.spec.js

# Debug mode
npm run test:e2e -- --debug
```

### Accessibility Tests
```powershell
# Run axe accessibility tests (part of E2E suite)
npm run test:e2e -- tests/e2e/terms-accessibility.spec.js
```

---

## 📁 File Creation Order

**Phase 1: Database & Data**
1. ✅ `src/lib/models/User.js` - Extend model with termsAcceptedAt field
2. ✅ `tests/unit/models/User.test.js` - Test User model extension

**Phase 2: Atomic Components**
3. ✅ `tests/components/atoms/TermsSection.test.js` - Test file first (TDD)
4. ✅ `src/components/atoms/TermsSection.js` - Implement section component

**Phase 3: Molecular Components**
5. ✅ `tests/components/molecules/TermsCheckbox.test.js` - Test file first (TDD)
6. ✅ `src/components/molecules/TermsCheckbox.js` - Implement checkbox component

**Phase 4: Organism Components**
7. ✅ `tests/components/organisms/TermsContent.test.js` - Test file first (TDD)
8. ✅ `src/components/organisms/TermsContent.js` - Implement full content organism

**Phase 5: Pages**
9. ✅ `tests/pages/terms.test.js` - Test terms page (TDD)
10. ✅ `src/app/terms/page.js` - Implement terms page

**Phase 6: Integration**
11. ✅ Modify `src/app/(auth)/register/page.js` - Add TermsCheckbox to RegisterForm
12. ✅ `tests/integration/registration-with-terms.test.js` - Test registration flow

**Phase 7: E2E**
13. ✅ `tests/e2e/terms-page.spec.js` - Test complete user journey
14. ✅ `tests/e2e/terms-accessibility.spec.js` - Test WCAG 2.1 AA compliance

---

## 🔍 Key Implementation Details

### User Model Extension
```javascript
// src/lib/models/User.js

termsAcceptedAt: {
  type: Date,
  required: function() { return this.isNew; },
  default: Date.now,
  immutable: true,
  validate: {
    validator: (value) => value <= new Date(),
    message: 'Terms acceptance date cannot be in the future'
  }
}
```

### Terms Checkbox Component (Molecule)
```javascript
// src/components/molecules/TermsCheckbox.js
// Key props:
// - checked: boolean (controlled component)
// - onChange: (checked: boolean) => void
// - error: string | null (validation error message)
// - required: true (always required)
```

### Terms Page (Server Component)
```javascript
// src/app/terms/page.js
// - Metadata export for SEO (title, description, robots)
// - Server Component (no client-side JS needed)
// - Static rendering (ISR not needed - content changes rarely)
```

### Registration Form Integration
```javascript
// Modify src/app/(auth)/register/page.js
// 1. Import TermsCheckbox
// 2. Add termsAccepted state
// 3. Add client-side validation
// 4. Add server-side validation in API route
// 5. Set termsAcceptedAt on User.create()
```

---

## 🎨 Styling Guidelines

### Tailwind CSS v4 Classes
```javascript
// Section heading
"text-2xl font-bold mb-4 mt-8"

// Section content
"text-gray-700 dark:text-gray-300 mb-6 leading-relaxed"

// Health disclaimer (highlighted)
"bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6"

// Checkbox label
"flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"

// Error message
"text-red-600 dark:text-red-400 text-sm mt-1"
```

### Responsive Design
- Mobile-first approach (default: mobile styles)
- Tablet breakpoint: `md:` (768px)
- Desktop breakpoint: `lg:` (1024px)
- Max content width: 800px (readable line length)

### Dark Mode
- All components must support dark mode
- Use Tailwind's `dark:` variant for color overrides
- Test in both light and dark modes

---

## ✅ Acceptance Criteria Checklist

Before marking feature complete, verify:

### Functional Requirements
- [ ] `/terms` page renders with all 10 sections
- [ ] Each section has working URL anchor (e.g., `/terms#health-disclaimer`)
- [ ] Health disclaimer section is visually highlighted
- [ ] Contact email is displayed in Contact Information section
- [ ] Terms checkbox appears in registration form (unchecked by default)
- [ ] Registration fails with error if checkbox not checked
- [ ] `termsAcceptedAt` timestamp saved to User document on registration
- [ ] Page is accessible without authentication
- [ ] Footer link to `/terms` works correctly

### Non-Functional Requirements
- [ ] Lighthouse SEO score > 90
- [ ] Page load time < 2 seconds (3G connection)
- [ ] WCAG 2.1 AA compliance (axe-core tests pass)
- [ ] Keyboard navigation works (Tab, Enter, Esc keys)
- [ ] Screen reader announces all content correctly
- [ ] Mobile responsive (320px - 1920px viewport)
- [ ] Dark mode styling correct

### Test Coverage
- [ ] Unit tests: 90% coverage for all components
- [ ] Integration tests: 100% coverage for registration flow
- [ ] E2E tests: Critical paths covered (view terms, register with acceptance)
- [ ] Accessibility tests: All WCAG 2.1 AA rules pass

### Code Quality
- [ ] ESLint: Zero errors, zero warnings
- [ ] Prettier: Code formatted consistently
- [ ] No console.log() statements in production code
- [ ] PropTypes defined for all components
- [ ] JSDoc comments for complex functions

---

## 🐛 Common Issues & Solutions

### Issue: Checkbox stays checked after validation error
**Solution**: Reset checkbox state when form submission fails
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ... submit logic
  } catch (error) {
    setTermsAccepted(false); // Reset checkbox
    setError(error.message);
  }
};
```

### Issue: Anchor links don't scroll smoothly
**Solution**: Add CSS smooth scrolling
```css
/* In globals.css */
html {
  scroll-behavior: smooth;
}
```

### Issue: Dark mode colors don't meet contrast ratio
**Solution**: Use darker shades for dark mode text
```javascript
// Instead of: text-gray-600 dark:text-gray-600
// Use: text-gray-700 dark:text-gray-300
```

### Issue: Screen reader skips over section anchors
**Solution**: Use semantic headings with IDs
```javascript
<h2 id="health-disclaimer">Health Disclaimer</h2>
// Not: <div id="health-disclaimer">Health Disclaimer</div>
```

---

## 📚 Related Documentation

### Project Documentation
- [`specs/003-terms-conditions-page/spec.md`](./spec.md) - Full feature specification
- [`specs/003-terms-conditions-page/research.md`](./research.md) - Technical decisions
- [`specs/003-terms-conditions-page/data-model.md`](./data-model.md) - Database schema
- [`specs/003-terms-conditions-page/tasks.md`](./tasks.md) - Task breakdown (generated after /speckit.tasks)

### External Resources
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mongoose Schema Validation](https://mongoosejs.com/docs/validation.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

## 🚦 Next Steps

After completing this feature:

1. **Code Review**: Submit PR for team review
2. **QA Testing**: Manual testing on staging environment
3. **Legal Review**: Legal team verifies terms content
4. **Production Deployment**: Deploy to production via Vercel
5. **Monitor**: Check error logs and user feedback for 48 hours

---

## 💬 Need Help?

**Technical Issues**:
- Check `TESTING.md` for testing guidelines
- Review `speckit-guide.md` for SpecKit workflow
- Search existing GitHub issues

**Legal Questions**:
- Consult legal team before modifying terms content
- Health disclaimers must be reviewed by legal counsel
- Do not deploy without legal sign-off

**Spec Questions**:
- Re-read [`spec.md`](./spec.md) for requirements clarification
- Check [`research.md`](./research.md) for technical decisions
- Review clarification answers in spec.md (Question/Answer sections)

---

**Ready to Start?** Follow the [Development Workflow](#-quick-start) section above!
