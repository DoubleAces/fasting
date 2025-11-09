# Quickstart Guide: Achievement Unlock Toast Notifications

**Feature**: 034-achievement-unlock-toasts  
**Date**: November 8, 2025  
**For**: Developers implementing achievement unlock toast notifications  
**Time**: ~2-3 hours total implementation

---

## Prerequisites

✅ Feature 021 (Toast Notification System) implemented and functional  
✅ Feature 032 (Achievement Unlock API Response) implemented  
✅ `/achievements` page exists  
✅ `EntryForm` component successfully saves entries  
✅ `useToast` hook available from `@/hooks/useToast`  
✅ `useRouter` from `next/navigation` available

---

## Quick Reference

**Files to Modify**: 1  
**Files to Create**: 1  
**Tests to Write**: 3 test files  
**Estimated Time**: 2-3 hours  
**Complexity**: Low (frontend-only, leverages existing infrastructure)

### Implementation Checklist

- [ ] Create `achievementToast.js` helper with formatting functions
- [ ] Modify `EntryForm.js` to display achievement toasts
- [ ] Write unit tests for `achievementToast.js`
- [ ] Write integration tests for `EntryForm` with achievement responses
- [ ] Manual QA: Test single and multiple achievement unlocks
- [ ] Manual QA: Test malformed data handling
- [ ] Manual QA: Test navigation to achievements page

---

## Step-by-Step Implementation

### Step 1: Create Achievement Toast Helper (30 minutes)

**File**: `src/lib/utils/achievementToast.js` (NEW)

Create utility functions for formatting achievement toast messages.

```javascript
/**
 * Achievement Toast Utility
 * 
 * Formats unlocked achievement data from API responses into
 * user-friendly toast notification messages.
 * 
 * Feature: 034-achievement-unlock-toasts
 */

/**
 * Get emoji based on achievement rarity
 * 
 * @param {string} rarity - Achievement rarity (Common, Rare, Epic, Legendary)
 * @returns {string} Emoji character
 */
export function getRarityEmoji(rarity) {
  const rarityMap = {
    'Common': '🏆',
    'Rare': '⭐',
    'Epic': '🎉',
    'Legendary': '✨'
  };
  
  return rarityMap[rarity] || '🏆'; // Default to trophy
}

/**
 * Format unlocked achievements into toast message
 * 
 * Handles single achievements, multiple achievements (with truncation),
 * and malformed data gracefully.
 * 
 * @param {Array<Object>} achievements - Unlocked achievements from API
 * @returns {string|null} Formatted message or null if no valid achievements
 * 
 * @example
 * // Single achievement
 * formatAchievementToast([{ name: 'First Fast', points: 10, rarity: 'Common' }])
 * // Returns: "🏆 Achievement Unlocked! First Fast - 10 points (Common)"
 * 
 * @example
 * // Multiple achievements
 * formatAchievementToast([
 *   { name: 'First Fast', points: 10, rarity: 'Common' },
 *   { name: 'Week Warrior', points: 25, rarity: 'Rare' }
 * ])
 * // Returns: "⭐ 2 Achievements Unlocked! First Fast (10 pts) • Week Warrior (25 pts) (+35 pts total)"
 */
export function formatAchievementToast(achievements) {
  try {
    // Validate input
    if (!Array.isArray(achievements) || achievements.length === 0) {
      return null;
    }

    // Filter out invalid achievements
    const validAchievements = achievements.filter(ach => {
      const isValid = (
        ach &&
        typeof ach.name === 'string' &&
        ach.name.trim().length > 0 &&
        typeof ach.points === 'number' &&
        typeof ach.rarity === 'string'
      );
      
      if (!isValid) {
        console.warn('[AchievementToast] Malformed achievement data:', ach);
      }
      
      return isValid;
    });

    // Handle no valid achievements - show fallback
    if (validAchievements.length === 0) {
      console.warn('[AchievementToast] No valid achievements to display');
      return '🏆 Achievement Unlocked! View your achievements page for details.';
    }

    // Single achievement format
    if (validAchievements.length === 1) {
      const ach = validAchievements[0];
      const emoji = getRarityEmoji(ach.rarity);
      return `${emoji} Achievement Unlocked! ${ach.name} - ${ach.points} points (${ach.rarity})`;
    }

    // Multiple achievements format
    const totalPoints = validAchievements.reduce((sum, ach) => sum + ach.points, 0);
    
    // Show first 3 achievements, truncate rest
    const displayAchievements = validAchievements.slice(0, 3);
    const names = displayAchievements
      .map(ach => `${ach.name} (${ach.points} pts)`)
      .join(' • ');
    
    const remaining = validAchievements.length - 3;
    const suffix = remaining > 0 ? ` and ${remaining} more...` : '';
    
    // Use emoji from first (typically highest rarity) achievement
    const emoji = getRarityEmoji(validAchievements[0].rarity);
    
    return `${emoji} ${validAchievements.length} Achievements Unlocked! ${names}${suffix} (+${totalPoints} pts total)`;
  } catch (error) {
    console.error('[AchievementToast] Error formatting toast:', error);
    // Return safe fallback message
    return '🏆 Achievement Unlocked! View your achievements page for details.';
  }
}
```

**Testing**: Create `tests/unit/lib/achievementToast.test.js` with tests for:
- Single achievement formatting
- Multiple achievements (2, 3, 4+)
- Rarity emoji selection
- Malformed data handling (missing fields, null values)
- Error handling (exception in formatting)

---

### Step 2: Modify EntryForm Component (45 minutes)

**File**: `src/components/organisms/EntryForm.js` (MODIFY)

Add achievement toast logic after successful entry save/update.

#### Location: After Successful API Response

Find the success handling code (after `await response.json()`) and add achievement toast logic:

```javascript
// Existing imports
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

// NEW: Import achievement toast helper
import { formatAchievementToast } from '@/lib/utils/achievementToast';

// Inside EntryForm component...

// Existing: Success toast is already shown
showSuccess(isEditMode ? 'Entry updated successfully!' : 'Entry saved successfully!');

// NEW: Achievement unlock toast
try {
  // Check if achievements were unlocked
  if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
    // Format achievement message
    const achievementMessage = formatAchievementToast(result.unlockedAchievements);
    
    // Display achievement toast if message generated
    if (achievementMessage) {
      showSuccess(achievementMessage, {
        autoDismiss: true,
        action: {
          label: 'View Achievements',
          onAction: () => {
            router.push('/achievements');
          }
        }
      });
    }
  }
} catch (error) {
  // Log error but don't break entry save flow
  console.error('[EntryForm] Error displaying achievement toast:', error);
  // Standard success toast already shown - this is non-blocking
}
```

#### Complete Context (Where to Add Code)

```javascript
// Inside submitForm function or similar handler

const response = await fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  // ... error handling ...
}

const result = await response.json();

// ✅ Existing success toast
showSuccess(isEditMode ? 'Entry updated successfully!' : 'Entry saved successfully!');

// ✅ NEW: Achievement toast (add here)
try {
  if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
    const achievementMessage = formatAchievementToast(result.unlockedAchievements);
    if (achievementMessage) {
      showSuccess(achievementMessage, {
        autoDismiss: true,
        action: {
          label: 'View Achievements',
          onAction: () => router.push('/achievements')
        }
      });
    }
  }
} catch (error) {
  console.error('[EntryForm] Error displaying achievement toast:', error);
}

// Continue with existing success handling (onSuccess callback, etc.)
if (onSuccess) onSuccess(result);
```

**Key Points**:
- Add AFTER standard success toast (so achievement toast appears second)
- Wrap in try-catch to prevent breaking entry save flow
- Use existing `router` and `showSuccess` from hooks
- Check for `result.unlockedAchievements?.length > 0` before processing

---

### Step 3: Write Unit Tests (30 minutes)

**File**: `tests/unit/lib/achievementToast.test.js` (NEW)

```javascript
import { formatAchievementToast, getRarityEmoji } from '@/lib/utils/achievementToast';

describe('achievementToast', () => {
  describe('getRarityEmoji', () => {
    it('returns trophy for Common rarity', () => {
      expect(getRarityEmoji('Common')).toBe('🏆');
    });

    it('returns star for Rare rarity', () => {
      expect(getRarityEmoji('Rare')).toBe('⭐');
    });

    it('returns celebration for Epic rarity', () => {
      expect(getRarityEmoji('Epic')).toBe('🎉');
    });

    it('returns sparkles for Legendary rarity', () => {
      expect(getRarityEmoji('Legendary')).toBe('✨');
    });

    it('returns trophy for unknown rarity', () => {
      expect(getRarityEmoji('Unknown')).toBe('🏆');
    });
  });

  describe('formatAchievementToast', () => {
    it('returns null for empty array', () => {
      expect(formatAchievementToast([])).toBeNull();
    });

    it('returns null for non-array input', () => {
      expect(formatAchievementToast(null)).toBeNull();
      expect(formatAchievementToast(undefined)).toBeNull();
    });

    it('formats single achievement correctly', () => {
      const achievements = [{
        name: 'First Fast',
        points: 10,
        rarity: 'Common'
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! First Fast - 10 points (Common)');
    });

    it('formats multiple achievements correctly', () => {
      const achievements = [
        { name: 'First Fast', points: 10, rarity: 'Common' },
        { name: 'Week Warrior', points: 25, rarity: 'Rare' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('2 Achievements Unlocked!');
      expect(result).toContain('First Fast (10 pts)');
      expect(result).toContain('Week Warrior (25 pts)');
      expect(result).toContain('+35 pts total');
    });

    it('truncates achievements beyond 3', () => {
      const achievements = [
        { name: 'Achievement 1', points: 10, rarity: 'Common' },
        { name: 'Achievement 2', points: 15, rarity: 'Rare' },
        { name: 'Achievement 3', points: 20, rarity: 'Epic' },
        { name: 'Achievement 4', points: 25, rarity: 'Legendary' },
        { name: 'Achievement 5', points: 30, rarity: 'Common' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('5 Achievements Unlocked!');
      expect(result).toContain('and 2 more...');
      expect(result).not.toContain('Achievement 4');
      expect(result).not.toContain('Achievement 5');
    });

    it('handles malformed data with fallback message', () => {
      const achievements = [
        { name: 'Valid', points: 10, rarity: 'Common' },
        { name: '', points: 5, rarity: 'Rare' }, // Invalid: empty name
        { points: 15, rarity: 'Epic' }, // Invalid: no name
        null // Invalid: null
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! Valid - 10 points (Common)');
    });

    it('returns fallback message when all achievements invalid', () => {
      const achievements = [
        { points: 10 }, // Missing name and rarity
        null,
        { name: '' } // Empty name
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! View your achievements page for details.');
    });
  });
});
```

---

### Step 4: Write Integration Tests (30 minutes)

**File**: `tests/integration/EntryForm.achievement-toasts.test.js` (NEW)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryForm from '@/components/organisms/EntryForm';
import { ToastProvider } from '@/contexts/ToastContext';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn()
  })
}));

describe('EntryForm - Achievement Toast Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  function renderEntryForm(props = {}) {
    return render(
      <ToastProvider>
        <EntryForm {...props} />
      </ToastProvider>
    );
  }

  it('displays achievement toast when single achievement unlocked', async () => {
    // Mock successful API response with unlocked achievement
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: { _id: '123', date: '2025-11-08' },
        unlockedAchievements: [{
          name: 'First 12-Hour Fast',
          points: 10,
          rarity: 'Common'
        }]
      })
    });

    renderEntryForm();

    // Fill and submit form
    // ... (fill form fields)
    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    // Wait for achievement toast to appear
    await waitFor(() => {
      expect(screen.getByText(/Achievement Unlocked!/i)).toBeInTheDocument();
      expect(screen.getByText(/First 12-Hour Fast/i)).toBeInTheDocument();
      expect(screen.getByText(/10 points/i)).toBeInTheDocument();
    });
  });

  it('displays consolidated toast for multiple achievements', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: { _id: '123' },
        unlockedAchievements: [
          { name: 'First Fast', points: 10, rarity: 'Common' },
          { name: 'Week Warrior', points: 25, rarity: 'Rare' }
        ]
      })
    });

    renderEntryForm();

    // Submit form
    // ...

    await waitFor(() => {
      expect(screen.getByText(/2 Achievements Unlocked!/i)).toBeInTheDocument();
      expect(screen.getByText(/First Fast/i)).toBeInTheDocument();
      expect(screen.getByText(/Week Warrior/i)).toBeInTheDocument();
    });
  });

  it('navigates to achievements page when clicking action button', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: { _id: '123' },
        unlockedAchievements: [{
          name: 'Test Achievement',
          points: 10,
          rarity: 'Common'
        }]
      })
    });

    renderEntryForm();

    // Submit form
    // ...

    // Click "View Achievements" button
    const viewButton = await screen.findByRole('button', { name: /view achievements/i });
    await userEvent.click(viewButton);

    expect(mockPush).toHaveBeenCalledWith('/achievements');
  });

  it('does not display achievement toast when no achievements unlocked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: { _id: '123' },
        unlockedAchievements: []
      })
    });

    renderEntryForm();

    // Submit form
    // ...

    // Should only show standard success toast, not achievement toast
    await waitFor(() => {
      expect(screen.getByText(/Entry saved successfully!/i)).toBeInTheDocument();
      expect(screen.queryByText(/Achievement Unlocked!/i)).not.toBeInTheDocument();
    });
  });

  it('handles malformed achievement data gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        entry: { _id: '123' },
        unlockedAchievements: [
          { name: '', points: 10 }, // Invalid: empty name
          null, // Invalid: null
          { points: 15 } // Invalid: no name
        ]
      })
    });

    renderEntryForm();

    // Submit form
    // ...

    // Should show fallback message
    await waitFor(() => {
      expect(screen.getByText(/View your achievements page for details/i)).toBeInTheDocument();
    });
  });
});
```

---

### Step 5: Manual QA Testing (30 minutes)

#### Test Scenario 1: Single Achievement Unlock

1. Start dev server: `npm run dev`
2. Navigate to entry form page
3. Create entry that unlocks an achievement (e.g., first 12-hour fast)
4. **Expected**: See two toasts:
   - "Entry saved successfully!"
   - "🏆 Achievement Unlocked! First 12-Hour Fast - 10 points (Common)"
5. **Expected**: Second toast has "View Achievements" button
6. Click "View Achievements" → navigates to `/achievements`

#### Test Scenario 2: Multiple Achievements

1. Create entry that unlocks 2-3 achievements
2. **Expected**: Consolidated toast "🏆 2 Achievements Unlocked! ..."
3. **Expected**: Shows achievement names and total points
4. **Expected**: "View Achievements" button present

#### Test Scenario 3: Many Achievements (4+)

1. Use admin tools or backfill script to create scenario with 5+ achievements
2. **Expected**: Toast shows first 3 achievements + "and 2 more..."
3. **Expected**: Total points includes all achievements

#### Test Scenario 4: No Achievements

1. Create entry that doesn't unlock achievements
2. **Expected**: Only standard success toast, no achievement toast

#### Test Scenario 5: Mobile Responsive

1. Open DevTools, set viewport to iPhone SE (375x667)
2. Create entry with achievement unlock
3. **Expected**: Toast displays correctly without overflow
4. **Expected**: "View Achievements" button is touch-friendly

---

## Common Patterns

### Pattern 1: Testing Achievement Unlocks Locally

```javascript
// Temporarily mock API response in EntryForm for testing
const mockResponse = {
  entry: { /* entry data */ },
  unlockedAchievements: [
    { name: 'Test Achievement', points: 50, rarity: 'Epic' }
  ]
};
```

### Pattern 2: Debugging Toast Display

```javascript
// Add logging to track achievement toast flow
console.log('[DEBUG] Unlocked achievements:', result.unlockedAchievements);
console.log('[DEBUG] Formatted message:', achievementMessage);
```

### Pattern 3: Testing Different Rarity Levels

Create test achievements with different rarities:
- Common: 🏆 Green tone
- Rare: ⭐ Blue tone
- Epic: 🎉 Purple tone
- Legendary: ✨ Gold tone

---

## Troubleshooting

### Issue: Toast Not Appearing

**Symptoms**: Entry saves successfully but no achievement toast  
**Checks**:
1. Verify `result.unlockedAchievements` exists in API response
2. Check browser console for errors
3. Verify `formatAchievementToast` returns non-null value
4. Ensure `showSuccess` is imported and working

**Fix**: Add debug logging to track data flow

---

### Issue: "View Achievements" Button Not Working

**Symptoms**: Button present but clicking doesn't navigate  
**Checks**:
1. Verify `router` from `useRouter` hook is available
2. Check if `/achievements` route exists
3. Look for navigation errors in console

**Fix**: Ensure `useRouter` is called in component (not helper function)

---

### Issue: Malformed Data Crashes App

**Symptoms**: Page breaks when achievements have missing fields  
**Checks**:
1. Review `formatAchievementToast` validation logic
2. Check if try-catch is wrapping toast display code
3. Verify fallback message is returned

**Fix**: Ensure all validation checks are in place (see Step 1)

---

### Issue: Toast Overlaps Content on Mobile

**Symptoms**: Toast blocks important UI on small screens  
**Checks**:
1. Test on actual mobile device or accurate emulator
2. Verify existing toast system positioning
3. Check z-index conflicts

**Fix**: Existing toast system should handle positioning - verify Feature 021 implementation

---

## Verification Checklist

Before marking this feature complete, verify:

- [ ] ✅ Single achievement displays with correct format
- [ ] ✅ Multiple achievements display in consolidated format
- [ ] ✅ 4+ achievements truncate with "and X more..."
- [ ] ✅ "View Achievements" button navigates to /achievements page
- [ ] ✅ Malformed data shows fallback message without crashing
- [ ] ✅ No achievements = no achievement toast (standard success only)
- [ ] ✅ Toast auto-dismisses after 5 seconds
- [ ] ✅ Toast can be manually dismissed with X button
- [ ] ✅ Works on mobile devices (667px+ screen height)
- [ ] ✅ All unit tests pass (achievement Toast.test.js)
- [ ] ✅ All integration tests pass (EntryForm tests)
- [ ] ✅ Console has no errors during achievement unlock flow
- [ ] ✅ Entry save flow works even if achievement toast errors occur

---

## Next Steps

After implementation:

1. **Code Review**: Have team review achievement toast logic
2. **QA Testing**: Test on real mobile devices
3. **User Testing**: Get feedback on toast message format and timing
4. **Future Enhancements**:
   - Custom toast styling per rarity (requires ToastContext changes)
   - Animation for achievement unlock (confetti, sparkles)
   - Sound effects for achievement unlocks
   - Individual achievement links in consolidated toast

---

## Performance Notes

- Toast display adds <1ms to entry save flow
- No additional API calls required
- Toast system handles queueing and performance
- No memory leaks (data discarded after toast display)

**Target**: <500ms from API response to toast appearance ✅

---

## Support

**Feature Spec**: `/specs/034-achievement-unlock-toasts/spec.md`  
**Implementation Plan**: `/specs/034-achievement-unlock-toasts/plan.md`  
**Research**: `/specs/034-achievement-unlock-toasts/research.md`  
**Data Model**: `/specs/034-achievement-unlock-toasts/data-model.md`

For questions or issues, review these documents or consult with team.
