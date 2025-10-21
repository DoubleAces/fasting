# Research: Terms and Conditions Page

**Feature**: Terms and Conditions Page  
**Date**: October 21, 2025  
**Status**: Complete

## Overview

Research findings for implementing a legally compliant Terms and Conditions page for a health/wellness fasting tracker application, including health disclaimers, user acceptance tracking, and SEO optimization.

---

## 1. Legal Content Structure for Health/Wellness Apps

### Decision
Use comprehensive terms structure with dedicated Health Disclaimer section covering fasting-specific risks.

### Rationale
- Health/wellness apps require explicit medical disclaimers to limit liability
- Fasting apps specifically need warnings for at-risk populations (pregnant, diabetic, medical conditions)
- Standard boilerplate terms insufficient for health-related applications
- Comprehensive structure supports future legal review and modifications

### Content Sections Required
1. **Introduction**: App purpose and terms acceptance
2. **Account Terms**: Registration requirements and account management
3. **User Responsibilities**: Proper use of tracking features
4. **Health Disclaimer**: Medical advice disclaimer + fasting risk warnings
5. **Privacy Notice**: Data collection and usage overview (links to full privacy policy)
6. **Service Usage**: Acceptable use policies
7. **Termination**: Account termination conditions
8. **Liability Limitations**: Limitation of liability and warranties
9. **Dispute Resolution**: Governing law and dispute process
10. **Contact Information**: Support email for questions

### Implementation Approach
- Static content in React component (no CMS initially)
- Modular section components for maintainability
- Effective date prominently displayed
- Legal review required before production

### Alternatives Considered
- **Minimal generic terms**: Rejected - insufficient for health app liability protection
- **External terms service**: Rejected - adds dependency, cost, and complexity for static content
- **Database-stored terms**: Deferred to future version with version history feature

---

## 2. User Consent Tracking Best Practices

### Decision
Store terms acceptance timestamp in User model at registration with explicit checkbox validation.

### Rationale
- **Legal compliance**: Timestamps provide audit trail for consent
- **Best practice**: Explicit opt-in (unchecked by default) meets GDPR/CCPA standards
- **Future-proof**: Enables version tracking if terms updated later
- **Minimal overhead**: Single field addition to existing User model

### Implementation Details
- **Database field**: `termsAcceptedAt` (Date type, required for new users)
- **Validation**: Server-side and client-side checkbox enforcement
- **Storage timing**: At registration completion, not at checkbox click
- **Migration**: Existing users without timestamp treated as accepted at registration date

### Alternatives Considered
- **No timestamp storage**: Rejected - insufficient for potential legal requirements
- **Separate acceptance log table**: Deferred - overly complex for initial version
- **Store terms version number**: Deferred - not needed without version history feature

---

## 3. URL Anchor Implementation for Section Linking

### Decision
Use URL fragment identifiers (#section-name) with smooth scroll behavior.

### Rationale
- **Standard web practice**: Familiar UX pattern for long documents
- **SEO benefit**: Allows direct linking to specific sections in documentation
- **Accessibility**: Keyboard navigation via Tab and Enter keys
- **No JavaScript required**: Works with native browser functionality

### Implementation Pattern
```javascript
// Section heading with ID
<h2 id="health-disclaimer">Health Disclaimer</h2>

// Smooth scroll CSS
html { scroll-behavior: smooth; }

// Table of contents link
<a href="#health-disclaimer">Health Disclaimer</a>
```

### Section Anchor Names
- `#introduction`
- `#account-terms`
- `#user-responsibilities`
- `#health-disclaimer`
- `#privacy-notice`
- `#service-usage`
- `#termination`
- `#liability-limitations`
- `#dispute-resolution`
- `#contact-information`

### Alternatives Considered
- **JavaScript scroll library**: Rejected - unnecessary complexity, CSS sufficient
- **Accordion sections**: Rejected - poor for SEO, hides content from screen readers
- **Separate page per section**: Rejected - poor UX, harder to search

---

## 4. Registration Form Integration

### Decision
Add terms checkbox to existing RegisterForm with client + server validation.

### Rationale
- **Minimal disruption**: Extends existing form rather than replacing it
- **Progressive enhancement**: Works without JavaScript for server-side validation
- **Consistent UX**: Matches existing form validation patterns
- **Accessibility**: Proper label association and error messaging

### Integration Points
1. **RegisterForm component**: Add TermsCheckbox molecule below password field
2. **Form validation**: Add terms acceptance to validation schema
3. **API route**: Verify checkbox checked before user creation
4. **User model**: Store termsAcceptedAt timestamp on successful registration
5. **Error handling**: Clear error message if terms not accepted

### Form Validation Rules
- Checkbox must be checked to enable submit button
- Server-side validation as fallback
- Error message: "You must accept the Terms and Conditions to create an account"
- Link text: "I have read and agree to the [Terms and Conditions](/terms)"

### Alternatives Considered
- **Modal popup for terms**: Rejected - poor UX, forces reading before decision
- **Implicit acceptance**: Rejected - not legally sufficient in many jurisdictions
- **Email confirmation link**: Rejected - adds friction to registration flow

---

## 5. SEO and Performance Optimization

### Decision
Server-Side Render (SSR) terms page with proper meta tags and semantic HTML.

### Rationale
- **SEO visibility**: Search engines can index terms for "legal" searches
- **Performance**: SSR provides instant page load, critical for legal compliance
- **Accessibility**: Semantic HTML ensures screen reader compatibility
- **Mobile optimization**: Responsive typography and spacing for readability

### SEO Implementation
```javascript
// Next.js metadata export
export const metadata = {
  title: 'Terms and Conditions | Fasting Tracker',
  description: 'Terms of service, user agreement, and health disclaimers for the Fasting Tracker application',
  keywords: ['terms', 'conditions', 'legal', 'user agreement', 'fasting app'],
  openGraph: {
    title: 'Terms and Conditions',
    description: 'Legal terms and health disclaimers',
    type: 'website',
  },
  robots: 'index, follow',
};
```

### Performance Targets
- **LCP**: <2 seconds (static content, minimal images)
- **FID**: <100ms (minimal interactivity, anchor links only)
- **CLS**: <0.1 (static layout, no dynamic content)
- **Lighthouse SEO**: >90 score

### Typography for Readability
- **Font size**: 16px base (mobile), 18px (desktop)
- **Line height**: 1.6 for body text
- **Max width**: 700px for optimal line length
- **Heading hierarchy**: Clear h1, h2, h3 structure

### Alternatives Considered
- **Client-side rendering**: Rejected - poor SEO, slower initial load
- **PDF download**: Deferred - future enhancement, not required for MVP
- **Print stylesheet**: Deferred - nice-to-have, not critical path

---

## 6. Accessibility Compliance

### Decision
Implement WCAG 2.1 AA compliance with semantic HTML and keyboard navigation.

### Rationale
- **Constitution requirement**: Accessibility 100 Lighthouse score mandated
- **Legal requirement**: Many jurisdictions require accessible public documents
- **User benefit**: Improves UX for all users, especially those with disabilities

### Accessibility Features
1. **Semantic HTML**: Proper heading hierarchy (h1 > h2 > h3)
2. **Keyboard navigation**: All anchor links focusable and operable
3. **Screen reader support**: Descriptive link text, ARIA labels where needed
4. **Color contrast**: WCAG AA compliant text/background ratios
5. **Focus indicators**: Visible outline on keyboard focus
6. **Skip links**: "Skip to content" for screen reader users

### Testing Requirements
- **Keyboard only navigation**: Tab through all links
- **Screen reader testing**: NVDA/JAWS on Windows, VoiceOver on Mac/iOS
- **Color contrast checker**: Verify all text meets 4.5:1 ratio minimum
- **Lighthouse accessibility audit**: 100 score required

### Alternatives Considered
- **AAA compliance**: Deferred - AA sufficient for MVP, AAA for future enhancement
- **Multiple language support**: Deferred - English only for initial release

---

## 7. Testing Strategy

### Decision
Comprehensive test coverage: unit, integration, and E2E following TDD principles.

### Rationale
- **Constitution requirement**: TDD mandatory with 80% coverage minimum
- **Legal risk mitigation**: Critical that terms acceptance flow works correctly
- **Regression prevention**: Tests ensure future changes don't break consent flow

### Test Layers

#### Unit Tests (Jest + React Testing Library)
- **TermsSection component**: Renders with correct ID, content, heading level
- **TermsCheckbox component**: Checked/unchecked state, onChange handler
- **TermsContent component**: All sections render, effective date displays

#### Integration Tests
- **Registration with terms**: Checkbox validation, timestamp storage, error handling
- **User model extension**: termsAcceptedAt field saves correctly
- **Form validation**: Server-side rejection if checkbox not checked

#### E2E Tests (Playwright)
- **Complete registration flow**: Navigate to register, check terms, submit, verify acceptance
- **Terms page navigation**: Click terms link from footer, scroll to sections, use anchors
- **Mobile responsiveness**: Test on mobile viewport, verify readability

### Coverage Targets
- **Unit tests**: 90% coverage for components
- **Integration tests**: 100% coverage for registration flow
- **E2E tests**: Critical paths (P1 user story minimum)

### Alternatives Considered
- **Manual testing only**: Rejected - violates TDD constitution requirement
- **Snapshot testing for content**: Rejected - brittle, poor for legal text changes
- **Visual regression testing**: Deferred - nice-to-have, not critical for legal compliance

---

## Summary

All technical decisions made with focus on:
1. **Legal compliance**: Comprehensive terms with health disclaimers, explicit consent tracking
2. **User experience**: Clear presentation, mobile-responsive, keyboard accessible
3. **Performance**: SSR for fast load, Lighthouse >90 target
4. **Maintainability**: Modular components, TDD approach, semantic structure
5. **Future-proofing**: Timestamp storage enables version tracking later

**No unresolved technical questions** - Ready to proceed to Phase 1 (Data Model & Contracts).
