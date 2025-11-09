# Research: Achievement Unlock Toast Notifications

**Feature**: 034-achievement-unlock-toasts  
**Date**: November 8, 2025  
**Purpose**: Resolve technical questions and establish implementation patterns for achievement unlock toast notifications

## Research Questions

### Q1: How should achievement toasts integrate with the existing toast system?

**Decision**: Use existing `showSuccess` method with custom styling through message formatting

**Rationale**:
- The existing ToastContext (Feature 021) provides `showSuccess()` and `showError()` methods with action button support
- Toast system already handles queueing (FIFO), deduplication, max 4 toasts, auto-dismiss (5s for success)
- No need to create new `showAchievement()` method - can format achievement content as rich success toast message
- Keeps implementation simple and leverages existing tested infrastructure

**Alternatives Considered**:
1. **Create new `showAchievement()` method in ToastContext** - Rejected: Adds unnecessary complexity, requires modifying shared context, duplicates toast logic
2. **Create separate AchievementToast component** - Rejected: Breaks toast system consistency, requires separate positioning/stacking logic
3. **Use modal instead of toast** - Rejected: Too intrusive, blocks user workflow, spec explicitly calls for toast notifications

**Implementation Pattern**:
```javascript
// In EntryForm after successful API response
if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
  const toastContent = formatAchievementToast(result.unlockedAchievements);
  showSuccess(toastContent, {
    autoDismiss: true,
    action: {
      label: 'View Achievements',
      onAction: () => router.push('/achievements')
    }
  });
}
```

---

### Q2: Should multiple achievements display as one consolidated toast or sequential toasts?

**Decision**: Single consolidated toast for 2+ achievements with formatted list

**Rationale**:
- Spec FR-005 allows either approach; consolidated is simpler and less intrusive
- Prevents toast spam when user unlocks multiple achievements (e.g., first entry with long fast)
- Existing toast system has 4-toast limit - sequential toasts could queue/block other notifications
- Users can still see all achievements listed in single notification
- Clicking toast navigates to /achievements page where all details are visible

**Alternatives Considered**:
1. **Sequential toasts with 6-second intervals** - Rejected: Complex timing logic, can block other toasts, slower user feedback
2. **Dynamic decision based on count** - Rejected: Inconsistent UX, adds complexity
3. **Modal for 3+ achievements** - Rejected: Spec calls for toasts, modal is too intrusive

**Implementation Pattern**:
```javascript
function formatAchievementToast(achievements) {
  if (achievements.length === 1) {
    const ach = achievements[0];
    return `🏆 Achievement Unlocked! ${ach.name} - ${ach.points} points (${ach.rarity})`;
  } else {
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const names = achievements.slice(0, 3).map(a => `${a.name} (${a.points} pts)`).join(' • ');
    const suffix = achievements.length > 3 ? ` and ${achievements.length - 3} more...` : '';
    return `🏆 ${achievements.length} Achievements Unlocked! ${names}${suffix} (+${totalPoints} pts total)`;
  }
}
```

---

### Q3: How should rarity-based styling be implemented for achievement toasts?

**Decision**: Use emoji icons based on rarity, defer custom colors to future enhancement

**Rationale**:
- Existing toast system uses predefined success/error styles (green for success, red for error)
- Modifying ToastContext to support custom colors would require significant refactoring
- Spec FR-008 requires rarity colors (Common=green, Rare=blue, Epic=purple, Legendary=gold)
- **Practical compromise**: Use rarity-specific emoji and include rarity text in message
  - Common: 🏆 (trophy) - matches existing toast green
  - Rare: ⭐ (star) - visually distinct
  - Epic: 🎉 (celebration) - more energetic
  - Legendary: ✨ (sparkles) - most special
- Text includes rarity name (e.g., "(Legendary)") for clarity
- Future enhancement could add custom toast types to ToastContext

**Alternatives Considered**:
1. **Extend ToastContext with achievement type** - Rejected for MVP: Requires modifying shared component used across app, risky for this feature scope
2. **Inline styles on toast message** - Rejected: Toast system may sanitize HTML, inconsistent with design system
3. **No rarity differentiation** - Rejected: Spec explicitly requires visual distinction (FR-008, FR-009)

**Implementation Pattern**:
```javascript
function getRarityEmoji(rarity) {
  const rarityMap = {
    'Common': '🏆',
    'Rare': '⭐',
    'Epic': '🎉',
    'Legendary': '✨'
  };
  return rarityMap[rarity] || '🏆'; // Default to trophy
}

function formatAchievementToast(achievements) {
  const firstAch = achievements[0];
  const icon = getRarityEmoji(firstAch.rarity);
  // ... rest of formatting
}
```

---

### Q4: How should the toast navigation to /achievements page work?

**Decision**: Use action button "View Achievements" for explicit navigation

**Rationale**:
- Existing toast system supports action buttons with `onAction` callback (Feature 021, FR-010)
- Action button is explicit and discoverable - users know they can click to view more
- Prevents accidental navigation when user clicks to dismiss toast
- Close button (X) still dismisses without navigation as expected
- Consistent with existing toast action patterns in the app

**Alternatives Considered**:
1. **Click anywhere on toast body to navigate** - Rejected: Spec mentions this (FR-006) but conflicts with toast close behavior, could be confusing UX
2. **Automatic navigation after timeout** - Rejected: Too intrusive, removes user control
3. **No navigation** - Rejected: Spec explicitly requires link to /achievements page

**Implementation Pattern**:
```javascript
showSuccess(achievementMessage, {
  autoDismiss: true,
  action: {
    label: 'View Achievements',
    onAction: () => {
      router.push('/achievements');
    }
  }
});
```

**Note**: If spec insistence on "clicking toast body navigates" is critical, could wrap entire toast content in button/link, but this requires ToastContext modification.

---

### Q5: How should malformed achievement data be handled?

**Decision**: Graceful degradation with fallback message and console warnings

**Rationale**:
- Spec FR-011 requires graceful handling of malformed data
- Core entry save functionality must never fail due to achievement display issues (FR-012)
- Defense-in-depth: validate data, log warnings, show fallback toast or skip malformed items
- User still knows achievement was unlocked, can visit /achievements page for details

**Implementation Pattern**:
```javascript
function formatAchievementToast(achievements) {
  try {
    // Filter out invalid achievements
    const validAchievements = achievements.filter(ach => {
      if (!ach.name || typeof ach.points !== 'number') {
        console.warn('Malformed achievement data:', ach);
        return false;
      }
      return true;
    });

    if (validAchievements.length === 0) {
      // Fallback: generic message
      return '🏆 Achievement Unlocked! View your achievements page for details.';
    }

    // Format valid achievements
    // ... (normal formatting logic)
  } catch (error) {
    console.error('Error formatting achievement toast:', error);
    // Return safe fallback
    return '🏆 Achievement Unlocked! View your achievements page for details.';
  }
}
```

---

## Technology Stack Decisions

### Frontend Framework
- **Choice**: Next.js App Router (existing)
- **Version**: Current project version
- **Rationale**: Already in use, no new framework decisions needed

### State Management
- **Choice**: React Context (ToastContext)
- **Rationale**: Existing toast system uses Context API, no need for additional state management

### Routing
- **Choice**: Next.js `useRouter` from `next/navigation`
- **Rationale**: App Router hook for client-side navigation to /achievements page

### Testing
- **Choice**: Jest + React Testing Library
- **Rationale**: Existing project test setup, well-suited for component and integration tests

---

## Best Practices Applied

### 1. Error Boundaries
- **Practice**: Wrap achievement toast logic in try-catch blocks
- **Rationale**: Prevent achievement display errors from breaking entry save flow (FR-012)
- **Implementation**: All formatting and display logic wrapped in error handlers with fallback messages

### 2. Defensive Programming
- **Practice**: Validate API response data before using
- **Rationale**: API might return null, undefined, or malformed data
- **Implementation**: Check `result.unlockedAchievements?.length > 0` before processing, validate individual achievement objects

### 3. User-Centric Messaging
- **Practice**: Clear, celebratory language with actionable next steps
- **Rationale**: Achievements are motivational features - messaging should be enthusiastic
- **Implementation**: Use exclamation points, emoji, and "View Achievements" call-to-action

### 4. Accessibility Considerations
- **Practice**: Ensure toast content is screen-reader friendly
- **Rationale**: Spec edge case mentions screen reader support, WCAG compliance (constitution)
- **Implementation**: Existing toast system should handle ARIA announcements; verify in testing

### 5. Mobile-First Design
- **Practice**: Test on mobile viewport (667px height minimum per SC-010)
- **Rationale**: Constitution requires mobile-first, toasts must not obscure critical UI on small screens
- **Implementation**: Leverage existing toast system positioning, verify in mobile testing

---

## Integration Points

### 1. EntryForm Component
- **Location**: `src/components/organisms/EntryForm.js`
- **Modification**: Add achievement toast logic after successful API response (POST/PUT)
- **Dependency**: Already has `useToast` hook imported and used for success/error messages
- **Integration**: Add conditional check for `result.unlockedAchievements` after existing success toast

### 2. ToastContext
- **Location**: `src/contexts/ToastContext.js`
- **Modification**: None required for MVP (use existing `showSuccess` method)
- **Future Enhancement**: Could add `showAchievement` method with custom styling if needed

### 3. Achievements Page
- **Location**: `src/app/achievements/page.js`
- **Modification**: None required (page already exists for navigation target)
- **Integration**: Toast action button navigates to this route

### 4. API Response Contract
- **Location**: `src/app/api/entries/route.js` and `src/app/api/entries/[id]/route.js`
- **Modification**: None required (Feature 032 already implemented)
- **Contract**: Expect `unlockedAchievements` array in response body with structure:
  ```javascript
  {
    entry: { /* entry data */ },
    unlockedAchievements: [
      {
        achievementId: string,
        name: string,
        description: string,
        points: number,
        rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary',
        category: string,
        iconColor: string,
        unlockedAt: string (ISO 8601)
      }
    ]
  }
  ```

---

## Performance Considerations

### Toast Display Performance
- **Target**: <500ms from API response to toast display (SC-001)
- **Approach**: Synchronous formatting, no async operations in toast display path
- **Measurement**: Can be tested with performance.now() timestamps before/after toast call

### Memory Management
- **Concern**: Multiple achievements with long names could create large toast messages
- **Mitigation**: Truncate to 3 achievements + "and X more..." (FR-014)
- **Impact**: Prevents excessive DOM size, maintains readability

### Animation Performance
- **Dependency**: Existing toast system animations (Feature 021)
- **Assumption**: Already optimized for smooth entrance/exit transitions
- **Verification**: Test on lower-end mobile devices during QA

---

## Risk Mitigation

### Risk 1: API Response Changes
- **Risk**: API might change `unlockedAchievements` structure in future
- **Mitigation**: Defensive data validation, fallback messages, TypeScript types (future)
- **Impact**: Low - API contract is documented in Feature 032

### Risk 2: Toast System Compatibility
- **Risk**: Existing toast system might not support rich content or action buttons as expected
- **Mitigation**: Review ToastContext implementation, test action buttons early
- **Impact**: Medium - could require toast system enhancement

### Risk 3: User Confusion with Multiple Toasts
- **Risk**: Standard success toast + achievement toast both displaying could be confusing
- **Mitigation**: Achievement toast appears immediately after success toast (within same second), consolidated format makes it clear they're related
- **Impact**: Low - users likely understand both are confirmation of successful save

### Risk 4: Mobile Screen Space
- **Risk**: Long achievement names could make toast too tall on mobile
- **Mitigation**: Truncation to 3 achievements (FR-014), responsive toast sizing (existing)
- **Impact**: Low - handled by existing toast system + truncation logic

---

## Open Questions for Implementation Phase

*None - all technical questions resolved during research. Ready for Phase 1 (Design & Contracts).*
