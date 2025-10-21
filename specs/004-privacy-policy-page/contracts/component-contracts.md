# Component Contracts: Privacy Policy Page

**Feature**: Privacy Policy Page  
**Branch**: 004-privacy-policy-page  
**Date**: October 21, 2025

## Overview

This document defines the interface contracts for all components in the Privacy Policy page feature. Since this is a frontend-only feature with no API endpoints, contracts focus on component props, behavior, and accessibility requirements.

---

## Component Contracts

### PrivacySection (Atom)

**File**: `src/components/atoms/PrivacySection.js`

**Purpose**: Render an individual privacy policy section with anchor link support and accessibility features

**Interface**:

```typescript
interface PrivacySectionProps {
  /** Unique section identifier for anchor links (kebab-case) */
  id: string;
  
  /** Section heading text */
  title: string;
  
  /** Section content (can include paragraphs, lists, nested elements) */
  children: React.ReactNode;
  
  /** Heading level for semantic HTML (default: 2) */
  level?: 2 | 3;
}
```

**Behavior Contract**:

1. **Rendering**:
   - MUST render a `<section>` element with `id={id}`
   - MUST render heading with proper level (`<h2>` or `<h3>`)
   - MUST render children within section body
   - MUST apply consistent spacing (mb-8 for sections)

2. **Interaction**:
   - Section heading MUST be clickable
   - Click MUST update URL with section hash (e.g., `/privacy#information-we-collect`)
   - Click MUST NOT cause page reload
   - MUST support keyboard navigation (Enter/Space to activate)

3. **Accessibility**:
   - MUST use semantic HTML (`<section>`, `<h2>`/`<h3>`)
   - MUST have visible focus indicators
   - Heading MUST have `tabIndex={0}` for keyboard navigation
   - MUST have hover styles for visual feedback

4. **Styling**:
   - Text color: `text-gray-900` (headings), `text-gray-700` (body)
   - Hover: `hover:text-blue-600` (clickable headings)
   - Border: `border-b border-gray-200` (section separators)
   - Cursor: `cursor-pointer` on headings

**Example Usage**:

```jsx
<PrivacySection id="information-we-collect" title="1. Information We Collect">
  <p>We collect the following types of information:</p>
  <ul>
    <li>Personal data (name, email)</li>
    <li>Health data (fasting logs)</li>
    <li>Usage data (app interactions)</li>
  </ul>
</PrivacySection>
```

**Test Requirements**:
- Unit test: Renders with correct id attribute
- Unit test: Heading text matches title prop
- Unit test: Children content is rendered
- Unit test: Click updates URL (mock window.history)
- Unit test: Keyboard navigation works (Enter/Space)
- Unit test: Accessibility attributes present

---

### PrivacyPageClient (Molecule)

**File**: `src/components/molecules/PrivacyPageClient.js`

**Purpose**: Client component providing scroll-to-anchor behavior and URL management

**Interface**:

```typescript
interface PrivacyPageClientProps {
  /** Child components (typically PrivacyContent) */
  children: React.ReactNode;
}
```

**Behavior Contract**:

1. **Mount Behavior**:
   - MUST check URL for hash on mount (e.g., `/privacy#cookies-and-tracking`)
   - If hash present, MUST scroll to corresponding section
   - Scroll MUST be smooth (behavior: 'smooth')
   - MUST handle invalid hashes gracefully (no error, no scroll)

2. **Navigation Handling**:
   - MUST listen for section click events (bubbled from PrivacySection)
   - MUST update URL with pushState (no page reload)
   - MUST scroll to target section smoothly
   - MUST maintain browser history (back button works)

3. **Highlighting** (Optional Enhancement):
   - MAY highlight currently active section during scroll
   - If implemented, MUST update on scroll events (throttled)
   - MUST clear highlight when scrolling away

4. **Accessibility**:
   - MUST preserve keyboard navigation (no JS interference)
   - MUST announce section changes to screen readers (aria-live)
   - MUST maintain focus on section heading after navigation

**Example Usage**:

```jsx
<PrivacyPageClient>
  <PrivacyContent />
</PrivacyPageClient>
```

**Test Requirements**:
- Unit test: Scrolls to hash on mount (mock scrollIntoView)
- Unit test: Handles missing hash gracefully
- Unit test: Updates URL on section click (mock pushState)
- Integration test: Back button navigation works
- E2E test: Real scroll behavior in browser

---

### PrivacyContent (Organism)

**File**: `src/components/organisms/PrivacyContent.js`

**Purpose**: Full privacy policy content with all 10 required sections

**Interface**:

```typescript
interface PrivacyContentProps {
  // No props - static content
}
```

**Behavior Contract**:

1. **Content Requirements**:
   - MUST render exactly 10 sections (FR-003)
   - Sections MUST appear in this order:
     1. Information We Collect
     2. How We Use Your Information
     3. Data Storage and Security
     4. Data Sharing and Disclosure
     5. Your Privacy Rights
     6. Cookies and Tracking
     7. Health Information
     8. Children's Privacy
     9. International Users
     10. Contact Information

2. **Metadata Display**:
   - MUST display effective date (FR-004)
   - MUST display last updated date (FR-005)
   - Dates MUST be human-readable format (e.g., "October 21, 2025")

3. **Section IDs**:
   - Each section MUST have unique, kebab-case ID
   - IDs MUST match specification (see data-model.md)

4. **Content Structure**:
   - MUST use PrivacySection for each section
   - MUST use semantic HTML (paragraphs, lists, headings)
   - MUST include required subsections per FR-003a through FR-003j

**Example Structure**:

```jsx
export default function PrivacyContent() {
  return (
    <article>
      <div className="mb-8 text-sm text-gray-600">
        <p>Effective Date: October 21, 2025</p>
        <p>Last Updated: October 21, 2025</p>
      </div>
      
      <PrivacySection id="information-we-collect" title="1. Information We Collect">
        {/* Content */}
      </PrivacySection>
      
      {/* ... 9 more sections ... */}
    </article>
  );
}
```

**Test Requirements**:
- Unit test: Renders 10 sections
- Unit test: All section IDs present and unique
- Unit test: Effective date displayed
- Unit test: Last updated date displayed
- Unit test: Each required subsection present (FR-003a through FR-003j)
- Integration test: All sections scrollable via anchors

---

### PrivacyPage (Route Component)

**File**: `src/app/privacy/page.js`

**Purpose**: Next.js page component for /privacy route

**Interface**:

```typescript
// Server Component - no props from router
export const metadata = {
  title: string;
  description: string;
  robots: string;
  openGraph: object;
};

export default function PrivacyPage() {
  return JSX.Element;
}
```

**Behavior Contract**:

1. **SEO Metadata** (FR-010):
   - MUST export metadata object with title, description, robots
   - Title MUST include "Privacy Policy" and site name
   - Description MUST summarize privacy practices
   - Robots MUST be "index, follow"

2. **Rendering**:
   - MUST be a Server Component (default Next.js behavior)
   - MUST render page heading ("Privacy Policy")
   - MUST wrap PrivacyContent in PrivacyPageClient
   - MUST apply responsive container styles

3. **Accessibility**:
   - MUST have single `<h1>` for page title
   - MUST use semantic HTML structure
   - MUST be keyboard navigable

**Example**:

```jsx
export const metadata = {
  title: 'Privacy Policy | Fasting Tracker',
  description: 'Learn how Fasting Tracker collects, uses, and protects your personal data and health information.',
  robots: 'index, follow',
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

**Test Requirements**:
- Unit test: Metadata exports correctly
- Unit test: Renders h1 with "Privacy Policy"
- E2E test: Page loads at /privacy route
- E2E test: SEO metadata present in HTML head

---

## Navigation Integration Contracts

### Footer Component Update

**File**: TBD (likely `src/app/layout.js` or `src/components/organisms/Footer.js`)

**Contract**:

1. **Privacy Policy Link**:
   - MUST add link: `<Link href="/privacy">Privacy Policy</Link>`
   - MUST appear next to "Terms and Conditions" link
   - MUST use consistent styling with other footer links
   - MUST be keyboard accessible

2. **Grouping**:
   - Privacy and Terms links SHOULD be grouped in "Legal" navigation section
   - MAY use `<nav aria-label="Legal">` for semantic structure

**Example**:

```jsx
<footer>
  <nav aria-label="Legal">
    <Link href="/terms">Terms and Conditions</Link>
    <Link href="/privacy">Privacy Policy</Link>
  </nav>
</footer>
```

**Test Requirements**:
- Integration test: Privacy link present in footer
- Integration test: Link points to /privacy
- E2E test: Clicking footer link navigates to privacy page

---

### Registration Page Update

**File**: `src/components/organisms/RegisterForm.js` or register page

**Contract**:

1. **Privacy Policy Link**:
   - MUST add link near terms acceptance checkbox
   - Text: "By signing up, you agree to our [Terms and Conditions] and [Privacy Policy]"
   - Links MUST open in new tab (`target="_blank"`)
   - MUST include `rel="noopener noreferrer"` for security

2. **No Acceptance Checkbox**:
   - Privacy policy is informational (no checkbox required)
   - Terms acceptance checkbox covers legal agreement

**Example**:

```jsx
<p className="text-sm text-gray-600">
  By signing up, you agree to our{' '}
  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600">
    Terms and Conditions
  </a>{' '}
  and{' '}
  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
    Privacy Policy
  </a>.
</p>
```

**Test Requirements**:
- Integration test: Privacy link present on registration page
- Unit test: Link has correct target and rel attributes
- E2E test: Clicking link opens privacy page in new tab

---

## Sitemap Integration Contract

**File**: `src/app/sitemap.js`

**Contract**:

1. **Privacy Route Entry**:
   - MUST add /privacy route to sitemap
   - URL: `https://fastingtracker.app/privacy`
   - Change frequency: `monthly`
   - Priority: `0.6` (medium priority, similar to Terms)
   - Last modified: Build date

**Example**:

```javascript
{
  url: 'https://fastingtracker.app/privacy',
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.6,
}
```

**Test Requirements**:
- Build test: Sitemap includes /privacy
- Build test: Privacy entry has correct structure

---

## No API Contracts

**Rationale**: Privacy Policy page is a static content feature with no backend API requirements.

**No Endpoints**:
- No data fetching endpoints
- No user data modification
- No privacy preference storage (future enhancement)

**Future API Contracts** (out of scope for this feature):
- `POST /api/privacy/request-data` - User data export request
- `POST /api/privacy/delete-account` - Account deletion request
- `GET /api/privacy/version` - Privacy policy version history

---

## Accessibility Contracts (WCAG 2.1 AA)

**All Components MUST**:

1. **Keyboard Navigation**:
   - All interactive elements reachable via Tab
   - Enter/Space activates links and buttons
   - Focus indicators visible (2px outline)

2. **Screen Reader Support**:
   - Semantic HTML (section, article, nav)
   - Proper heading hierarchy (h1 > h2 > h3)
   - ARIA labels where needed (navigation landmarks)
   - No images requiring alt text (text-only content)

3. **Color Contrast**:
   - Body text: 4.5:1 minimum (text-gray-700 on white)
   - Headings: 4.5:1 minimum (text-gray-900 on white)
   - Links: 4.5:1 minimum (text-blue-600 on white)

4. **Text Sizing**:
   - Minimum 16px body text (FR-008, SC-003)
   - Headings: 24px (h2), 20px (h3)
   - Responsive scaling on mobile

**Test Requirements**:
- Automated: axe-core accessibility testing
- Manual: Keyboard navigation testing
- E2E: Screen reader compatibility (NVDA/JAWS)

---

## Performance Contracts

**All Components MUST**:

1. **Static Generation**:
   - PrivacyPage MUST be statically generated at build time
   - No client-side data fetching
   - HTML fully rendered in response

2. **JavaScript Minimal**:
   - Only PrivacyPageClient uses client-side JS
   - Client bundle < 10KB (gzipped)
   - No external script dependencies

3. **Loading Performance** (SC-002):
   - First Contentful Paint (FCP) < 1.0s
   - Largest Contentful Paint (LCP) < 2.0s
   - Total Blocking Time (TBT) < 100ms
   - Page load < 2 seconds on broadband

**Test Requirements**:
- Lighthouse performance score > 90
- Real-world loading time testing
- Bundle size analysis

---

## Summary

**Component Contracts**: 4 (PrivacySection, PrivacyPageClient, PrivacyContent, PrivacyPage)  
**Integration Contracts**: 3 (Footer, Registration, Sitemap)  
**API Contracts**: 0 (static content feature)  
**Accessibility**: WCAG 2.1 AA compliance required  
**Performance**: Sub-2-second load time required  

All contracts are testable and measurable per TDD requirements.
