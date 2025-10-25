# Quickstart: Remove Copy to Today Functionality

**Feature**: 012-remove-copy-today  
**Date**: October 25, 2025  
**For**: Developers implementing this feature removal

## Overview

This guide walks you through removing the "Copy to Today" functionality from the fasting tracker app. Follow these steps in order for a clean, safe removal.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Feature branch checked out: `012-remove-copy-today`
- Dependencies installed: `npm install`

---

## Implementation Steps

### Step 1: Write Negative Tests (TDD)

**Location**: `tests/unit/components/organisms/EntryActions.test.js`

Add tests that verify the copy functionality is NOT present:

```javascript
describe('EntryActions - Copy Feature Removed', () => {
  it('should NOT display Copy to Today button', () => {
    const { queryByText } = render(
      <EntryActions entry={mockEntry} isToday={false} />
    );
    
    // Verify button is not present
    expect(queryByText(/copy to today/i)).not.toBeInTheDocument();
  });
  
  it('should only show Edit and Delete buttons', () => {
    const { getAllByRole } = render(
      <EntryActions entry={mockEntry} isToday={false} />
    );
    
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(/edit/i);
    expect(buttons[1]).toHaveTextContent(/delete/i);
  });
});
```

**Location**: `tests/unit/api/entries/route.test.js`

Add test that verifies templateSource is ignored:

```javascript
it('should ignore templateSource field in POST requests', async () => {
  const newEntry = {
    date: '2025-10-26T12:00:00.000Z',
    firstMealTime: '13:00',
    lastMealTime: '21:00',
    templateSource: '507f1f77bcf86cd799439011' // Should be ignored
  };
  
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEntry)
  });
  
  const data = await response.json();
  expect(data.entry.templateSource).toBeUndefined();
});
```

**Run Tests** (they should FAIL):
```bash
npm test -- --testPathPattern="EntryActions|route.test"
```

---

### Step 2: Remove UI Components

**File**: `src/components/organisms/EntryActions.js`

1. **Remove state variable**:
```javascript
// DELETE THIS LINE:
const [isCopying, setIsCopying] = useState(false);
```

2. **Remove handleCopyToToday function** (lines ~102-165):
```javascript
// DELETE THIS ENTIRE FUNCTION:
const handleCopyToToday = async () => {
  // ... ~50 lines of copy logic ...
};
```

3. **Remove Copy button from JSX** (lines ~241-252):
```javascript
// DELETE THIS BLOCK:
{/* Copy to Today Button */}
<button
  onClick={handleCopyToToday}
  disabled={isToday || isCopying || !isValid}
  aria-label="Copy to today"
  ...
>
  {isCopying ? 'Copying...' : 'Copy to Today'}
</button>
```

4. **Update component documentation**:
```javascript
/**
 * Entry Actions Component
 * Provides Edit and Delete actions for entry details page
 * 
 * @param {object} entry - The entry object
 * @param {function} onSuccess - Callback for successful actions
 * @param {function} onError - Callback for error handling
 */
```

---

### Step 3: Remove Backend Validation

**File**: `src/lib/validation/entrySchema.js`

Remove templateSource validation (around line 226):

```javascript
// DELETE THIS:
templateSource: Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .optional()
  .messages({
    'string.pattern.base': 'templateSource must be a valid MongoDB ObjectId',
  }),
```

---

### Step 4: Update Data Model

**File**: `src/lib/models/Entry.js`

Update templateSource field documentation (around line 105):

```javascript
/**
 * @deprecated No longer populated for new entries (as of 012-remove-copy-today)
 * Historical field preserved for audit trail purposes only.
 * Used for audit trail when using "Copy to Today" feature (removed Oct 2025)
 */
templateSource: {
  type: Schema.Types.ObjectId,
  ref: 'Entry',
  required: false,
  index: false,
},
```

---

### Step 5: Clean Up Serialization

**File**: `src/app/entries/[id]/page.js`

Keep templateSource serialization for now (supports legacy data), but it won't be populated for new entries:

```javascript
// KEEP THIS (handles legacy data gracefully):
const serializedEntry = {
  ...entry,
  _id: entry._id.toString(),
  userId: entry.userId.toString(),
  templateSource: entry.templateSource ? entry.templateSource.toString() : null,
  // ... rest of fields
};
```

**Rationale**: Removing this would break display of legacy entries. Safe to keep.

---

### Step 6: Remove Old Tests

**File**: `tests/unit/components/organisms/EntryActions.test.js`

Delete all tests related to copy functionality:

```bash
# Search for and delete test blocks containing:
- "Copy to Today"
- "handleCopyToToday"
- "isCopying"
- "templateSource"
```

Examples of tests to DELETE:
- `it('should copy entry to today with meal times')`
- `it('should disable copy button when isToday is true')`
- `it('should check for existing entry before copying')`
- `it('should show error if today already has entry')`

---

### Step 7: Run Tests (Should Pass)

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern="EntryActions"
npm test -- --testPathPattern="entries.*route"

# Run with coverage
npm test -- --coverage
```

**Expected Results**:
- ✅ New negative tests PASS (copy button not present)
- ✅ Remaining edit/delete tests PASS (unchanged functionality)
- ✅ API tests PASS (templateSource ignored)
- ✅ No failing tests

---

### Step 8: Manual Testing

1. **Start dev server**:
```bash
npm run dev
```

2. **Navigate to entry details page**:
   - Go to http://localhost:3000/entries
   - Click any entry
   - **Verify**: Only "Edit" and "Delete" buttons visible
   - **Verify**: No "Copy to Today" button anywhere

3. **Test legacy data**:
   - View an old entry that might have templateSource
   - **Verify**: Displays normally, no errors
   - **Verify**: Edit and delete still work

4. **Create new entry**:
   - Create a new fasting entry through normal flow
   - Check MongoDB: `db.entries.findOne({}, {sort: {createdAt: -1}})`
   - **Verify**: `templateSource` field is null or undefined

---

### Step 9: Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Remove Copy to Today functionality

- Remove copy button from EntryActions component
- Remove handleCopyToToday function and isCopying state
- Remove templateSource validation from entrySchema
- Mark templateSource as deprecated in Entry model
- Add negative tests to verify removal
- Delete old copy-related tests
- Update component documentation

Closes #012-remove-copy-today"

# Push to branch
git push origin 012-remove-copy-today
```

---

## Verification Checklist

Before merging:

- [ ] Negative tests added and passing
- [ ] Copy button not visible in UI
- [ ] Only Edit and Delete buttons shown
- [ ] Old copy tests removed
- [ ] All remaining tests passing
- [ ] Component documentation updated
- [ ] Entry model templateSource marked deprecated
- [ ] Manual testing completed
- [ ] No console errors in browser
- [ ] New entries have null templateSource
- [ ] Legacy entries with templateSource still work

---

## Rollback Plan

If issues discovered after merge:

```bash
# Revert the commit
git revert <commit-hash>

# Push revert
git push origin master

# Vercel auto-deploys reverted version
```

---

## Troubleshooting

### Issue: Tests Still Failing

**Solution**: Make sure you deleted the old positive tests (tests expecting copy button to exist). Only keep negative tests.

### Issue: Entry Details Page Crashes

**Solution**: Check if EntryDetailsView is passing copy-related props that no longer exist. Remove those props.

### Issue: MongoDB Errors with Legacy Data

**Solution**: Verify templateSource serialization is still present in `src/app/entries/[id]/page.js` (Step 5). Don't remove it.

### Issue: Validation Errors

**Solution**: Check that templateSource was completely removed from entrySchema.js, not just commented out.

---

## Time Estimate

- **Step 1 (Tests)**: 15-20 minutes
- **Step 2-3 (UI/Validation)**: 10-15 minutes  
- **Step 4-5 (Data Model)**: 5-10 minutes
- **Step 6 (Remove Old Tests)**: 10-15 minutes
- **Step 7 (Run Tests)**: 5-10 minutes
- **Step 8 (Manual Testing)**: 15-20 minutes
- **Step 9 (Commit)**: 5 minutes

**Total**: ~1-2 hours for complete removal

---

## Next Steps

After this feature is merged:

1. Monitor production for any errors related to entry details
2. Verify users can still edit and delete entries normally
3. Consider timeline visualization fix as next priority (separate feature)
4. Consider performance optimization (separate feature)

---

## Resources

- [Feature Spec](spec.md)
- [Implementation Plan](plan.md)
- [Research Notes](research.md)
- [Data Model](data-model.md)
- [Constitution](.specify/memory/constitution.md)
