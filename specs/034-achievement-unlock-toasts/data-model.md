# Data Model: Achievement Unlock Toast Notifications

**Feature**: 034-achievement-unlock-toasts  
**Date**: November 8, 2025  
**Purpose**: Define data structures and flow for achievement unlock toast notifications

## Overview

This feature is **frontend-only** - no new database models or API contracts. It consumes existing API response data and displays it through the existing toast notification system. This document defines the data structures flowing through the frontend components and the transformation logic.

---

## Data Structures

### 1. API Response Structure (Existing - Feature 032)

**Source**: POST `/api/entries` and PUT `/api/entries/[id]` response body

```javascript
{
  // Standard entry response
  entry: {
    _id: string,
    userId: string,
    date: string,        // ISO 8601 date
    firstMealTime: string,
    lastMealTime: string,
    fastingDuration: number,
    // ... other entry fields
  },
  
  // Achievement unlock data (Feature 032)
  unlockedAchievements: [
    {
      achievementId: string,           // e.g., "first-twelve"
      name: string,                    // e.g., "First 12-Hour Fast"
      description: string,             // e.g., "Complete your first 12-hour fast"
      points: number,                  // e.g., 10
      rarity: string,                  // enum: "Common", "Rare", "Epic", "Legendary"
      category: string,                // e.g., "duration", "streak", "goal"
      iconColor: string,               // e.g., "#10B981"
      unlockedAt: string              // ISO 8601 timestamp
    },
    // ... more achievements if multiple unlocked
  ]
}
```

**Validation Notes**:
- `unlockedAchievements` may be `undefined`, `null`, or `[]` (empty array)
- Individual achievement objects may have missing fields (malformed data edge case)
- Frontend must validate before displaying

---

### 2. Achievement Toast Configuration (Internal)

**Purpose**: Configuration object passed to `showSuccess()` method

```javascript
{
  message: string,              // Formatted achievement message
  autoDismiss: boolean,         // Always true (5-second auto-dismiss)
  action: {
    label: string,              // "View Achievements"
    onAction: Function          // () => router.push('/achievements')
  }
}
```

---

### 3. Formatted Achievement Message (String)

**Purpose**: Human-readable message string displayed in toast

**Single Achievement Format**:
```
🏆 Achievement Unlocked! First 12-Hour Fast - 10 points (Common)
```

**Multiple Achievements Format (2-3)**:
```
🏆 2 Achievements Unlocked! First 12-Hour Fast (10 pts) • First Entry Logged (5 pts) (+15 pts total)
```

**Multiple Achievements Format (4+)**:
```
🏆 5 Achievements Unlocked! First 12-Hour Fast (10 pts) • Week Warrior (25 pts) • Getting Started (5 pts) and 2 more... (+75 pts total)
```

**Fallback Format (Malformed Data)**:
```
🏆 Achievement Unlocked! View your achievements page for details.
```

---

## Data Flow

### Entry Save → Achievement Toast Display

```
┌─────────────────┐
│  User submits   │
│   EntryForm     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  API Call (POST /api/entries)               │
│  - Saves entry to database                  │
│  - Evaluates achievement criteria           │
│  - Returns entry + unlockedAchievements[]   │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  EntryForm Success Handler                  │
│  1. Check: result.unlockedAchievements?     │
│  2. Validate: Array with length > 0?        │
│  3. Call: formatAchievementToast()          │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  formatAchievementToast()                   │
│  1. Validate each achievement object        │
│  2. Filter out malformed data               │
│  3. Determine format (single vs. multiple)  │
│  4. Select rarity emoji                     │
│  5. Build formatted message string          │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  showSuccess() from useToast                │
│  - Display toast with formatted message     │
│  - Add "View Achievements" action button    │
│  - Auto-dismiss after 5 seconds             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  User clicks "View Achievements"            │
│  - router.push('/achievements')             │
│  - Navigate to achievements page            │
└─────────────────────────────────────────────┘
```

---

## Data Transformation Logic

### Function: `formatAchievementToast(achievements)`

**Input**: `Array<Achievement>` from API response  
**Output**: `string` (formatted toast message)  
**Location**: `src/lib/utils/achievementToast.js`

#### Algorithm

```javascript
function formatAchievementToast(achievements) {
  // Step 1: Validate input
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return null; // Caller should skip toast
  }

  // Step 2: Filter valid achievements
  const validAchievements = achievements.filter(ach => {
    const isValid = (
      ach &&
      typeof ach.name === 'string' &&
      typeof ach.points === 'number' &&
      typeof ach.rarity === 'string'
    );
    
    if (!isValid) {
      console.warn('[AchievementToast] Malformed achievement:', ach);
    }
    
    return isValid;
  });

  // Step 3: Handle no valid achievements
  if (validAchievements.length === 0) {
    return '🏆 Achievement Unlocked! View your achievements page for details.';
  }

  // Step 4: Single achievement format
  if (validAchievements.length === 1) {
    const ach = validAchievements[0];
    const emoji = getRarityEmoji(ach.rarity);
    return `${emoji} Achievement Unlocked! ${ach.name} - ${ach.points} points (${ach.rarity})`;
  }

  // Step 5: Multiple achievements format
  const totalPoints = validAchievements.reduce((sum, ach) => sum + ach.points, 0);
  const displayAchievements = validAchievements.slice(0, 3);
  const names = displayAchievements.map(ach => `${ach.name} (${ach.points} pts)`).join(' • ');
  
  const remaining = validAchievements.length - 3;
  const suffix = remaining > 0 ? ` and ${remaining} more...` : '';
  
  const emoji = getRarityEmoji(validAchievements[0].rarity);
  return `${emoji} ${validAchievements.length} Achievements Unlocked! ${names}${suffix} (+${totalPoints} pts total)`;
}
```

---

### Function: `getRarityEmoji(rarity)`

**Input**: `string` (rarity level: Common, Rare, Epic, Legendary)  
**Output**: `string` (emoji character)  
**Location**: `src/lib/utils/achievementToast.js`

#### Rarity → Emoji Mapping

| Rarity | Emoji | Unicode | Rationale |
|--------|-------|---------|-----------|
| Common | 🏆 | U+1F3C6 | Standard trophy, matches green success toast |
| Rare | ⭐ | U+2B50 | Star indicates special achievement |
| Epic | 🎉 | U+1F389 | Celebration for impressive milestone |
| Legendary | ✨ | U+2728 | Sparkles for most prestigious achievements |
| Default | 🏆 | U+1F3C6 | Fallback for unknown rarity values |

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
```

---

## State Management

### No New State Required

This feature does **not** introduce new component state or global state. It operates on:

1. **Existing EntryForm State**: Uses existing `isSubmitting` flag, form data, success handling
2. **Existing Toast State**: Managed by ToastContext (Feature 021) - toasts added to displayed queue
3. **Transient Data**: API response data is processed and discarded after toast display

### Data Lifecycle

1. **API Response Received**: `unlockedAchievements` array extracted from response
2. **Formatting**: Data transformed to string message (synchronous)
3. **Toast Display**: Message passed to `showSuccess()`, added to toast queue
4. **Toast Dismissal**: After 5 seconds or user click, toast removed from queue
5. **Data Discarded**: No persistence of achievement data in EntryForm

**Rationale**: Achievement data is already persisted in database and available on `/achievements` page. Toast is temporary notification only.

---

## Error Handling Data Flow

### Malformed Achievement Data

```
API Response with malformed data
         │
         ▼
formatAchievementToast() validates
         │
         ├─ All invalid? → Fallback message
         ├─ Some invalid? → Filter out, format valid ones
         └─ All valid? → Normal formatting
         │
         ▼
showSuccess() displays toast
```

### Exception Handling

```javascript
// In EntryForm.js success handler
try {
  if (result.unlockedAchievements?.length > 0) {
    const message = formatAchievementToast(result.unlockedAchievements);
    if (message) {
      showSuccess(message, {
        autoDismiss: true,
        action: {
          label: 'View Achievements',
          onAction: () => router.push('/achievements')
        }
      });
    }
  }
} catch (error) {
  // Log but don't block entry save success
  console.error('[EntryForm] Achievement toast error:', error);
  // Standard success toast still shows - achievement toast silently fails
}
```

---

## Data Validation Rules

### Achievement Object Validation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `achievementId` | string | No (not used) | - |
| `name` | string | **Yes** | Non-empty string, used in toast message |
| `description` | string | No (not used) | - |
| `points` | number | **Yes** | Positive integer, used in toast message |
| `rarity` | string | **Yes** | Enum check (optional), used for emoji selection |
| `category` | string | No (not used) | - |
| `iconColor` | string | No (not used) | - |
| `unlockedAt` | string | No (not used) | - |

**Validation Strategy**: Minimal validation - only check fields actually used in toast display (name, points, rarity). Other fields ignored if missing.

---

## Performance Considerations

### Data Processing Performance

- **Filtering**: O(n) where n = number of achievements (typically 1-5)
- **Formatting**: O(n) string concatenation (minimal allocations)
- **Total Time**: <1ms for typical achievement counts
- **Target**: <500ms from API response to toast display (SC-001)

### Memory Usage

- **Transient Data**: Achievement array held temporarily during formatting
- **Toast Message**: Single string (typically <200 characters)
- **No Persistence**: Data discarded after toast display
- **Impact**: Negligible memory overhead

---

## Integration Points

### 1. EntryForm Component

**Data In**: API response with `unlockedAchievements` array  
**Data Out**: Formatted string to `showSuccess()`

```javascript
// After successful API call
const result = await response.json();

// Achievement toast logic
if (result.unlockedAchievements?.length > 0) {
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
```

### 2. Toast System

**Data In**: Formatted message string + configuration object  
**Data Out**: Visual toast rendered in ToastContainer

No data model changes required - uses existing toast data structures.

---

## Testing Data

### Mock Achievement Data

**Single Achievement (Common)**:
```javascript
[{
  achievementId: 'first-twelve',
  name: 'First 12-Hour Fast',
  description: 'Complete your first 12-hour fast',
  points: 10,
  rarity: 'Common',
  category: 'duration',
  iconColor: '#10B981',
  unlockedAt: '2025-11-08T14:30:00Z'
}]
```

**Multiple Achievements (Mixed Rarity)**:
```javascript
[
  {
    achievementId: 'first-twelve',
    name: 'First 12-Hour Fast',
    points: 10,
    rarity: 'Common',
    // ... other fields
  },
  {
    achievementId: 'week-warrior',
    name: 'Week Warrior',
    points: 25,
    rarity: 'Rare',
    // ... other fields
  }
]
```

**Malformed Data**:
```javascript
[
  { name: 'Valid Achievement', points: 10, rarity: 'Common' },
  { name: 'Missing Points', rarity: 'Rare' }, // Invalid - no points
  { points: 15, rarity: 'Epic' },             // Invalid - no name
  null,                                        // Invalid - null
  { name: '', points: 5, rarity: 'Common' }   // Invalid - empty name
]
```

**Expected Result**: Filter out invalid items, show toast for valid achievement only.

---

## Summary

This feature introduces **no new data models** - it consumes existing API response data and transforms it for display. Key data transformations:

1. **API Response** → **Validated Achievement Array** (filter malformed data)
2. **Achievement Array** → **Formatted String** (single vs. multiple format)
3. **String + Config** → **Toast Display** (via existing ToastContext)

All data is transient - no persistence required beyond existing achievement database records.
