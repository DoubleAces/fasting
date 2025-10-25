# Research: Remove Copy to Today Functionality

**Feature**: 012-remove-copy-today  
**Date**: October 25, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for safely removing the "Copy to Today" functionality while maintaining code quality, data integrity, and system stability.

---

## Research Area 1: Safe Feature Removal Patterns

### Decision: Phased Removal Approach

**Rationale**:
- Remove UI first to prevent new usage
- Remove backend logic second to eliminate orphaned code
- Soft-deprecate data model last to preserve audit trail

**Pattern to Follow**:
1. **Phase 1 - UI Removal**: Remove button, state management, event handlers
2. **Phase 2 - Backend Cleanup**: Remove API validation, business logic
3. **Phase 3 - Data Model Deprecation**: Mark field as deprecated, stop populating for new entries

**Alternatives Considered**:
- **Hard Delete Everything**: Rejected - would lose audit trail data
- **Feature Flag**: Rejected - overkill for complete removal, adds unnecessary complexity
- **Immediate Full Removal**: Rejected - higher risk, harder to rollback if issues discovered

**References**:
- Next.js component removal best practices (no special handling needed)
- MongoDB schema evolution patterns (soft deprecation)

---

## Research Area 2: Legacy Data Handling

### Decision: Preserve Existing templateSource Values

**Rationale**:
- Maintains audit trail for historical entries
- No performance impact (field is optional, not indexed)
- Follows MongoDB best practice of additive schema evolution
- Prevents data loss and maintains data integrity

**Implementation**:
- Keep templateSource field in Entry model schema
- Add JSDoc comment: `@deprecated No longer populated for new entries. Preserved for audit trail.`
- Do not add code to strip or migrate existing values
- Handle gracefully in queries (already works - optional field)

**Alternatives Considered**:
- **Data Migration to Remove Field**: Rejected - unnecessary, breaks audit trail
- **Move to Archive Collection**: Rejected - overcomplicated, adds new collection
- **Mark in Separate Audit Table**: Rejected - denormalization without benefit

**References**:
- MongoDB schema evolution best practices (additive changes preferred)
- GDPR compliance for health data (maintain audit trails)

---

## Research Area 3: Test Strategy for Removal

### Decision: Negative Testing + Remove Existing Tests

**Rationale**:
- Negative tests verify feature is truly gone (button not rendered, API doesn't process)
- Removing old tests reduces maintenance burden
- Aligns with TDD: write tests that verify absence → remove feature → tests pass

**Test Approach**:
1. **Write Negative Tests First**:
   - Test: "Copy to Today button should NOT be present"
   - Test: "API should ignore templateSource in POST requests"
   - Test: "New entries should NOT have templateSource field"

2. **Verify Tests Fail** (feature still present)

3. **Remove Feature Implementation**

4. **Verify Tests Pass**

5. **Delete Old Positive Tests**:
   - Remove tests in `tests/unit/components/organisms/EntryActions.test.js` related to copy
   - Remove integration tests for copy functionality
   - Remove API tests for templateSource validation

**Alternatives Considered**:
- **Keep Old Tests**: Rejected - they would fail after removal, no value
- **No New Tests**: Rejected - how do we verify complete removal?
- **Only Manual Testing**: Rejected - violates TDD constitution requirement

**References**:
- Kent C. Dodds: "Testing Implementation Details" (test behavior not internals)
- TDD for removal work (negative assertions)

---

## Research Area 4: Component Refactoring

### Decision: Simplify EntryActions Component State

**Rationale**:
- Remove `isCopying` state variable (no longer needed)
- Remove `handleCopyToToday` function (~50 lines)
- Simplify JSX (remove third button and associated logic)
- Maintain edit and delete functionality unchanged

**Refactoring Steps**:
1. Remove copy-related imports (if any)
2. Remove `isCopying` useState hook
3. Delete `handleCopyToToday` function
4. Remove copy button from JSX
5. Update component documentation (remove copy from description)
6. Simplify prop types if needed

**Potential Issues**:
- **EntryDetailsView props**: Check if it passes copy-related props → remove if so
- **Styling**: Verify button layout still looks good with 2 buttons instead of 3

**Alternatives Considered**:
- **Create New Component**: Rejected - over-engineering, existing component fine
- **Keep Function as Stub**: Rejected - dead code, violates YAGNI

**References**:
- React Hooks patterns (removing unused state)
- Component simplification best practices

---

## Research Area 5: API Validation Changes

### Decision: Remove templateSource from Joi Schema

**Rationale**:
- Field no longer used in business logic
- Removing validation prevents accidental usage
- Simpler schema = clearer intent

**Implementation**:
- Locate `entrySchema.js` validation file
- Remove `templateSource: Joi.string()...` line
- Update any related validation comments
- API will ignore templateSource if provided (standard Joi behavior with `stripUnknown`)

**Backward Compatibility**:
- Old API calls with templateSource won't break (field ignored, not rejected)
- Graceful degradation

**Alternatives Considered**:
- **Keep Validation, Ignore Value**: Rejected - confusing, implies field is still used
- **Explicitly Reject templateSource**: Rejected - breaks backward compatibility unnecessarily
- **Deprecation Warning**: Rejected - logging noise, field isn't client-facing API

**References**:
- Joi validation library documentation
- API versioning best practices (backward compatible changes)

---

## Research Area 6: Rollback Strategy

### Decision: Feature Flag Not Needed, Git Revert Sufficient

**Rationale**:
- Simple removal work, low risk
- Full removal in single deployment
- Git revert provides instant rollback if needed
- No database migrations to reverse

**Rollback Plan**:
```bash
# If issues discovered after deployment:
git revert <commit-hash>
git push origin master
# Vercel auto-deploys reverted code
```

**Alternatives Considered**:
- **Feature Flag**: Rejected - overkill for complete removal
- **Blue-Green Deployment**: Rejected - standard deployment sufficient
- **Gradual Rollout**: Rejected - feature is either present or not, no middle ground

**Risk Assessment**:
- **Risk Level**: LOW
- **Impact if Broken**: Users can't copy entries (they already can't if we remove it)
- **Blast Radius**: Entry details page only
- **Detection**: Immediate (button visible or not)
- **Recovery**: Instant (git revert)

---

## Research Area 7: Documentation Updates

### Decision: Update Component JSDoc and Feature Docs

**Rationale**:
- Keep documentation in sync with code
- Help future developers understand removal rationale

**Documentation Changes**:
1. **EntryActions.js**: Update JSDoc to remove "Copy to Today" from description
2. **Entry.js model**: Add deprecation comment to templateSource field
3. **Feature CHANGELOG**: Add removal note with rationale
4. **README.md**: Update feature list (if copy functionality was listed)

**Alternatives Considered**:
- **No Documentation**: Rejected - future developers wonder why code was removed
- **Extensive Migration Guide**: Rejected - no data migration, simple removal

---

## Summary of Research Findings

### Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Removal Pattern | Phased UI → Backend → Data Model | Safest approach, maintains audit trail |
| Legacy Data | Preserve templateSource values | Audit compliance, no downside |
| Testing | Negative tests + remove old tests | TDD compliant, verifies absence |
| Component | Simplify EntryActions state | Reduces complexity, cleaner code |
| Validation | Remove from Joi schema | Clearer intent, backward compatible |
| Rollback | Git revert (no feature flag) | Simple, low-risk removal |
| Documentation | Update JSDoc and deprecation notes | Helps future developers |

### No Clarifications Needed

All technical decisions have clear answers based on:
- Existing codebase patterns (Next.js App Router, Mongoose models)
- Constitution requirements (TDD, simplicity)
- Industry best practices (soft deprecation, audit trails)
- Risk assessment (low-risk removal)

### Ready for Phase 1

All research complete. Proceed to data-model.md and contracts/ generation.
