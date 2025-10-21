# Feature Specification: Terms and Conditions Page

**Feature Branch**: `003-terms-conditions-page`  
**Created**: October 21, 2025  
**Status**: Draft  
**Input**: User description: "Create a terms and conditions page for this project... fill it with some default terms"

## Clarifications

### Session 2025-10-21

- Q: What specific health/medical disclaimers should the terms include given this is a health/wellness tracking app? → A: Standard health disclaimer plus specific warnings about fasting risks for certain populations (pregnant, diabetic, medical conditions)
- Q: Should the system record the timestamp when users accept terms (for potential legal/compliance requirements)? → A: Yes, store acceptance timestamp in user record during registration
- Q: Should the Terms link be grouped with other legal/policy links in the footer? → A: Link already in footer
- Q: Should the terms acceptance checkbox be pre-checked by default or require explicit user action? → A: Unchecked by default (user must explicitly check to proceed with registration)
- Q: What contact information should be included in the terms for users who have questions or concerns? → A: Email address only (support/legal contact email)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Terms Before Registration (Priority: P1)

New users can access and review the terms and conditions before creating an account, ensuring they understand their rights and obligations before committing to the service.

**Why this priority**: Legal compliance requirement - users must be able to review terms before accepting them during account creation. This is the core value of having a T&C page.

**Independent Test**: Navigate to /terms from registration page, verify complete terms are visible, scroll through all sections, return to registration.

**Acceptance Scenarios**:

1. **Given** a new user on the registration page, **When** they click "Terms and Conditions" link, **Then** they are taken to /terms page showing full terms
2. **Given** a user on the terms page, **When** they scroll through the content, **Then** all sections are readable and properly formatted
3. **Given** a user viewing terms, **When** they want to return to registration, **Then** they can navigate back easily

---

### User Story 2 - Access Terms While Logged In (Priority: P2)

Existing users can review the current terms and conditions at any time from their account settings or footer links, allowing them to stay informed about service policies.

**Why this priority**: Users should have ongoing access to terms even after registration, but this is less critical than pre-registration access.

**Independent Test**: Log in, navigate to /terms from footer or settings, verify terms are displayed.

**Acceptance Scenarios**:

1. **Given** a logged-in user on any page, **When** they click "Terms" in the footer, **Then** they are taken to the terms page
2. **Given** a logged-in user viewing terms, **When** they view the page, **Then** the terms content is identical to what new users see
3. **Given** a user on the terms page, **When** they use browser back button, **Then** they return to the previous page

---

### User Story 3 - Reference Specific Sections (Priority: P3)

Users can link to or reference specific sections of the terms and conditions, making it easier to discuss or cite particular policies.

**Why this priority**: Enhances usability but not essential for legal compliance or basic functionality.

**Independent Test**: Navigate to /terms, click on a section heading, verify URL updates with anchor, share URL with anchor and verify it scrolls to correct section.

**Acceptance Scenarios**:

1. **Given** a user viewing terms, **When** they click a section heading, **Then** the URL updates with the section anchor
2. **Given** a user with a terms URL containing an anchor, **When** they visit that URL, **Then** the page scrolls to the specific section
3. **Given** a user wanting to share a specific term, **When** they copy the URL with anchor, **Then** others can navigate directly to that section

---

### Edge Cases

- What happens when a user tries to register without viewing terms? (Terms acceptance is mandatory via checkbox; registration blocked if unchecked)
- What happens when a user tries to submit registration with unchecked terms box? (Form validation prevents submission; error message displayed)
- How does the system handle users who registered under previous terms versions? (Display effective date, future enhancement: version history)
- What happens if JavaScript is disabled? (Terms page still fully accessible as static content; form validation handled server-side)
- How are terms displayed on mobile devices? (Responsive design with proper text sizing and scrolling)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a publicly accessible terms and conditions page at /terms route
- **FR-002**: Page MUST be accessible to both authenticated and unauthenticated users
- **FR-003**: Terms MUST include 10 standard sections: Introduction, Account Terms, User Responsibilities, Health Disclaimer, Privacy Notice, Service Usage, Termination, Liability Limitations, Dispute Resolution, and Contact Information
- **FR-003a**: Terms MUST include a Health Disclaimer section stating the app is not medical advice and users should consult healthcare providers for medical decisions
- **FR-003b**: Health Disclaimer MUST include specific warnings that fasting may not be appropriate for pregnant individuals, people with diabetes, or those with certain medical conditions
- **FR-003c**: Contact Information section MUST include a support email address for users to reach out with questions or concerns about the terms (email: support@fastingtracker.app)
- **FR-004**: Page MUST display the effective date of the current terms
- **FR-005**: Terms page MUST be linked from the registration page with clear call-to-action
- **FR-006**: Terms page MUST be linked from the footer on all pages (existing footer link will be updated to point to /terms)
- **FR-007**: Page MUST be mobile-responsive with readable text on all screen sizes
- **FR-008**: Terms content MUST be presented in clear, hierarchical sections with proper headings
- **FR-009**: Page MUST include SEO metadata (title, description) for search engine indexing
- **FR-010**: Registration form MUST include a checkbox requiring users to acknowledge terms acceptance
- **FR-010a**: System MUST store the timestamp when user accepts terms in their user record
- **FR-010b**: Terms acceptance timestamp MUST be recorded at the moment of registration completion
- **FR-010c**: Terms acceptance checkbox MUST be unchecked by default, requiring explicit user action to proceed
- **FR-010d**: Registration form submission MUST be blocked if terms checkbox is not checked
- **FR-011**: Terms page MUST have a clean, professional layout consistent with site design
- **FR-012**: Section headings MUST be linkable with URL anchors for direct reference

### Key Entities

- **Terms Content**: Static legal text covering service usage, user rights, limitations of liability, dispute resolution, and contact information
- **Effective Date**: Timestamp indicating when the current version of terms became active
- **Section Anchors**: Named anchors for major sections (account-terms, user-responsibilities, privacy-notice, etc.)
- **Terms Acceptance Record**: User field storing timestamp when user accepted terms during registration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Terms page loads in under 2 seconds on standard broadband connection
- **SC-002**: 100% of users attempting registration must acknowledge terms before account creation
- **SC-003**: Terms page achieves Lighthouse SEO score above 90
- **SC-004**: Terms content is readable on screens from 320px (mobile) to 2560px (desktop) width
- **SC-005**: All section headings are keyboard-navigable for accessibility compliance
- **SC-006**: Terms page bounce rate is below 70% (indicating users find relevant information)

## Assumptions

- **Legal Review**: Default terms provided are standard boilerplate and will be reviewed by legal counsel before production deployment
- **Version Management**: Initial version will be static; version history and acceptance tracking may be added in future iterations
- **Language**: Terms will be provided in English only for the initial release
- **Content Updates**: Terms content will be updated via code deployment (not via CMS) for initial version
- **User Consent**: Checkbox acceptance on registration is sufficient for legal consent (to be confirmed by legal review); acceptance timestamp will be stored in user record
- **Retention**: Terms acceptance timestamp stored in user record for audit trail; registration timestamp no longer serves as proxy
- **Contact Email**: Support email address is support@fastingtracker.app (placeholder domain; update before production deployment)

## Out of Scope

- Version history showing previous terms iterations
- User notification system for terms updates
- Individual user consent audit trail in database
- Multi-language support for terms
- Terms acceptance re-prompting for existing users
- CMS or admin interface for editing terms
- PDF download of terms
- Comparison view between old and new terms versions

