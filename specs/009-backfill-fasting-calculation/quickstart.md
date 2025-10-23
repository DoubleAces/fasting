# Quickstart Guide: Backfill Fasting Duration Calculation

**Feature**: 009-backfill-fasting-calculation  
**Branch**: `009-backfill-fasting-calculation`  
**Estimated Time**: 2-3 hours

## What This Feature Fixes

**Problem**: When you create an entry for a previous date, the fasting duration for future entries isn't recalculated.

**Example**:
1. You log today (Oct 18) → Fasting shows "N/A" (no previous day)
2. You log yesterday (Oct 17) → Entry saved
3. 🐛 **BUG**: Today still shows "N/A" instead of calculating 16 hours!

**Solution**: Automatically update the next entry's fasting duration when creating a past entry.

## Prerequisites

- ✅ Feature branch `009-backfill-fasting-calculation` checked out
- ✅ MongoDB Atlas connection working
- ✅ Local development environment running (`npm run dev`)
- ✅ Jest configured for testing (`npm test`)

## Development Workflow (TDD)

### Phase 1: Write Failing Tests (30 mins)

**File**: `tests/integration/entries.test.js`

**Add test cases** after existing POST /api/entries tests:

```javascript
describe('POST /api/entries - Backfill Cascade', () => {
  it('should recalculate next entry fasting when creating past entry', async () => {
    // 1. Create entry for Day 2 (no previous day)
    const day2Entry = await Entry.create({
      userId: testUser._id,
      date: new Date('2025-10-18'),
      firstMealTime: '12:00',
      lastMealTime: '20:00'
    });
    expect(day2Entry.fastingDuration).toBeNull();

    // 2. Create entry for Day 1 via API
    const request = createRequest('http://localhost:3000/api/entries');
    const response = await POST(request, {
      body: JSON.stringify({
        date: '2025-10-17',
        firstMealTime: '10:00',
        lastMealTime: '20:00'
      })
    });

    const { status } = await parseResponse(response);
    expect(status).toBe(201);

    // 3. Verify Day 2 fasting was recalculated
    const updatedDay2 = await Entry.findById(day2Entry._id);
    expect(updatedDay2.fastingDuration).toBe(960); // 16 hours (20:00 to 12:00)
  });

  it('should find next entry across gaps', async () => {
    // Create Day 1 and Day 5 (gap in between)
    await Entry.create({
      userId: testUser._id,
      date: new Date('2025-10-15'),
      firstMealTime: '12:00',
      lastMealTime: '20:00'
    });
    
    const day5Entry = await Entry.create({
      userId: testUser._id,
      date: new Date('2025-10-19'),
      firstMealTime: '12:00',
      lastMealTime: '20:00'
    });

    // Create Day 2 (in the gap)
    const request = createRequest('http://localhost:3000/api/entries');
    await POST(request, {
      body: JSON.stringify({
        date: '2025-10-16',
        firstMealTime: '10:00',
        lastMealTime: '18:00'
      })
    });

    // Verify Day 5 is still null (next immediate entry after Day 2 doesn't exist)
    // Actually Day 5 IS the next entry, so it should be calculated
    const updatedDay5 = await Entry.findById(day5Entry._id);
    expect(updatedDay5.fastingDuration).toBe(1080); // 18 hours (18:00 to 12:00)
  });

  it('should handle missing lastMealTime gracefully', async () => {
    // Create Day 2 with data
    const day2Entry = await Entry.create({
      userId: testUser._id,
      date: new Date('2025-10-18'),
      firstMealTime: '12:00',
      lastMealTime: '20:00'
    });

    // Create Day 1 WITHOUT lastMealTime (should skip in actual implementation)
    // Note: Our schema requires lastMealTime, so this test verifies error handling
    const request = createRequest('http://localhost:3000/api/entries');
    const response = await POST(request, {
      body: JSON.stringify({
        date: '2025-10-17',
        firstMealTime: '10:00'
        // lastMealTime missing - will fail validation
      })
    });

    const { status } = await parseResponse(response);
    expect(status).toBe(400); // Validation error
  });
});
```

**Run tests**:
```bash
npm test -- tests/integration/entries.test.js
```

**Expected**: Tests should FAIL (feature not implemented yet) ✅

### Phase 2: Implement Feature (1-1.5 hours)

**File**: `src/app/api/entries/route.js`

**Location**: After line 147 (`await entry.save();`)

**Add this code**:

```javascript
await entry.save();

// ====== NEW CODE STARTS HERE ======
// Try to update next entry's fasting duration (backfill cascade)
try {
  // Only proceed if current entry has lastMealTime
  if (value.lastMealTime) {
    // Find the immediate next entry for this user
    const nextEntry = await Entry.findOne({
      userId: session.user.id,
      date: { $gt: new Date(value.date) }
    })
    .sort({ date: 1 })  // Ascending (earliest first)
    .limit(1);

    // If next entry exists and has firstMealTime, recalculate its fasting
    if (nextEntry && nextEntry.firstMealTime) {
      const result = calculateFastingDuration(
        value.lastMealTime,        // Current entry's last meal
        nextEntry.firstMealTime,   // Next entry's first meal
        value.date,                // Current entry's date
        nextEntry.date             // Next entry's date
      );
      
      // Update next entry's fasting duration
      await Entry.findByIdAndUpdate(
        nextEntry._id,
        { fastingDuration: result.totalMinutes }
      );
    }
  }
} catch (calcError) {
  // Log error but don't fail entry creation
  console.warn('Could not update next day fasting duration:', calcError.message);
}
// ====== NEW CODE ENDS HERE ======

return createdResponse(entry);
```

**Run tests again**:
```bash
npm test -- tests/integration/entries.test.js
```

**Expected**: New tests should PASS ✅

### Phase 3: Verify All Tests Pass (15 mins)

**Run full integration test suite**:
```bash
npm test -- tests/integration/
```

**Expected**: All existing tests still pass (no regressions)

**Run unit tests**:
```bash
npm test -- tests/unit/
```

**Expected**: All unit tests pass (unchanged)

### Phase 4: Manual Testing (30 mins)

**Start dev server**:
```bash
npm run dev
```

**Test Scenario 1: Basic Backfill**

1. Open http://localhost:3000
2. Create entry for today (Oct 18):
   - First meal: 12:00 PM
   - Last meal: 8:00 PM
   - **Verify**: Fasting shows "N/A"
3. Create entry for yesterday (Oct 17):
   - First meal: 10:00 AM
   - Last meal: 8:00 PM
4. Refresh page or view entries list
5. **Verify**: Today's entry now shows "16h" fasting

**Test Scenario 2: Gap Handling**

1. Create entry for Oct 15
2. Create entry for Oct 19
3. Create entry for Oct 16 (fills gap)
4. **Verify**: Oct 19's fasting updated based on Oct 16's data

**Test Scenario 3: No Next Entry**

1. Create entry for today (latest date)
2. **Verify**: No errors, entry created successfully
3. **Verify**: Console shows no cascade warnings

## Code Changes Summary

### Files Modified

- ✅ `src/app/api/entries/route.js` - Added cascade logic to POST handler (17 lines)
- ✅ `tests/integration/entries.test.js` - Added 3 new test cases (~80 lines)

### Files Unchanged

- ❌ `src/lib/models/Entry.js` - No changes
- ❌ `src/lib/utils/fastingCalculator.js` - No changes
- ❌ Any frontend/UI files - No changes

## Common Issues & Solutions

### Issue 1: Test fails with "Cannot read property '_id' of null"

**Cause**: Database not cleaned between tests

**Solution**: Ensure `setupTestDatabase()` and `cleanTestDatabase()` are called in beforeEach/afterEach hooks

### Issue 2: Cascade update doesn't happen

**Cause**: Try-catch silently catching error

**Solution**: Check server console for `console.warn` messages showing the actual error

### Issue 3: Wrong fasting duration calculated

**Cause**: Date timezone mismatch

**Solution**: Ensure dates are created consistently (use `new Date('YYYY-MM-DD')` format)

## Verification Checklist

Before marking complete:

- [ ] All new integration tests pass
- [ ] All existing tests still pass (no regressions)
- [ ] Manual testing scenarios work
- [ ] No console errors in development
- [ ] Code follows existing patterns (matches PUT handler cascade)
- [ ] JSDoc comments added for new code block
- [ ] Git commit message follows convention

## Next Steps

After this feature is complete:

1. Create PR from `009-backfill-fasting-calculation` to `master`
2. Code review
3. Merge to master
4. Deploy to production
5. Monitor logs for any cascade errors

## Estimated Timeline

- Write tests: 30 minutes
- Implement feature: 1 hour
- Verify all tests: 15 minutes
- Manual testing: 30 minutes
- Documentation/cleanup: 15 minutes

**Total**: 2.5 hours

## Success Criteria

✅ All 3 new test cases pass  
✅ No existing tests broken  
✅ Manual testing scenarios verified  
✅ Code review approved  
✅ Zero production errors after deploy

## User Story 2 Status

**Note**: User Story 2 (Update Future Entries When Editing Past Entry) is **already implemented** in the existing codebase. The PUT handler in `src/app/api/entries/[id]/route.js` (lines 150-180) already has cascade logic that recalculates the next day's fasting duration when last meal time is edited.

**Existing Test Coverage**: See `tests/integration/entries.test.js` line 393 - "should recalculate next day fasting when last meal time changes"

**No additional implementation needed for User Story 2.**
