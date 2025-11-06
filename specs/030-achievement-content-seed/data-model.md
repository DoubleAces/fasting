# Data Model: Achievement Content Catalog

**Feature**: 030-achievement-content-seed  
**Date**: November 5, 2025

This document specifies the content structure for 80-85 achievement definitions that will populate the existing Achievement model from Feature 028.

---

## Overview

**Schema**: No schema changes required. Uses existing `Achievement` model from `src/lib/models/Achievement.js`.

**Purpose**: Define content instances (seed data) for comprehensive achievement catalog spanning 8 categories with progressive difficulty, balanced rarities, and multilingual support.

**Total Achievements**: 80-85 instances across 8 categories

---

## Category Distribution

| Category | Count | Description | Rarity Mix |
|----------|-------|-------------|------------|
| **getting-started** | 8 | Onboarding achievements for new users | 6 common, 2 rare |
| **duration** | 12 | Fasting duration milestones (12h to 120h) | 4 common, 4 rare, 3 epic, 1 legendary |
| **streak** | 10 | Consecutive day streaks (3 to 1000 days) | 2 common, 4 rare, 3 epic, 1 legendary |
| **goal** | 8 | Goal completion patterns | 3 common, 3 rare, 2 epic |
| **weight** | 8 | Weight tracking and progress | 3 common, 3 rare, 2 epic |
| **consistency** | 12 | Long-term engagement patterns | 5 common, 4 rare, 2 epic, 1 legendary |
| **special** | 15 | Unique accomplishments and rare conditions | 6 common, 5 rare, 3 epic, 1 legendary |
| **knowledge** | 8 | Biological stage exploration | 4 common, 2 rare, 2 epic |
| **TOTAL** | **81** | | ~45% common, ~30% rare, ~18% epic, ~7% legendary |

---

## Achievement Attribute Structure

Each achievement includes the following attributes (conforming to existing Achievement schema):

### Identity
- **achievementId** (string, unique): Kebab-case slug (e.g., 'first-fast', 'sweet-sixteen', 'legendary-streak')

### Translations (Object)
```javascript
translations: {
  en: {
    name: string,              // 3-6 words, title case (e.g., "Sweet Sixteen")
    description: string,       // 10-20 words, sentence case (e.g., "Complete your first 16-hour fast")
    shortDescription: string   // 2-4 words (e.g., "First 16hr fast")
  },
  es: {
    name: string,              // Professional translation (e.g., "Dieciséis Horas")
    description: string,       // Professional translation (e.g., "Completa tu primer ayuno de 16 horas")
    shortDescription: string   // Professional translation (e.g., "Primer ayuno de 16h")
  }
}
```

### Gamification Metadata
- **points** (number): Common (5-25), Rare (30-75), Epic (80-150), Legendary (200-500)
- **rarity** (enum): 'common' | 'rare' | 'epic' | 'legendary'
- **order** (number): Display sequence within category (use gaps: 5, 10, 15, 20 for future insertions)

### Visual Identity
- **icon** (string): Emoji character (🏆, ⏱️, 🔥, 💪, 📊, 🎯, ⚡, 🌟, 🌱, 📅, 💯, 🎖️)
- **iconColor** (string): Hex code (e.g., '#4F46E5', '#10B981', '#F59E0B')

### Unlock Logic
```javascript
criteria: {
  type: string,    // 'duration-milestone' | 'streak' | 'entry-count' | 'custom'
  params: object   // Type-specific parameters
}
```

**Criteria Type Details**:

**duration-milestone** (supported by evaluator):
```javascript
criteria: { 
  type: 'duration-milestone', 
  params: { hours: 16 } 
}
```

**streak** (supported by evaluator):
```javascript
criteria: { 
  type: 'streak', 
  params: { days: 7 } 
}
```

**entry-count** (supported by evaluator):
```javascript
criteria: { 
  type: 'entry-count', 
  params: { count: 100 } 
}
```

**custom** (for unimplemented features):
```javascript
criteria: { 
  type: 'custom', 
  params: { 
    feature: 'weight-tracking',  // or 'goal-completion', 'biological-stages'
    action: 'weight-loss',       // specific action
    amount: 10,                  // quantity
    unit: 'lbs'                  // unit of measurement
  }
}
```

### System Metadata
- **category** (enum): 'getting-started' | 'duration' | 'streak' | 'goal' | 'weight' | 'consistency' | 'special' | 'knowledge'
- **isActive** (boolean): true (all achievements active at launch)
- **isSecret** (boolean): true for ~5-7 legendary achievements (default: false)
- **releaseDate** (Date, optional): Future date for ~5 achievements (e.g., "2026-01-01" for New Year achievement)
- **createdBy** (ObjectId): Reference to system admin user (system@achievements.local)

---

## Category Specifications

### 1. Getting Started (8 achievements)

**Purpose**: Onboarding achievements for new users, low barriers to entry

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | first-steps | First Steps | entry-count: 1 | 5 | common |
| 10 | breaking-the-fast | Breaking the Fast | duration-milestone: 10h | 10 | common |
| 15 | double-digits | Double Digits | duration-milestone: 10h | 10 | common |
| 20 | sweet-sixteen | Sweet Sixteen | duration-milestone: 16h | 15 | common |
| 25 | daily-dozen | Daily Dozen | streak: 12 | 20 | common |
| 30 | week-warrior | Week Warrior | streak: 7 | 25 | rare |
| 35 | hydration-hero | Hydration Hero | custom: water-logging | 15 | common |
| 40 | note-taker | Note Taker | custom: notes-entry | 10 | rare |

**Icon Theme**: 🌱 (growth), ⭐ (achievement), 📝 (notes), 💧 (water)  
**Color Theme**: Green (#10B981), Blue (#3B82F6)

---

### 2. Duration Milestones (12 achievements)

**Purpose**: Progressive fasting duration targets from 12h to 120h

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | twelve-hour-triumph | Twelve Hour Triumph | duration-milestone: 12h | 10 | common |
| 10 | fourteen-hour-fortitude | Fourteen Hour Fortitude | duration-milestone: 14h | 15 | common |
| 15 | sweet-sixteen | Sweet Sixteen | duration-milestone: 16h | 20 | common |
| 20 | eighteen-hour-hero | Eighteen Hour Hero | duration-milestone: 18h | 25 | common |
| 25 | twenty-hour-titan | Twenty Hour Titan | duration-milestone: 20h | 35 | rare |
| 30 | daily-fasting-master | Daily Fasting Master | duration-milestone: 22h | 45 | rare |
| 35 | omad-warrior | OMAD Warrior | duration-milestone: 24h | 60 | rare |
| 40 | day-and-a-half | Day and a Half | duration-milestone: 36h | 75 | rare |
| 45 | two-day-dedication | Two Day Dedication | duration-milestone: 48h | 100 | epic |
| 50 | three-day-triumph | Three Day Triumph | duration-milestone: 72h | 125 | epic |
| 55 | four-day-phenomenon | Four Day Phenomenon | duration-milestone: 96h | 150 | epic |
| 60 | extended-fast-legend | Extended Fast Legend | duration-milestone: 120h | 250 | legendary |

**Icon Theme**: ⏱️ (time), 🎯 (goal), 💪 (strength)  
**Color Theme**: Purple (#8B5CF6), Indigo (#4F46E5)

---

### 3. Streak Achievements (10 achievements)

**Purpose**: Consecutive day streaks demonstrating consistency

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | three-day-starter | Three Day Starter | streak: 3 | 10 | common |
| 10 | week-warrior | Week Warrior | streak: 7 | 30 | common |
| 15 | two-week-champion | Two Week Champion | streak: 14 | 50 | rare |
| 20 | monthly-mastery | Monthly Mastery | streak: 30 | 65 | rare |
| 25 | quarterly-commitment | Quarterly Commitment | streak: 90 | 75 | rare |
| 30 | half-year-hero | Half Year Hero | streak: 180 | 90 | rare |
| 35 | centurion | Centurion | streak: 100 | 100 | epic |
| 40 | year-of-discipline | Year of Discipline | streak: 365 | 150 | epic |
| 45 | unbreakable | Unbreakable | streak: 500 | 200 | epic |
| 50 | legendary-streak | Legendary Streak | streak: 1000 | 500 | legendary |

**Icon Theme**: 🔥 (fire/streak), 📅 (calendar), 🎖️ (medal)  
**Color Theme**: Orange (#F59E0B), Red (#EF4444)

**Secret Achievements**: "Unbreakable" (500 days) and "Legendary Streak" (1000 days) marked as isSecret=true

---

### 4. Goal Achievements (8 achievements)

**Purpose**: Goal completion patterns (requires goal tracking feature - custom criteria)

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | first-goal-completed | First Goal Completed | custom: goal-completion, count: 1 | 15 | common |
| 10 | overachiever | Overachiever | custom: goal-exceeded | 25 | common |
| 15 | goal-getter | Goal Getter | custom: goal-completion, count: 7 | 40 | common |
| 20 | consecutive-goals | Consecutive Goals | custom: goal-completion, consecutive: 3 | 55 | rare |
| 25 | precision-planner | Precision Planner | custom: goal-exact-match, count: 5 | 60 | rare |
| 30 | goal-master | Goal Master | custom: goal-completion, count: 30 | 70 | rare |
| 35 | ambitious-achiever | Ambitious Achiever | custom: goal-completion, count: 50 | 110 | epic |
| 40 | goal-grandmaster | Goal Grandmaster | custom: goal-completion, count: 100 | 140 | epic |

**Icon Theme**: 🎯 (target), 📊 (progress), ⚡ (achievement)  
**Color Theme**: Blue (#3B82F6), Cyan (#06B6D4)

---

### 5. Weight Tracking (8 achievements)

**Purpose**: Weight logging and progress (requires weight tracking feature - custom criteria)

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | first-weigh-in | First Weigh-In | custom: weight-log, count: 1 | 10 | common |
| 10 | weight-tracker | Weight Tracker | custom: weight-log, count: 10 | 20 | common |
| 15 | five-pound-drop | Five Pound Drop | custom: weight-loss, amount: 5, unit: 'lbs' | 35 | common |
| 20 | ten-pound-victory | Ten Pound Victory | custom: weight-loss, amount: 10, unit: 'lbs' | 50 | rare |
| 25 | twenty-five-pound-triumph | Twenty Five Pound Triumph | custom: weight-loss, amount: 25, unit: 'lbs' | 65 | rare |
| 30 | goal-weight-achieved | Goal Weight Achieved | custom: weight-goal-reached | 75 | rare |
| 35 | weight-maintenance | Weight Maintenance | custom: weight-maintain, days: 30 | 100 | epic |
| 40 | transformation-complete | Transformation Complete | custom: weight-loss, amount: 50, unit: 'lbs' | 150 | epic |

**Icon Theme**: 📉 (graph), ⚖️ (scale), 💪 (strength)  
**Color Theme**: Green (#10B981), Teal (#14B8A6)

---

### 6. Consistency & Dedication (12 achievements)

**Purpose**: Long-term engagement patterns beyond simple streaks

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | ten-entries | Ten Entries | entry-count: 10 | 10 | common |
| 10 | thirty-entries | Thirty Entries | entry-count: 30 | 20 | common |
| 15 | century-club | Century Club | entry-count: 100 | 45 | common |
| 20 | veteran-faster | Veteran Faster | entry-count: 250 | 60 | common |
| 25 | dedicated-logger | Dedicated Logger | custom: notes-weekly, weeks: 12 | 50 | common |
| 30 | morning-person | Morning Person | custom: early-start, count: 30 | 40 | rare |
| 35 | night-owl | Night Owl | custom: evening-start, count: 30 | 40 | rare |
| 40 | monthly-commitment | Monthly Commitment | custom: active-days-month, count: 20 | 55 | rare |
| 45 | seasonal-faster | Seasonal Faster | custom: active-months, count: 3 | 70 | rare |
| 50 | half-millennium | Half Millennium | entry-count: 500 | 110 | epic |
| 55 | yearly-dedication | Yearly Dedication | custom: active-year | 135 | epic |
| 60 | fasting-legend | Fasting Legend | entry-count: 1000 | 250 | legendary |

**Icon Theme**: 💯 (hundred), 📚 (journal), 🏆 (trophy)  
**Color Theme**: Pink (#EC4899), Purple (#A855F7)

---

### 7. Special Achievements (15 achievements)

**Purpose**: Unique accomplishments and rare conditions

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | personal-best | Personal Best | custom: new-duration-record | 20 | common |
| 10 | wellness-warrior | Wellness Warrior | custom: positive-notes, count: 30 | 25 | common |
| 15 | hydration-master | Hydration Master | custom: water-logging, count: 50 | 30 | common |
| 20 | social-faster | Social Faster | custom: holiday-fast | 35 | common |
| 25 | sunrise-starter | Sunrise Starter | custom: start-5am, count: 10 | 40 | common |
| 30 | midnight-finisher | Midnight Finisher | custom: end-midnight, count: 10 | 40 | common |
| 35 | zen-master | Zen Master | custom: meditation-notes, count: 20 | 45 | rare |
| 40 | iron-will | Iron Will | custom: declined-food | 55 | rare |
| 45 | weekend-warrior | Weekend Warrior | custom: weekend-fasts, count: 20 | 50 | rare |
| 50 | explorer | Explorer | custom: multiple-protocols | 60 | rare |
| 55 | stage-explorer | Stage Explorer | custom: all-stages-reached | 70 | rare |
| 60 | perfect-week | Perfect Week | custom: 7-consecutive-goals | 100 | epic |
| 65 | month-master | Month Master | custom: 30-consecutive-goals | 125 | epic |
| 70 | unstoppable | Unstoppable | custom: 90-day-perfect | 140 | epic |
| 75 | immortal | Immortal | custom: 365-day-perfect | 300 | legendary |

**Icon Theme**: ⚡ (lightning), 🌟 (star), 👑 (crown)  
**Color Theme**: Gold (#F59E0B), Yellow (#FCD34D)

**Secret Achievements**: "Iron Will", "Unstoppable", "Immortal" marked as isSecret=true

---

### 8. Knowledge & Exploration (8 achievements)

**Purpose**: Biological stage exploration (requires stage tracking feature - custom criteria)

| Order | achievementId | Name (EN) | Criteria | Points | Rarity |
|-------|---------------|-----------|----------|--------|--------|
| 5 | stage-five-explorer | Stage Five Explorer | custom: reach-stage, stage: 5 | 15 | common |
| 10 | stage-six-seeker | Stage Six Seeker | custom: reach-stage, stage: 6 | 20 | common |
| 15 | stage-seven-savant | Stage Seven Savant | custom: reach-stage, stage: 7 | 25 | common |
| 20 | autophagy-activated | Autophagy Activated | custom: reach-stage, stage: 8 | 35 | common |
| 25 | ketosis-king | Ketosis King | custom: ketosis-achieved, count: 10 | 50 | rare |
| 30 | stage-nine-master | Stage Nine Master | custom: reach-stage, stage: 9 | 60 | rare |
| 35 | stage-ten-legend | Stage Ten Legend | custom: reach-stage, stage: 10 | 100 | epic |
| 40 | biological-scholar | Biological Scholar | custom: all-stages, count: 10 | 130 | epic |

**Icon Theme**: 🧬 (DNA), 🔬 (science), 🧠 (brain)  
**Color Theme**: Teal (#14B8A6), Emerald (#10B981)

---

## Implementation Notes

### Seed Script Integration

**Existing Script**: `scripts/seed-achievements.js`

**Modification Approach**:
1. Expand `achievements` array from 6 to 81 objects
2. Change deletion pattern to upsert pattern for idempotency
3. Add progress logging for long-running operation

**Idempotency Pattern**:
```javascript
for (const achievement of achievements) {
  await Achievement.updateOne(
    { achievementId: achievement.achievementId },
    { ...achievement, createdBy: admin._id },
    { upsert: true }
  );
}
```

### Translation Requirements

All 81 achievements require professional Spanish translations:
- **name**: Title (3-6 words)
- **description**: Full explanation (10-20 words)
- **shortDescription**: Compact version (2-4 words)

**Translation Glossary** provided in `research.md`.

### Testing Validation

Each achievement must pass:
1. **Schema Validation**: All required fields present
2. **Translation Completeness**: Both en and es translations exist
3. **Criteria Validity**: Type matches evaluator expectations or uses 'custom'
4. **Point Scaling**: Points within rarity tier ranges
5. **Display Order**: Sequential within category with gaps for insertions

---

**Last Updated**: November 5, 2025  
**Next Phase**: Implementation (80-85 achievement definitions)
