# Data Model: Terms and Conditions Page

**Feature**: Terms and Conditions Page  
**Date**: October 21, 2025  
**Status**: Complete

## Overview

Data model changes required to support terms and conditions acceptance tracking. This feature extends the existing User model with a timestamp field to record when users accept terms during registration.

---

## Entity: User (Extended)

**Description**: Extends existing User model to include terms acceptance tracking for legal compliance and audit trail.

### Schema Extension

```javascript
// Addition to existing src/lib/models/User.js

{
  // ... existing User fields (email, password, name, etc.)
  
  /**
   * Terms acceptance timestamp
   * - Records when user accepted Terms and Conditions
   * - Set at registration completion (when account created)
   * - Immutable after set (users cannot un-accept terms)
   * - Used for legal compliance and audit trail
   */
  termsAcceptedAt: {
    type: Date,
    required: function() {
      // Required for new users, optional for existing users (migration compatibility)
      return this.isNew;
    },
    default: Date.now,
    immutable: true,
  },
  
  // ... rest of existing schema
}
```

### Field Specifications

| Field | Type | Required | Default | Validation | Notes |
|-------|------|----------|---------|------------|-------|
| `termsAcceptedAt` | Date | Yes (new users) | `Date.now` | Must be valid Date, cannot be future date | Immutable after creation |

### Relationships

**No new relationships** - This is a scalar field addition to existing User entity.

### Indexes

**No new indexes required** - Timestamp field rarely queried; no performance impact expected.

### Migration Considerations

**Existing Users**:
- Users registered before this feature have `termsAcceptedAt = null` or `undefined`
- Treat as implicitly accepted at `createdAt` timestamp
- Optional migration script could backfill with `createdAt` value
- No forced re-acceptance required (out of scope for v1)

**New Users**:
- Field mandatory at registration
- Set automatically to current timestamp when registration completes
- Validation prevents registration without explicit checkbox acceptance

---

## Entity: TermsContent (Static)

**Description**: Represents the terms and conditions content structure. This is NOT a database entity but a static content model defined in React components.

### Content Structure

```javascript
// Logical structure (not stored in database)

TermsContent = {
  effectiveDate: "2025-10-21",  // Hard-coded in component
  lastUpdated: "2025-10-21",    // Hard-coded in component
  
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      order: 1,
      content: "Welcome to Fasting Tracker..."
    },
    {
      id: "account-terms",
      title: "Account Terms",
      order: 2,
      content: "You must create an account..."
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      order: 3,
      content: "You are responsible for..."
    },
    {
      id: "health-disclaimer",
      title: "Health Disclaimer",
      order: 4,
      content: "This app is not medical advice...",
      highlight: true  // Special emphasis for legal importance
    },
    {
      id: "privacy-notice",
      title: "Privacy Notice",
      order: 5,
      content: "Your privacy is important..."
    },
    {
      id: "service-usage",
      title: "Service Usage",
      order: 6,
      content: "You agree to use this service..."
    },
    {
      id: "termination",
      title: "Termination",
      order: 7,
      content: "We reserve the right to terminate..."
    },
    {
      id: "liability-limitations",
      title: "Liability Limitations",
      order: 8,
      content: "To the maximum extent permitted by law..."
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      order: 9,
      content: "Any disputes shall be resolved..."
    },
    {
      id: "contact-information",
      title: "Contact Information",
      order: 10,
      content: "If you have questions, contact us at...",
      contactEmail: "support@example.com"  // To be replaced with actual email
    }
  ]
}
```

### Content Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `effectiveDate` | String (ISO date) | Yes | Date these terms became effective |
| `lastUpdated` | String (ISO date) | Yes | Date of last modification |
| `sections` | Array<Section> | Yes | Ordered array of content sections |
| `sections[].id` | String | Yes | URL anchor ID (kebab-case) |
| `sections[].title` | String | Yes | Section heading (display text) |
| `sections[].order` | Number | Yes | Display order (1-based) |
| `sections[].content` | String | Yes | Section body text (supports HTML/Markdown) |
| `sections[].highlight` | Boolean | No | Special visual treatment flag |
| `sections[].contactEmail` | String | No | Email address for contact section |

### Content Management

**Version 1 Approach**:
- Content hard-coded in `TermsContent.js` organism component
- Updates require code deployment
- Effective date manually updated on content changes
- No database storage (static content only)

**Future Enhancement** (out of scope):
- Database-stored content for version history
- CMS interface for legal team updates
- Version comparison UI
- Automatic user notification on updates

---

## State Transitions

### User Registration with Terms Acceptance

```
[Unregistered User]
         |
         | Navigate to /register
         v
[Registration Form Displayed]
         |
         | Fill email, password
         v
[Terms Checkbox Unchecked] <── Default state (FR-010c)
         |
         | User checks "I accept Terms" checkbox
         v
[Terms Checkbox Checked]
         |
         | Click "Create Account" button
         v
[Server-side Validation]
         |
         ├─ Checkbox NOT checked ─> [Error: Must accept terms]
         |                                   |
         |                                   └─ Return to form
         |
         └─ Checkbox checked
                  |
                  v
         [User Created with termsAcceptedAt = NOW]
                  |
                  v
         [Redirect to /entries (authenticated)]
```

### Terms Page Navigation

```
[Any Page (authenticated or not)]
         |
         | Click "Terms" link in footer
         v
[Terms Page /terms]
         |
         ├─ Click section heading
         |         |
         |         v
         |  [Scroll to section anchor]
         |         |
         |         v
         |  [URL updates with #section-id]
         |
         └─ Use browser back button
                   |
                   v
         [Return to previous page]
```

---

## Validation Rules

### User Model Validation

**termsAcceptedAt Field**:
- ✅ MUST be a valid JavaScript Date object
- ✅ MUST NOT be in the future (cannot accept terms before they exist)
- ✅ MUST be set for new user accounts (required on creation)
- ✅ MUST be immutable (cannot be changed after creation)
- ❌ CANNOT be null/undefined for users created after feature deployment

**Validation Implementation**:
```javascript
// In User model schema
termsAcceptedAt: {
  type: Date,
  required: function() { return this.isNew; },
  default: Date.now,
  immutable: true,
  validate: {
    validator: function(value) {
      // Prevent future dates
      return value <= new Date();
    },
    message: 'Terms acceptance date cannot be in the future'
  }
}
```

### Registration Form Validation

**Terms Checkbox**:
- ✅ MUST be explicitly checked (not pre-checked)
- ✅ MUST be validated client-side (immediate feedback)
- ✅ MUST be validated server-side (security/accessibility)
- ❌ CANNOT submit form with unchecked box

**Validation Error Messages**:
- Client-side: "You must accept the Terms and Conditions to create an account"
- Server-side: "Terms acceptance is required" (HTTP 400 Bad Request)

---

## Data Access Patterns

### Write Operations

**1. Create User with Terms Acceptance**
```javascript
// During registration API call
const user = await User.create({
  email: 'user@example.com',
  password: hashedPassword,
  name: 'John Doe',
  termsAcceptedAt: new Date(), // Set at creation time
});
```

**Frequency**: Low (only during user registration)  
**Performance**: O(1) - single document insert

### Read Operations

**1. Check if User Accepted Terms**
```javascript
// During login or profile display
const user = await User.findById(userId).select('termsAcceptedAt');
const hasAccepted = user.termsAcceptedAt != null;
```

**Frequency**: Rare (future feature: display acceptance date in settings)  
**Performance**: O(1) - indexed document lookup by _id

**2. Audit Query (Admin only - future feature)**
```javascript
// Count users who accepted terms in date range
const count = await User.countDocuments({
  termsAcceptedAt: { 
    $gte: new Date('2025-10-01'),
    $lt: new Date('2025-11-01')
  }
});
```

**Frequency**: Very rare (manual admin queries only)  
**Performance**: O(n) - full collection scan (acceptable for rare admin queries)

---

## Data Integrity

### Constraints

1. **Immutability**: Once set, `termsAcceptedAt` cannot be changed
   - Enforced by Mongoose `immutable: true` option
   - Prevents accidental or malicious modification

2. **Temporal Consistency**: Acceptance date cannot be in future
   - Enforced by custom validator
   - Prevents logical inconsistencies

3. **Required for New Users**: All users created after feature deployment must have acceptance timestamp
   - Enforced by conditional `required` function
   - Allows backward compatibility with existing users

### Data Quality

**Completeness**:
- 100% of new users will have `termsAcceptedAt` populated
- Existing users may have null/undefined (acceptable - implicit acceptance)

**Accuracy**:
- Timestamp set automatically at registration (no manual input)
- Clock skew risk minimal (server-side timestamp)

**Consistency**:
- Single source of truth (User document)
- No denormalization or duplication

---

## Storage Considerations

### Database Impact

**Storage**: 
- 8 bytes per user (MongoDB Date type)
- For 100,000 users: ~0.8 MB additional storage
- **Impact**: Negligible

**Performance**:
- No new indexes required (field rarely queried)
- No impact on existing query performance
- **Impact**: None

**Backup**:
- Field included in standard User collection backups
- No special backup procedures needed
- **Impact**: None

---

## Summary

**Data Model Changes**:
1. ✅ User model extended with `termsAcceptedAt` field (1 new field)
2. ✅ Static TermsContent structure defined (no database storage)
3. ✅ Validation rules documented and testable
4. ✅ State transitions clearly defined
5. ✅ No performance or storage concerns

**Database Operations**:
- **Writes**: O(1) single field addition during user creation
- **Reads**: O(1) standard user lookup (existing pattern)
- **Storage**: <1 MB for 100k users (negligible)
- **Indexes**: None required

**Migration Path**:
- Backward compatible (existing users unaffected)
- No forced re-acceptance needed
- Optional backfill script available if needed

**Ready for Phase 2 (Contracts)**: All data structures defined and validated.
