# Regression Tests - Bug Fixes Summary

This document tracks all regression tests added for bugs discovered during Entry Details page development.

## Test Files

### 1. Unit Tests - `tests/unit/components/organisms/EntryActions.test.js`
Added regression test suite with 6 bug scenarios.

### 2. Integration Tests - `tests/integration/api-entries-timezone.test.js`
Tests for timezone handling and date validation (NEW FILE).

### 3. Integration Tests - `tests/integration/api-entries-delete-checkonly.test.js`
Tests for DELETE checkOnly parameter behavior (NEW FILE).

---

## Bug Tracking

### BUG-001: Delete checkOnly Parameter
**Issue**: `checkOnly` parameter was sent in request body instead of URL query parameter, causing entry to be deleted during the "check" phase.

**Impact**: Entry was deleted when clicking Delete button, before user confirmed. Second confirmation attempt returned 404.

**Fix**: 
- Client: Changed to send `checkOnly=true` as URL parameter
- Server: No change needed (already expected query param)

**Tests Added**:
- ✅ Unit: Verifies checkOnly sent as URL param, not body
- ✅ Unit: Verifies entry NOT deleted during checkOnly call
- ✅ Integration: Verifies entry still exists after checkOnly=true
- ✅ Integration: Verifies extended fast info returned
- ✅ Integration: Verifies actual delete works after checkOnly

**Files Changed**:
- `src/components/organisms/EntryActions.js` - Line 48-52

---

### BUG-002: Error Message UX
**Issue**: Error messages showed pointless "Try Again" button that just dismissed the error without retrying.

**Impact**: Confusing UX - users expected retry to attempt the action again.

**Fix**: Removed "Try Again" button, kept only dismiss (✕) button.

**Tests Added**:
- ✅ Unit: Verifies no "Try Again" button for validation errors
- ✅ Unit: Verifies dismiss button present
- ✅ Unit: Verifies error displayed above buttons without breaking layout

**Files Changed**:
- `src/components/organisms/EntryActions.js` - Lines 175-191

---

### BUG-003: Copy to Today Validation
**Issue**: Sending `null` values for optional health metric fields caused validation errors.

**Impact**: Copy to Today feature failed with validation errors for all optional fields.

**Fix**: Omit optional fields entirely from request instead of sending explicit `null`.

**Tests Added**:
- ✅ Unit: Verifies optional fields omitted (not sent as null)
- ✅ Integration: Verifies entry created with only required fields
- ✅ Integration: Verifies null values rejected by validation

**Files Changed**:
- `src/components/organisms/EntryActions.js` - Lines 136-142

---

### BUG-004: Date Timezone Display
**Issue**: Dates stored at midnight UTC displayed as previous day in timezones behind UTC.

**Impact**: Entry for Oct 24th showed as Oct 23rd for users west of UTC.

**Fix**: Store dates at noon UTC (12:00) instead of midnight (00:00) to create timezone buffer.

**Tests Added**:
- ✅ Unit: Verifies date sent at noon UTC (T12:00:00.000Z)
- ✅ Integration: Verifies correct date display regardless of time component

**Files Changed**:
- `src/components/organisms/EntryActions.js` - Line 140

---

### BUG-005: Router.refresh After Delete
**Issue**: Calling `router.refresh()` after successful delete tried to refresh the deleted entry page, causing 404 error.

**Impact**: Entry was deleted successfully but error message appeared.

**Fix**: Removed `router.refresh()` call - `router.push()` alone is sufficient.

**Tests Added**:
- ✅ Unit: Verifies router.refresh NOT called after delete
- ✅ Unit: Verifies router.push called correctly

**Files Changed**:
- `src/components/organisms/EntryActions.js` - Line 93 (removed)
- `src/components/organisms/EntryActions.js` - Line 168 (removed)

---

### BUG-006: Date Filtering API Support
**Issue**: GET `/api/entries?date=YYYY-MM-DD` ignored the date parameter and returned all entries.

**Impact**: "Copy to Today" incorrectly thought today's entry existed when checking for duplicates.

**Fix**: Added date filtering support to GET endpoint.

**Tests Added**:
- ✅ Unit: Verifies date parameter included in API call
- ✅ Integration: Verifies filtering by specific date works
- ✅ Integration: Verifies returns all when no filter provided
- ✅ Integration: Verifies empty array for non-existent date

**Files Changed**:
- `src/app/api/entries/route.js` - Lines 33-48

---

### BUG-007: Date Validation Timezone Issues
**Issue**: Joi validation rejected dates for users in timezones ahead of UTC server time.

**Impact**: Users in GMT+3 (and beyond) couldn't create entries for their "today" after midnight local time.

**Fix**: 
1. Removed strict `.max('now')` check
2. Added custom validator allowing up to 1 day ahead of server UTC time
3. Compares only date portion, not exact timestamp

**Tests Added**:
- ✅ Integration: Accepts date at noon UTC for today
- ✅ Integration: Accepts date for users in UTC+12 (ahead of server)
- ✅ Integration: Rejects dates more than 1 day in future
- ✅ Integration: Compares only date part, not time component
- ✅ Integration: Displays correct date regardless of time

**Files Changed**:
- `src/lib/validation/entrySchema.js` - Lines 35-77

---

## Running the Tests

### Run all regression tests:
```bash
npm test -- tests/unit/components/organisms/EntryActions.test.js
npm test -- tests/integration/api-entries-timezone.test.js
npm test -- tests/integration/api-entries-delete-checkonly.test.js
```

### Run specific bug test:
```bash
# BUG-001: Delete checkOnly
npm test -- -t "checkOnly parameter"

# BUG-003: Copy validation
npm test -- -t "Optional fields validation"

# BUG-007: Timezone handling
npm test -- -t "Timezone Handling"
```

---

## Lessons Learned

1. **TDD would have caught these**: All bugs were discovered during manual testing, not caught by initial tests.

2. **Edge cases matter**: Timezone differences, validation of optional fields, API parameter formats - all edge cases that should be tested upfront.

3. **Integration tests are critical**: Unit tests alone wouldn't catch the timezone validation issues or API filtering problems.

4. **User perspective**: Testing from server perspective (UTC) isn't enough - must test from user perspective in different timezones.

5. **API contracts**: Clear documentation of parameter formats (query vs body) prevents bugs like BUG-001.

---

## Future Prevention

1. **Write tests for timezones first**: Any date/time feature should have tests for multiple timezones.

2. **Test parameter formats**: Document and test whether parameters go in URL, body, or headers.

3. **Test validation edge cases**: Test both omitted and null values for optional fields.

4. **Test the error states**: Not just happy path - test error messages, loading states, disabled states.

5. **Test navigation flows**: Verify router behavior after actions (no unnecessary refreshes, correct redirects).
