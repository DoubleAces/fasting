# Research: Privacy Policy Page

**Feature**: Privacy Policy Page  
**Branch**: 004-privacy-policy-page  
**Date**: October 21, 2025

## Overview

This document consolidates research findings for implementing the Privacy Policy page. Since this feature directly reuses the proven architecture from Spec 003 (Terms and Conditions page), research focuses on privacy policy content requirements and confirming architectural patterns.

## Component Architecture Decision

### Decision: Adapt Existing Terms Page Components

**Rationale**:
- Spec 003 (Terms and Conditions) successfully implemented a similar legal content page
- Proven component architecture: TermsSection (atom), TermsPageClient (molecule), TermsContent (organism)
- Identical functional requirements: section anchors, URL updates, scroll handling, SEO, accessibility
- Consistency in user experience across legal pages
- Reduced implementation risk by reusing tested patterns

**Implementation Approach**:
- Create PrivacySection component (adapted from TermsSection)
- Create PrivacyPageClient component (adapted from TermsPageClient)
- Create PrivacyContent component (adapted from TermsContent)
- Reuse exact same interaction patterns (clickable sections, anchor navigation, smooth scroll)
- Apply identical styling (Tailwind CSS classes from Terms page)

**Alternatives Considered**:
1. **Generic LegalSection component**: Would require refactoring Terms page, increasing scope
2. **Completely new architecture**: Higher risk, inconsistent UX, more testing required
3. **Chosen approach**: Adapt proven components with new content

---

## Privacy Policy Content Structure

### Decision: 10-Section Industry-Standard Structure

**Rationale**:
- GDPR Article 13 requires transparent information about data processing
- CCPA requires clear disclosure of data collection, sharing, and user rights
- Health apps (like fasting trackers) require specific disclosures about health information
- Industry best practices from major tech companies (Google, Apple, Microsoft privacy policies)

**Required Sections** (per FR-003a through FR-003j):

1. **Information We Collect**
   - Personal data: name, email, authentication tokens
   - Health data: fasting start/end times, duration, weight, notes
   - Usage data: app interactions, feature usage patterns

2. **How We Use Your Information**
   - Service provision (tracking fasting periods)
   - Communication (account notifications, support)
   - Analytics (feature usage, performance monitoring)
   - Security and fraud prevention

3. **Data Storage and Security**
   - MongoDB cloud storage with encryption at rest
   - TLS/SSL encryption in transit
   - Access controls and authentication
   - Regular security audits

4. **Data Sharing and Disclosure**
   - No sale of personal data
   - Third-party service providers (hosting, email)
   - Google OAuth provider (authentication only)
   - Legal requirements (subpoenas, court orders)

5. **Your Privacy Rights**
   - Right to access your data
   - Right to correction/update
   - Right to deletion (account closure)
   - Right to data export (download your data)
   - Right to object/restrict processing (opt-outs)

6. **Cookies and Tracking**
   - Essential cookies: authentication (authjs.session-token)
   - Session management cookies (authjs.csrf-token, authjs.callback-url)
   - No third-party advertising or tracking cookies
   - How to manage cookie preferences

7. **Health Information**
   - Fasting data is considered health information
   - Not shared with insurance or employers
   - Not used for medical advice or diagnosis
   - User-initiated data export available
   - Retention period: until account deletion

8. **Children's Privacy**
   - Service requires users to be 16+ years old (stricter than COPPA's 13+)
   - No knowing collection of data from minors
   - Parental verification not implemented
   - How to report underage accounts

9. **International Users**
   - Data stored in US-based servers (MongoDB Atlas)
   - GDPR compliance for EU users
   - CCPA compliance for California residents
   - Data transfer mechanisms (Standard Contractual Clauses)
   - User rights vary by jurisdiction

10. **Contact Information**
    - Privacy inquiries email: privacy@fastingtracker.app
    - Support email: support@fastingtracker.app
    - Response time: 30 days (GDPR requirement)
    - Physical address (if required by jurisdiction)

**Content Template Source**: Based on privacy policy templates from:
- GDPR guidelines (ICO, CNIL)
- CCPA compliance resources
- Health app privacy policy examples (MyFitnessPal, Lose It!)
- Legal content review required before production

---

## Section Anchor Strategy

### Decision: URL Fragment Identifiers with Smooth Scroll

**Rationale**:
- Proven pattern from Terms page (FR-012)
- Standard web navigation pattern
- SEO-friendly (searchable section links)
- Accessibility-compliant (keyboard navigation)
- Works without JavaScript (fallback to browser anchor behavior)

**Implementation**:
- Each section header gets unique ID: `information-we-collect`, `how-we-use-your-information`, etc.
- Section slugs use kebab-case for consistency
- PrivacyPageClient handles scroll behavior client-side
- Server Component renders anchors in HTML for SEO

**Pattern Reference**: Identical to TermsPageClient implementation from Spec 003

---

## Data Retention Periods (FR-013)

### Decision: Specify Retention by Data Type

**Rationale**:
- GDPR Article 5(1)(e) requires storage limitation principle
- CCPA requires disclosure of retention periods
- Users need clear expectations about data lifecycle

**Retention Policy**:
- **Account data** (email, name, profile): Until account deletion + 30 days (grace period)
- **Fasting logs** (tracking data): Until account deletion + 30 days (user can export before deletion)
- **Authentication tokens**: 30 days (session expiry)
- **Analytics data** (aggregated): 90 days (de-identified after aggregation)
- **Support tickets**: 2 years (legal requirement for customer service records)
- **Audit logs** (security): 1 year (compliance requirement)

**Grace Period Rationale**: 30-day window allows account recovery if deletion was accidental

---

## Privacy Rights Exercise Process (FR-014)

### Decision: Email-Based Request System (Phase 1)

**Rationale**:
- Simple implementation (no complex UI needed initially)
- GDPR allows manual processing for small-scale operations
- 30-day response time provides buffer for manual review
- Automated tools can be added later (out of scope for this feature)

**Process**:
1. User emails privacy@fastingtracker.app with request type:
   - "Access my data" → Export JSON file with all user data
   - "Delete my account" → Confirm identity, schedule deletion
   - "Correct my data" → Update specified fields
   - "Export my data" → Provide downloadable archive

2. Support team verifies identity (email match + security questions)

3. Fulfillment within 30 days (GDPR requirement)

**Future Enhancement** (out of scope): Self-service privacy dashboard in settings

---

## Google OAuth Disclosure (FR-015)

### Decision: Explicit Third-Party Authentication Section

**Rationale**:
- Google is a third-party data processor when OAuth is used
- GDPR requires disclosure of data processors
- Users need to understand what Google receives

**Disclosure Content**:
- What Google collects: email, name, profile picture (from OAuth profile)
- Google's privacy policy link: https://policies.google.com/privacy
- What Google doesn't get: Fasting data, app usage data (remains with us)
- Opt-out: Users can register with email/password instead of Google
- Data flow: Google → Our app (one-way, no sharing back)

**Location**: Under "Data Sharing and Disclosure" section + specific callout in "Information We Collect"

---

## SEO and Metadata Strategy

### Decision: Replicate Terms Page SEO Success

**Rationale**:
- Terms page achieved target SEO scores (SC-005: 90+ Lighthouse SEO)
- Privacy policy has similar indexing requirements
- Legal pages benefit from search visibility (users searching "site privacy policy")

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

**Sitemap**: Add `/privacy` route with monthly change frequency (matches Terms)

---

## Testing Strategy

### Decision: Mirror Terms Page Test Coverage

**Rationale**:
- Terms page achieved comprehensive test coverage (21 unit/integration + 145 E2E tests)
- Privacy page has identical functional requirements
- Test patterns can be adapted with new content assertions

**Test Levels**:

1. **Unit Tests** (Jest + React Testing Library):
   - PrivacySection.test.js: Section rendering, anchor IDs, accessibility
   - PrivacyContent.test.js: 10 sections present, effective date, content structure

2. **Integration Tests**:
   - privacy-page-access.test.js: Authenticated and unauthenticated access
   - Section anchor navigation integration

3. **E2E Tests** (Playwright):
   - privacy-page.spec.js: Full page load, all sections visible, navigation links
   - authenticated-privacy-access.spec.js: Footer link, back navigation
   - privacy-section-anchors.spec.js: Click section → URL updates, direct anchor access

**Coverage Goal**: Minimum 80% code coverage (constitution requirement)

**Test Data**: Privacy policy content will be static, simplifying test assertions

---

## Accessibility Considerations

### Decision: WCAG 2.1 AA Compliance (Same as Terms)

**Rationale**:
- Constitution mandates WCAG 2.1 AA minimum
- Terms page achieved 100% Lighthouse Accessibility score
- Legal content must be accessible to all users

**Accessibility Features**:
- Semantic HTML: `<article>`, `<section>`, `<h2>`, `<h3>` hierarchy
- Heading structure: Proper heading levels for screen readers
- Keyboard navigation: All sections clickable with Enter/Space
- Focus indicators: Visible focus states on interactive elements
- Text contrast: Minimum 4.5:1 ratio (light theme only, matching Terms)
- Text size: Minimum 16px body text (FR-008, SC-003)
- Alt text: N/A (no images in policy content)
- ARIA labels: Section headers with `id` attributes for anchor navigation

---

## Performance Optimization

### Decision: Static Generation + Content Splitting

**Rationale**:
- Privacy policy is static content (changes infrequently)
- Next.js static generation provides optimal performance
- SC-002: Page load <2 seconds easily achievable with static HTML

**Optimizations**:
- Next.js static generation at build time
- No client-side data fetching required
- Minimal JavaScript (only PrivacyPageClient for scroll behavior)
- Tailwind CSS utility classes (minimal CSS payload)
- No images or heavy assets

**Expected Performance**:
- First Contentful Paint (FCP): <1.0s
- Largest Contentful Paint (LCP): <1.5s
- Total Blocking Time (TBT): <100ms
- Cumulative Layout Shift (CLS): 0 (static layout)

---

## Footer Integration

### Decision: Update Existing Footer Component

**Rationale**:
- FR-007: Privacy policy must be linked from footer on all pages
- Footer already contains Terms link (completed in Spec 003)
- Group legal links together for user discoverability

**Implementation**:
- Locate existing footer component (likely in src/components/organisms/ or src/app/layout.js)
- Add Privacy Policy link next to Terms and Conditions link
- Maintain consistent link styling
- Order: Terms → Privacy → Other footer links

**Example Structure**:
```jsx
<footer>
  <nav aria-label="Legal">
    <Link href="/terms">Terms and Conditions</Link>
    <Link href="/privacy">Privacy Policy</Link>
  </nav>
  {/* Other footer content */}
</footer>
```

---

## Registration Page Integration

### Decision: Add Privacy Policy Link Next to Terms Link

**Rationale**:
- FR-006: Privacy policy must be linked from registration page
- Users should review both legal documents before signing up
- Registration page already has Terms and Conditions link (Spec 003)

**Implementation**:
- Locate RegisterForm component (src/components/organisms/RegisterForm.js)
- Add Privacy Policy link near Terms acceptance checkbox
- Pattern: "By signing up, you agree to our [Terms and Conditions] and [Privacy Policy]"
- Both links open in new tab (target="_blank" with rel="noopener noreferrer")

**No Acceptance Checkbox Required**:
- Privacy policy is informational (no explicit acceptance needed)
- Terms acceptance checkbox already covers legal agreement
- Privacy policy link provides transparency (GDPR requirement)

---

## Content Placeholder Strategy

### Decision: Generic Default Content with Legal Review Note

**Rationale**:
- Spec states "fill it with some default content"
- Privacy policies require legal review before production use
- Generic content allows feature completion without legal expertise
- Real privacy practices must be documented by legal team

**Placeholder Approach**:
- Use industry-standard privacy policy language
- Include all 10 required sections with comprehensive coverage
- Add prominent notice: "This privacy policy requires legal review and customization before production deployment"
- Reference real app practices where known (MongoDB storage, Google OAuth, etc.)
- Flag placeholder emails (privacy@fastingtracker.app) for update

**Legal Review Checklist** (out of scope, documented for future):
- Verify data collection practices match policy statements
- Confirm retention periods align with business practices
- Review jurisdiction-specific requirements
- Validate contact information
- Attorney sign-off before public deployment

---

## Summary of Key Decisions

| Decision Area | Chosen Approach | Rationale |
|---------------|----------------|-----------|
| **Component Architecture** | Adapt Terms page components | Proven pattern, reduces risk, maintains consistency |
| **Privacy Content** | 10-section industry-standard structure | GDPR/CCPA compliance, health app best practices |
| **Section Anchors** | URL fragments with smooth scroll | Proven pattern from Terms page |
| **Data Retention** | Specific periods by data type | GDPR storage limitation, user transparency |
| **Privacy Rights** | Email-based request system | Simple Phase 1 implementation, manual processing |
| **Google OAuth** | Explicit third-party disclosure | GDPR processor requirement, user transparency |
| **SEO Strategy** | Replicate Terms page metadata | Proven success, search visibility |
| **Testing** | Mirror Terms page test coverage | Comprehensive, proven test patterns |
| **Accessibility** | WCAG 2.1 AA compliance | Constitution requirement, inclusive design |
| **Performance** | Static generation, minimal JS | Sub-2-second load time, optimal UX |
| **Footer/Registration** | Add links next to Terms link | Consistent legal document grouping |
| **Content** | Generic with legal review note | Enables feature completion, requires pre-production review |

---

## No Further Research Required

All technical decisions are resolved. The feature architecture is proven (Spec 003), privacy policy content structure is industry-standard, and integration points are clearly defined. Ready to proceed to Phase 1 (data-model.md, contracts/, quickstart.md).
