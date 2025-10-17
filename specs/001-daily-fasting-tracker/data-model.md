# Data Model Specification

**Feature**: Daily Fasting Tracker  
**Date**: October 17, 2025  
**Database**: MongoDB with Mongoose ODM

## Overview

This document defines the MongoDB collections, schemas, indexes, and data relationships for the fasting tracker feature.

---

## Collections

### 1. `entries` Collection

**Purpose**: Store daily fasting log entries with meal times, health metrics, and food notes.

**Schema Definition**:

```javascript
// src/lib/models/Entry.js
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        // Date must not be in the future
        return v <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },
  
  firstMealTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,  // HH:mm format (24-hour)
    validate: {
      validator: function(v) {
        // firstMealTime must be after lastMealTime on same day
        if (this.lastMealTime) {
          const [fh, fm] = v.split(':').map(Number);
          const [lh, lm] = this.lastMealTime.split(':').map(Number);
          return (fh * 60 + fm) > (lh * 60 + lm);
        }
        return true;
      },
      message: 'First meal time must be after last meal time'
    }
  },
  
  lastMealTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/   // HH:mm format (24-hour)
  },
  
  fastingDuration: {
    type: Number,  // Duration in minutes
    default: null,
    min: 0,
    max: 2880  // Max 48 hours (2 days)
  },
  
  sleepHours: {
    type: Number,
    default: null,
    min: 0,
    max: 24,
    validate: {
      validator: function(v) {
        return v === null || (v >= 0 && v <= 24);
      },
      message: 'Sleep hours must be between 0 and 24'
    }
  },
  
  weight: {
    type: Number,  // Always stored in kilograms
    default: null,
    min: 20,       // Minimum reasonable weight (20 kg = 44 lbs)
    max: 500,      // Maximum reasonable weight (500 kg = 1102 lbs)
    validate: {
      validator: function(v) {
        return v === null || (v >= 20 && v <= 500);
      },
      message: 'Weight must be between 20 and 500 kg'
    }
  },
  
  hungerLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: null
  },
  
  energyLevel: {
    type: String,
    enum: ['Low Energy', 'Medium Energy', 'High Energy'],
    default: null
  },
  
  wellBeing: {
    type: String,
    enum: ['Poor', 'Fair', 'Good'],
    default: null
  },
  
  foodNotes: {
    type: String,
    default: null,
    maxlength: 1000,  // Reasonable limit for food descriptions
    trim: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Indexes
entrySchema.index({ date: -1 });  // For reverse chronological queries

// Virtual for formatted fasting duration
entrySchema.virtual('fastingDurationFormatted').get(function() {
  if (this.fastingDuration === null) return 'N/A';
  const hours = Math.floor(this.fastingDuration / 60);
  const minutes = this.fastingDuration % 60;
  return `${hours}h ${minutes}m`;
});

// Ensure virtuals are included when converting to JSON
entrySchema.set('toJSON', { virtuals: true });
entrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Entry || mongoose.model('Entry', entrySchema);
```

**Field Descriptions**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `date` | Date | Yes | The calendar date for this entry | Unique, cannot be future date, indexed |
| `firstMealTime` | String | Yes | Time of first meal in HH:mm (24h) | Must be after lastMealTime on same day |
| `lastMealTime` | String | Yes | Time of last meal in HH:mm (24h) | Valid time format |
| `fastingDuration` | Number | No | Calculated fasting time in minutes | 0-2880 (max 48 hours) |
| `sleepHours` | Number | No | Hours of sleep | 0-24 |
| `weight` | Number | No | Morning weight in kilograms | 20-500 kg |
| `hungerLevel` | String | No | Subjective hunger rating | Enum: Low, Medium, High |
| `energyLevel` | String | No | Subjective energy rating | Enum: Low Energy, Medium Energy, High Energy |
| `wellBeing` | String | No | Overall well-being rating | Enum: Poor, Fair, Good |
| `foodNotes` | String | No | Free-text food intake notes | Max 1000 characters |
| `createdAt` | Date | Auto | Entry creation timestamp | Automatic |
| `updatedAt` | Date | Auto | Last modification timestamp | Automatic |

**Indexes**:
- Primary: `date` (unique, ascending)
- Query: `date` (descending for reverse chronological listing)

---

### 2. `user_settings` Collection

**Purpose**: Store user preferences for measurement system and time format display.

**Schema Definition**:

```javascript
// src/lib/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default',  // Hardcoded for MVP (single-user)
    unique: true,
    index: true
  },
  
  measurementSystem: {
    type: String,
    enum: ['metric', 'imperial'],
    default: 'metric',
    required: true
  },
  
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '24h',
    required: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Indexes
settingsSchema.index({ userId: 1 });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
```

**Field Descriptions**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `userId` | String | Yes | User identifier (default: 'default') | Unique, indexed |
| `measurementSystem` | String | Yes | Weight unit preference | Enum: metric, imperial |
| `timeFormat` | String | Yes | Time display preference | Enum: 12h, 24h |
| `createdAt` | Date | Auto | Settings creation timestamp | Automatic |
| `updatedAt` | Date | Auto | Last modification timestamp | Automatic |

**Indexes**:
- Primary: `userId` (unique)

---

## Data Relationships

```
┌─────────────────┐
│  user_settings  │ (1:1 relationship, though stored separately)
│  ────────────── │
│  userId         │ → "default" for MVP
│  measurement    │
│  timeFormat     │
└─────────────────┘
         │
         │ (influences display of)
         ▼
┌─────────────────┐
│     entries     │ (0:many)
│  ────────────── │
│  date (PK)      │ ← Unique index
│  firstMealTime  │
│  lastMealTime   │
│  fastingDuration│ ← Calculated from adjacent entries
│  weight         │ ← Displayed per measurementSystem preference
│  ...metrics     │
└─────────────────┘
         │
         │ (adjacent entries linked by)
         ▼
    Date sequence
    (Entry[D].lastMealTime → Entry[D+1].firstMealTime)
```

**Notes**:
- No explicit foreign keys (MongoDB doesn't enforce them)
- `fastingDuration` is calculated using previous day's `lastMealTime` and current day's `firstMealTime`
- Settings influence display but not storage (weight always in kg, times always 24h in DB)

---

## Calculated Fields

### Fasting Duration Calculation

**Logic**:
```javascript
// src/lib/utils/fastingCalculator.js

/**
 * Calculate fasting duration between two meal times
 * @param {string} previousDayLastMeal - HH:mm format
 * @param {Date} previousDate - Date object for previous day
 * @param {string} currentDayFirstMeal - HH:mm format
 * @param {Date} currentDate - Date object for current day
 * @returns {number|null} Duration in minutes, or null if cannot calculate
 */
export function calculateFastingDuration(
  previousDayLastMeal,
  previousDate,
  currentDayFirstMeal,
  currentDate
) {
  if (!previousDayLastMeal || !currentDayFirstMeal) {
    return null;
  }
  
  // Parse times
  const [prevHour, prevMin] = previousDayLastMeal.split(':').map(Number);
  const [currHour, currMin] = currentDayFirstMeal.split(':').map(Number);
  
  // Create Date objects with actual dates and times
  const lastMealDateTime = new Date(previousDate);
  lastMealDateTime.setHours(prevHour, prevMin, 0, 0);
  
  const firstMealDateTime = new Date(currentDate);
  firstMealDateTime.setHours(currHour, currMin, 0, 0);
  
  // Calculate difference in minutes
  const diffMs = firstMealDateTime - lastMealDateTime;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Validate reasonable range (0-48 hours)
  if (diffMinutes < 0 || diffMinutes > 2880) {
    return null;
  }
  
  return diffMinutes;
}
```

**Trigger**: Calculate on:
1. Entry creation (if previous day exists)
2. Entry update (recalculate for this entry and next day's entry)
3. Entry deletion (recalculate next day's entry)

---

## Data Migrations

### Initial Setup

```javascript
// Migration: Create indexes
db.entries.createIndex({ date: -1 }, { unique: true });
db.user_settings.createIndex({ userId: 1 }, { unique: true });

// Migration: Seed default settings
db.user_settings.insertOne({
  userId: 'default',
  measurementSystem: 'metric',
  timeFormat: '24h',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Future Migrations

**When adding authentication** (out of scope for MVP):
- Add `userId` field to `entries` collection
- Migrate existing entries to userId: 'default'
- Update settings to support multiple users

---

## Query Patterns

### Common Queries

**1. Get all entries (reverse chronological)**:
```javascript
await Entry.find().sort({ date: -1 }).limit(30);
```

**2. Get entry by date**:
```javascript
await Entry.findOne({ date: new Date('2025-10-17') });
```

**3. Get previous day's entry** (for fasting calculation):
```javascript
const previousDay = new Date(currentDate);
previousDay.setDate(previousDay.getDate() - 1);
await Entry.findOne({ date: previousDay });
```

**4. Get user settings**:
```javascript
await Settings.findOne({ userId: 'default' });
```

**5. Update entry and recalculate fasting**:
```javascript
// Update current entry
await Entry.findOneAndUpdate({ date }, updateData, { new: true });

// Recalculate next day's fasting duration
const nextDay = new Date(date);
nextDay.setDate(nextDay.getDate() + 1);
const nextEntry = await Entry.findOne({ date: nextDay });
if (nextEntry) {
  const updatedFasting = calculateFastingDuration(/* ... */);
  await Entry.findOneAndUpdate(
    { date: nextDay },
    { fastingDuration: updatedFasting }
  );
}
```

---

## Data Validation Summary

| Level | Tool | Purpose |
|-------|------|---------|
| Schema | Mongoose | Type validation, required fields, enums |
| Application | Custom validators | Business logic (e.g., firstMeal > lastMeal) |
| API | Joi schemas | Request validation before database operations |
| Client | React Hook Form | User-friendly validation feedback |

---

## Performance Considerations

- **Index on date field**: Optimizes reverse chronological queries
- **Limit query results**: Default to last 30 days, pagination for more
- **Caching**: Consider caching settings (rarely change)
- **Batch operations**: When recalculating multiple entries (e.g., after edit)

---

## Security Considerations

- **No PII storage**: MVP doesn't collect personally identifiable information
- **Data encryption**: MongoDB should use encryption at rest (production)
- **Input sanitization**: All inputs validated and sanitized before storage
- **Query injection prevention**: Mongoose parameterized queries prevent NoSQL injection

---

## Testing Data

**Sample Entry**:
```json
{
  "date": "2025-10-17T00:00:00.000Z",
  "firstMealTime": "12:00",
  "lastMealTime": "20:00",
  "fastingDuration": 960,
  "sleepHours": 7.5,
  "weight": 75.5,
  "hungerLevel": "Medium",
  "energyLevel": "High Energy",
  "wellBeing": "Good",
  "foodNotes": "Oatmeal for breakfast, salad and grilled chicken for lunch, pasta for dinner"
}
```

**Sample Settings**:
```json
{
  "userId": "default",
  "measurementSystem": "metric",
  "timeFormat": "24h"
}
```
