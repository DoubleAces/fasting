# Quickstart Guide: Privacy Policy Page

**Feature**: Privacy Policy Page  
**Branch**: 004-privacy-policy-page  
**Date**: October 21, 2025

## Overview

This quickstart provides a concise, actionable guide to implementing the Privacy Policy page feature. It follows the proven component architecture from Spec 003 (Terms and Conditions page) with adapted components and privacy-specific content.

---

## Prerequisites

✅ **Complete**:
- Spec 003 (Terms and Conditions page) - provides component architecture patterns
- Next.js 15.5.6 with App Router
- Tailwind CSS v4 configured
- Jest + React Testing Library setup
- Playwright E2E testing configured

⚠️ **Verify Before Starting**:
- Footer component location (for link addition)
- RegisterForm component location (for link addition)
- Sitemap.js location (for route addition)

---

## Implementation Sequence (TDD)

### Phase 1: Core Components (Priority: P1)

**User Story 1: View Privacy Policy Before Registration**

#### Step 1.1: PrivacySection Component (Atom)

**File**: `src/components/atoms/PrivacySection.js`

**Test First** (`tests/components/atoms/PrivacySection.test.js`):

```javascript
describe('PrivacySection', () => {
  it('renders section with correct id', () => {
    render(<PrivacySection id="test-section" title="Test">Content</PrivacySection>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('id', 'test-section');
  });

  it('updates URL when heading is clicked', () => {
    const pushStateSpy = jest.spyOn(window.history, 'pushState');
    render(<PrivacySection id="test-section" title="Test">Content</PrivacySection>);
    fireEvent.click(screen.getByText('Test'));
    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '#test-section');
  });

  it('is keyboard accessible', () => {
    render(<PrivacySection id="test-section" title="Test">Content</PrivacySection>);
    const heading = screen.getByText('Test');
    expect(heading).toHaveAttribute('tabIndex', '0');
    fireEvent.keyDown(heading, { key: 'Enter' });
    // Assert URL update
  });
});
```

**Implementation Pattern** (adapt from TermsSection):

```javascript
'use client';

export default function PrivacySection({ id, title, children, level = 2 }) {
  const handleClick = () => {
    window.history.pushState(null, '', `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const Heading = `h${level}`;

  return (
    <section id={id} className="mb-8 pb-8 border-b border-gray-200">
      <Heading
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        tabIndex={0}
        className="text-2xl font-semibold text-gray-900 mb-4 cursor-pointer hover:text-blue-600 transition-colors"
      >
        {title}
      </Heading>
      <div className="text-gray-700 space-y-4">
        {children}
      </div>
    </section>
  );
}
```

**Run Tests**: `npm test tests/components/atoms/PrivacySection.test.js`

---

#### Step 1.2: PrivacyContent Component (Organism)

**File**: `src/components/organisms/PrivacyContent.js`

**Test First** (`tests/components/organisms/PrivacyContent.test.js`):

```javascript
describe('PrivacyContent', () => {
  it('renders all 10 required sections', () => {
    render(<PrivacyContent />);
    const sectionIds = [
      'information-we-collect',
      'how-we-use-your-information',
      'data-storage-and-security',
      'data-sharing-and-disclosure',
      'your-privacy-rights',
      'cookies-and-tracking',
      'health-information',
      'childrens-privacy',
      'international-users',
      'contact-information',
    ];
    sectionIds.forEach(id => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  it('displays effective date', () => {
    render(<PrivacyContent />);
    expect(screen.getByText(/Effective Date:/)).toBeInTheDocument();
  });

  it('includes health information disclaimer', () => {
    render(<PrivacyContent />);
    expect(screen.getByText(/fasting data/i)).toBeInTheDocument();
  });
});
```

**Implementation** (10 sections with default content):

```javascript
import PrivacySection from '@/components/atoms/PrivacySection';

export default function PrivacyContent() {
  return (
    <article>
      <div className="mb-8 text-sm text-gray-600">
        <p>Effective Date: October 21, 2025</p>
        <p>Last Updated: October 21, 2025</p>
      </div>

      <PrivacySection id="information-we-collect" title="1. Information We Collect">
        <p>We collect the following types of information when you use our fasting tracking service:</p>
        <h3 className="font-semibold mt-4 mb-2">Personal Data</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Name and email address (for account creation)</li>
          <li>Profile picture (if using Google OAuth)</li>
          <li>Authentication tokens and session information</li>
        </ul>
        <h3 className="font-semibold mt-4 mb-2">Health Data</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fasting start and end times</li>
          <li>Fasting duration and frequency</li>
          <li>Weight tracking data (if provided)</li>
          <li>Notes and journal entries related to fasting</li>
        </ul>
        <h3 className="font-semibold mt-4 mb-2">Usage Data</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>App interactions and feature usage</li>
          <li>Device information and browser type</li>
          <li>IP address and general location</li>
        </ul>
      </PrivacySection>

      <PrivacySection id="how-we-use-your-information" title="2. How We Use Your Information">
        <p>We use your information for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Service Provision:</strong> To provide and maintain our fasting tracking features</li>
          <li><strong>Communication:</strong> To send account-related notifications and respond to support requests</li>
          <li><strong>Analytics:</strong> To understand how users interact with our app and improve features</li>
          <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
        </ul>
        <p className="mt-4">We do not use your health data for advertising or share it with third parties for marketing purposes.</p>
      </PrivacySection>

      {/* ... Add 8 more sections with comprehensive content ... */}
      {/* See research.md for detailed content requirements */}

      <PrivacySection id="contact-information" title="10. Contact Information">
        <p>If you have questions or concerns about this privacy policy or our data practices, please contact us:</p>
        <ul className="list-none space-y-2 mt-4">
          <li><strong>Email:</strong> privacy@fastingtracker.app</li>
          <li><strong>Support:</strong> support@fastingtracker.app</li>
          <li><strong>Response Time:</strong> We will respond to privacy inquiries within 30 days</li>
        </ul>
      </PrivacySection>
    </article>
  );
}
```

**Run Tests**: `npm test tests/components/organisms/PrivacyContent.test.js`

---

#### Step 1.3: PrivacyPageClient Component (Molecule)

**File**: `src/components/molecules/PrivacyPageClient.js`

**Test First** (`tests/components/molecules/PrivacyPageClient.test.js`):

```javascript
describe('PrivacyPageClient', () => {
  it('scrolls to hash on mount', () => {
    window.location.hash = '#information-we-collect';
    const mockScrollIntoView = jest.fn();
    document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    });
    
    render(<PrivacyPageClient><div id="information-we-collect">Test</div></PrivacyPageClient>);
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('handles missing hash gracefully', () => {
    window.location.hash = '';
    render(<PrivacyPageClient><div>Content</div></PrivacyPageClient>);
    // Should render without errors
  });
});
```

**Implementation Pattern** (adapt from TermsPageClient):

```javascript
'use client';
import { useEffect } from 'react';

export default function PrivacyPageClient({ children }) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return <>{children}</>;
}
```

**Run Tests**: `npm test tests/components/molecules/PrivacyPageClient.test.js`

---

#### Step 1.4: Privacy Page Route

**File**: `src/app/privacy/page.js`

**Test First** (`tests/pages/privacy.test.js`):

```javascript
import { render, screen } from '@testing-library/react';
import PrivacyPage, { metadata } from '@/app/privacy/page';

describe('Privacy Page', () => {
  it('has correct metadata', () => {
    expect(metadata.title).toContain('Privacy Policy');
    expect(metadata.description).toBeTruthy();
    expect(metadata.robots).toBe('index, follow');
  });

  it('renders page heading', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
  });
});
```

**Implementation**:

```javascript
import PrivacyPageClient from '@/components/molecules/PrivacyPageClient';
import PrivacyContent from '@/components/organisms/PrivacyContent';

export const metadata = {
  title: 'Privacy Policy | Fasting Tracker',
  description: 'Learn how Fasting Tracker collects, uses, and protects your personal data and health information. GDPR and CCPA compliant privacy policy.',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy | Fasting Tracker',
    description: 'Our commitment to protecting your privacy and health data.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Privacy Policy
      </h1>
      <PrivacyPageClient>
        <PrivacyContent />
      </PrivacyPageClient>
    </div>
  );
}
```

**Run Tests**: `npm test tests/pages/privacy.test.js`

**E2E Test** (`tests/e2e/privacy-page.spec.js`):

```javascript
test.describe('Privacy Policy Page', () => {
  test('loads and displays all sections', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    await expect(page.locator('#information-we-collect')).toBeVisible();
    await expect(page.locator('#contact-information')).toBeVisible();
  });
});
```

**Run E2E**: `npx playwright test tests/e2e/privacy-page.spec.js`

---

### Phase 2: Navigation Integration (Priority: P2)

#### Step 2.1: Update Footer

**Find Footer Component** (likely in `src/app/layout.js` or `src/components/organisms/Footer.js`)

**Test First** (integration test):

```javascript
describe('Footer Navigation', () => {
  it('includes privacy policy link', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
```

**Implementation**: Add Privacy Policy link next to Terms link

**Run Tests**: Verify footer integration test passes

---

#### Step 2.2: Update Registration Page

**File**: `src/components/organisms/RegisterForm.js` (or registration page)

**Test First**:

```javascript
describe('RegisterForm Privacy Link', () => {
  it('includes privacy policy link', () => {
    render(<RegisterForm />);
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });
});
```

**Implementation**: Add text with links near terms checkbox

**Run Tests**: Verify registration form test passes

---

#### Step 2.3: Update Sitemap

**File**: `src/app/sitemap.js`

**Add Entry**:

```javascript
{
  url: 'https://fastingtracker.app/privacy',
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.6,
}
```

**Test**: Build and verify sitemap includes /privacy

---

### Phase 3: E2E Testing (Priority: P3)

#### Test Suite 1: Authenticated Access

**File**: `tests/e2e/authenticated-privacy-access.spec.js`

```javascript
test.describe('Authenticated Privacy Access', () => {
  test('logged-in user can access privacy page', async ({ page }) => {
    await page.goto('/login');
    // Login flow...
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });

  test('footer link navigates to privacy page', async ({ page }) => {
    await page.goto('/entries'); // Any authenticated page
    await page.click('footer a:has-text("Privacy Policy")');
    await expect(page).toHaveURL(/\/privacy/);
  });
});
```

#### Test Suite 2: Section Anchors

**File**: `tests/e2e/privacy-section-anchors.spec.js`

```javascript
test.describe('Privacy Section Anchors', () => {
  test('clicking section updates URL with anchor', async ({ page }) => {
    await page.goto('/privacy');
    await page.click('#information-we-collect h2');
    await expect(page).toHaveURL(/\/privacy#information-we-collect/);
  });

  test('direct anchor link scrolls to section', async ({ page }) => {
    await page.goto('/privacy#cookies-and-tracking');
    const section = page.locator('#cookies-and-tracking');
    await expect(section).toBeInViewport();
  });
});
```

**Run All E2E Tests**: `npx playwright test tests/e2e/privacy-*.spec.js`

---

## Verification Checklist

### Functional Requirements

- [ ] FR-001: /privacy route accessible
- [ ] FR-002: Accessible to authenticated and unauthenticated users
- [ ] FR-003: 10 sections present (FR-003a through FR-003j)
- [ ] FR-004: Effective date displayed
- [ ] FR-005: Last updated date displayed
- [ ] FR-006: Linked from registration page
- [ ] FR-007: Linked from footer
- [ ] FR-008: Mobile-responsive
- [ ] FR-009: Clear hierarchical sections
- [ ] FR-010: SEO metadata present
- [ ] FR-011: Clean, professional layout
- [ ] FR-012: Section anchors functional
- [ ] FR-013: Data retention periods stated
- [ ] FR-014: Privacy rights exercise process explained
- [ ] FR-015: Google OAuth disclosure included

### Success Criteria

- [ ] SC-001: Readable in under 5 minutes
- [ ] SC-002: Loads in under 2 seconds
- [ ] SC-003: 16px minimum body text
- [ ] SC-004: 100% section anchor accessibility
- [ ] SC-005: Lighthouse SEO score 90+
- [ ] SC-006: WCAG 2.1 AA compliance
- [ ] SC-007: 95%+ anchor navigation success
- [ ] SC-008: Cross-browser compatibility (5 browsers)

### Testing Coverage

- [ ] Unit tests: PrivacySection, PrivacyContent, PrivacyPageClient
- [ ] Integration tests: Footer link, registration link, page access
- [ ] E2E tests: Page rendering, section anchors, authenticated access
- [ ] 80%+ code coverage (constitution requirement)

---

## Build and Deploy

**Production Build**:

```bash
npm run build
```

**Verify**:
- /privacy page generated as static HTML
- No build errors
- Sitemap includes /privacy
- File size reasonable (<5KB HTML)

**Local Testing**:

```bash
npm run dev
```

Navigate to http://localhost:3000/privacy and verify all functionality

---

## Common Issues & Solutions

**Issue**: Section click doesn't update URL  
**Solution**: Verify PrivacySection is a Client Component ('use client')

**Issue**: Scroll to anchor doesn't work  
**Solution**: Check PrivacyPageClient useEffect timing, may need setTimeout

**Issue**: Footer link not appearing  
**Solution**: Verify footer component location and re-import if needed

**Issue**: Tests fail with "scrollIntoView is not a function"  
**Solution**: Mock scrollIntoView in test setup: `Element.prototype.scrollIntoView = jest.fn()`

---

## Next Steps

After implementation:
1. Request legal review of privacy policy content
2. Update placeholder email addresses (privacy@fastingtracker.app)
3. Consider privacy preference center (future enhancement)
4. Monitor user feedback on privacy policy clarity
5. Review policy annually or when data practices change

---

## Time Estimates

- **Phase 1** (Core Components): 3-4 hours
- **Phase 2** (Navigation): 1-2 hours
- **Phase 3** (E2E Testing): 2-3 hours
- **Total**: 6-9 hours (based on Terms page implementation)

**Complexity**: Low (proven architecture, static content)  
**Risk**: Low (no database changes, reusing tested patterns)
