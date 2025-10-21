# Data Model: Privacy Policy Page

**Feature**: Privacy Policy Page  
**Branch**: 004-privacy-policy-page  
**Date**: October 21, 2025

## Overview

The Privacy Policy page is a **static content feature** with no database entities or persistent data storage requirements. This document describes the content structure and component data models used for rendering the privacy policy.

## Entity Analysis

**Result**: No database entities required for this feature.

**Rationale**:
- Privacy policy is static content rendered server-side
- No user-specific data or personalization
- No data collection on the privacy page itself
- No privacy acceptance tracking (unlike Terms which requires termsAcceptedAt field)

---

## Content Structure Model

### PrivacyPolicyContent

**Type**: Static content structure (not a database entity)

**Purpose**: Defines the shape of privacy policy content for consistent rendering

**Structure**:

```javascript
{
  metadata: {
    effectiveDate: Date,      // When policy takes effect
    lastUpdated: Date,         // Last modification date
    version: String            // Version identifier (e.g., "1.0.0")
  },
  sections: [
    {
      id: String,              // Kebab-case identifier for anchors
      title: String,            // Display title (e.g., "Information We Collect")
      content: String,          // HTML or markdown content
      subsections: [           // Optional nested sections
        {
          id: String,
          title: String,
          content: String
        }
      ]
    }
  ]
}
```

**Validation Rules**:
- `sections` must contain exactly 10 items (per FR-003)
- Each section must have unique `id` for anchor navigation
- `effectiveDate` must be present (FR-004)
- Section IDs must be URL-safe (lowercase, hyphens only)

**Section IDs** (fixed, from FR-003a through FR-003j):
1. `information-we-collect`
2. `how-we-use-your-information`
3. `data-storage-and-security`
4. `data-sharing-and-disclosure`
5. `your-privacy-rights`
6. `cookies-and-tracking`
7. `health-information`
8. `childrens-privacy`
9. `international-users`
10. `contact-information`

---

## Component Data Models

### PrivacySection (Atom)

**Purpose**: Individual clickable section with anchor link support

**Props**:

```typescript
interface PrivacySectionProps {
  id: string;                  // Section anchor ID (e.g., "information-we-collect")
  title: string;                // Section heading
  children: React.ReactNode;    // Section content
  level?: 2 | 3;               // Heading level (default: 2)
}
```

**State**: None (stateless presentation component)

**Behavior**:
- Renders semantic HTML with proper heading hierarchy
- Applies `id` attribute for anchor navigation
- Clickable with onClick handler to update URL
- Keyboard accessible (Enter/Space to activate)
- Visual feedback on hover and focus

---

### PrivacyPageClient (Molecule)

**Purpose**: Client-side component handling scroll behavior and URL updates

**Props**: None (wraps children)

**State**:

```typescript
interface PrivacyPageClientState {
  highlightedSection: string | null;  // Currently highlighted section ID
}
```

**Effects**:
- `useEffect`: Scroll to anchor on mount if URL contains hash
- `useEffect`: Update URL when section is clicked (without page reload)
- `useEffect`: Monitor scroll position to highlight active section

**Behavior**:
- Detects URL hash on page load
- Scrolls to target section smoothly
- Updates browser history with pushState
- Maintains scroll position on back/forward navigation

---

### PrivacyContent (Organism)

**Purpose**: Full privacy policy content container with all 10 sections

**Props**: None (static content)

**State**: None (stateless)

**Content Structure**:

```jsx
<article>
  <div className="mb-8 text-sm text-gray-600">
    <p>Effective Date: October 21, 2025</p>
    <p>Last Updated: October 21, 2025</p>
  </div>
  
  <PrivacySection id="information-we-collect" title="1. Information We Collect">
    {/* Content */}
  </PrivacySection>
  
  <PrivacySection id="how-we-use-your-information" title="2. How We Use Your Information">
    {/* Content */}
  </PrivacySection>
  
  {/* ... 8 more sections ... */}
  
  <PrivacySection id="contact-information" title="10. Contact Information">
    {/* Content */}
  </PrivacySection>
</article>
```

**Responsibilities**:
- Render all 10 policy sections in order
- Display metadata (effective date, last updated)
- Provide semantic HTML structure
- Pass section IDs and titles to PrivacySection components

---

## Page-Level Model

### PrivacyPage (Route)

**Path**: `/privacy`

**Type**: Next.js Server Component

**Metadata**:

```javascript
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
```

**Rendering**: Static generation at build time (no dynamic data)

**Props**: None (no URL parameters or query strings)

**Structure**:

```jsx
<div className="max-w-4xl mx-auto px-4 py-12">
  <h1 className="text-4xl font-bold text-gray-900 mb-8">
    Privacy Policy
  </h1>
  <PrivacyPageClient>
    <PrivacyContent />
  </PrivacyPageClient>
</div>
```

---

## Data Flow

### Read Operations

**Privacy Policy Display**:
1. User navigates to `/privacy`
2. Next.js serves statically generated HTML
3. PrivacyPageClient hydrates for client-side interactivity
4. Sections render with anchor IDs

**Section Navigation**:
1. User clicks section heading or follows anchor link
2. PrivacyPageClient updates URL with section hash
3. Browser scrolls to section smoothly
4. Section receives visual highlight (temporary)

**No Write Operations**: Privacy policy is read-only content

---

## State Management

**No Global State Required**:
- Privacy policy content is static (no Redux/Context needed)
- Section highlighting is local component state
- URL hash is managed by browser History API
- No user-specific data or personalization

**Local State Only**:
- PrivacyPageClient maintains `highlightedSection` state
- State resets on page navigation
- No state persistence required

---

## Validation Rules

### Content Validation (Build-Time)

1. **Section Count**: Must have exactly 10 sections
2. **Section IDs**: Must be unique and URL-safe
3. **Required Content**: Each section must have non-empty content
4. **Metadata**: effectiveDate must be valid date
5. **Contact Email**: Must be valid email format

**Validation Location**: Component tests (PrivacyContent.test.js)

**No Runtime Validation**: Content is static, validated at build time

---

## No Database Schema Changes

**Reason**: Privacy policy is informational content only

**Future Considerations** (out of scope):
- If policy acceptance tracking is added (similar to Terms), would require:
  - `User.privacyPolicyAcceptedAt: Date` field
  - Privacy policy version tracking
  - User consent audit log

**Current Implementation**: No database changes required

---

## Integration Points

### Sitemap Integration

**Update Required**: `src/app/sitemap.js`

```javascript
export default function sitemap() {
  return [
    // ... existing routes
    {
      url: 'https://fastingtracker.app/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
```

### Footer Component Integration

**Update Required**: Footer component (location TBD, likely in layout)

**Change**: Add Privacy Policy link next to Terms link

**No Data Model Impact**: Simple navigation link addition

---

## Summary

**Database Changes**: None  
**New Entities**: None  
**Content Structure**: Static 10-section privacy policy  
**State Management**: Local component state only (section highlighting)  
**Validation**: Build-time content validation in tests  

This feature is a pure presentation layer implementation with no backend data requirements.
