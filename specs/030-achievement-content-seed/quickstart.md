# Quick Start Guide: Achievement Content Seed Data

**Feature**: 030-achievement-content-seed  
**Date**: November 5, 2025

This guide provides setup instructions for developing and testing the achievement content seed script.

---

## Prerequisites

### Required Software
- Node.js (v18+ recommended)
- MongoDB (local instance or Atlas connection)
- Git

### Required Environment Variables
```bash
# .env.local (create if missing)
MONGODB_URI=mongodb://localhost:27017/fasting-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fasting-tracker
```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database Connection

Copy example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set `MONGODB_URI` to your MongoDB connection string.

### 3. Verify Database Connection

```bash
node -e "require('dotenv').config({ path: '.env.local' }); require('./src/lib/db.js').connectDB().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e));"
```

Expected output: `✅ Connected`

---

## Running the Seed Script

### Execute Seed Script

```bash
node scripts/seed-achievements.js
```

### Expected Output

```
Connecting to database...
Finding or creating system admin...
✓ Using existing system admin user
Seeding achievements...
  ✅ Upserted: first-steps
  ✅ Upserted: sweet-sixteen
  ✅ Upserted: week-warrior
  ... (80-85 achievements)
✅ Successfully seeded 81 achievements

Seeded achievements by category:
  - getting-started: 8 achievements
  - duration: 12 achievements
  - streak: 10 achievements
  - goal: 8 achievements
  - weight: 8 achievements
  - consistency: 12 achievements
  - special: 15 achievements
  - knowledge: 8 achievements
```

### Execution Time
- Expected: 10-20 seconds for 81 achievements
- Target: <30 seconds (per NFR-001)

---

## Verifying Seeded Data

### Option 1: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your `MONGODB_URI`
3. Navigate to database → `achievements` collection
4. Verify count: 80-85 documents

### Option 2: MongoDB Shell

```bash
mongosh "$MONGODB_URI"
```

```javascript
// Count total achievements
db.achievements.countDocuments()
// Expected: 80-85

// Count by category
db.achievements.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Sample achievement
db.achievements.findOne({ achievementId: "sweet-sixteen" })
```

### Option 3: Node.js Query

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const Achievement = require('./src/lib/models/Achievement.js').default;
const { connectDB } = require('./src/lib/db.js');
connectDB().then(async () => {
  const count = await Achievement.countDocuments();
  console.log('Total achievements:', count);
  const sample = await Achievement.findOne({ achievementId: 'sweet-sixteen' });
  console.log('Sample:', sample.translations.en.name);
  process.exit(0);
});
"
```

---

## Testing

### Run Unit Tests

```bash
# Test seed script logic
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js

# Watch mode
npm run test:watch -- tests/unit/scripts/seed-achievements.test.js
```

### Run Integration Tests

```bash
# Test database operations
npm run test:integration -- tests/integration/scripts/seed-achievements.integration.test.js
```

### Run All Tests

```bash
npm run test
```

### Expected Test Results

```
PASS  tests/unit/scripts/seed-achievements.test.js
  ✓ Should have 80-85 achievements
  ✓ All achievements have English translations
  ✓ All achievements have Spanish translations
  ✓ Rarity distribution is balanced
  ✓ Points scale correctly by rarity
  ✓ Category distribution is valid
  ✓ Criteria types are valid
  ✓ All achievements have icons and colors
  ✓ Secret achievements are marked correctly
  ✓ Display order is sequential within categories

PASS  tests/integration/scripts/seed-achievements.integration.test.js
  ✓ Successfully seeds 80-85 achievements
  ✓ Idempotent re-run does not create duplicates
  ✓ System admin user is created
  ✓ Upsert preserves manual edits
  ✓ Indexes prevent duplicate achievementIds
  ✓ Query performance uses indexes
```

---

## Development Workflow

### 1. Write Tests (TDD)

```bash
# Create test file
touch tests/unit/scripts/seed-achievements.test.js

# Write failing tests
npm run test:watch
```

### 2. Implement Achievement Definitions

Edit `scripts/seed-achievements.js`:
```javascript
const achievements = [
  {
    achievementId: 'first-steps',
    translations: {
      en: {
        name: 'First Steps',
        description: 'Log your first fasting entry',
        shortDescription: 'First entry'
      },
      es: {
        name: 'Primeros Pasos',
        description: 'Registra tu primera entrada de ayuno',
        shortDescription: 'Primera entrada'
      }
    },
    category: 'getting-started',
    points: 5,
    rarity: 'common',
    order: 5,
    criteria: { type: 'entry-count', params: { count: 1 } },
    icon: '🌱',
    iconColor: '#10B981',
    isActive: true,
    isSecret: false
  },
  // ... 80 more achievements
];
```

### 3. Run Seed Script

```bash
node scripts/seed-achievements.js
```

### 4. Verify in Database

Use MongoDB Compass or shell to verify seeded data.

### 5. Run Tests

```bash
npm run test
```

### 6. Commit Changes

```bash
git add scripts/seed-achievements.js tests/
git commit -m "feat: expand achievement catalog to 81 definitions"
```

---

## Troubleshooting

### Issue: Connection Timeout

```
Error: connect ETIMEDOUT
```

**Solution**: Check `MONGODB_URI` in `.env.local`, ensure MongoDB is running (local) or accessible (Atlas).

### Issue: Duplicate Key Error

```
E11000 duplicate key error collection: achievements index: achievementId_1
```

**Solution**: Script uses upsert pattern. If error persists, check for typos in `achievementId` values (must be unique).

### Issue: Schema Validation Error

```
ValidationError: translations.en.name: Path `translations.en.name` is required
```

**Solution**: Ensure all achievements have complete `translations.en` and `translations.es` objects with `name`, `description`, `shortDescription` fields.

### Issue: Slow Execution

```
Seed script takes >30 seconds
```

**Solution**: Check network latency to MongoDB. Consider:
- Using local MongoDB for development
- Batching upserts (use `bulkWrite` for production)
- Optimizing connection pooling

---

## Common Tasks

### Re-seed Database (Fresh Start)

```bash
# Delete all achievements (DESTRUCTIVE)
mongosh "$MONGODB_URI" --eval "db.achievements.deleteMany({})"

# Re-run seed script
node scripts/seed-achievements.js
```

### Add New Achievement

1. Edit `scripts/seed-achievements.js`
2. Add achievement object to `achievements` array
3. Run seed script: `node scripts/seed-achievements.js`
4. Verify: `mongosh "$MONGODB_URI" --eval "db.achievements.countDocuments()"`

### Update Existing Achievement

1. Edit achievement in `scripts/seed-achievements.js` (find by `achievementId`)
2. Run seed script: `node scripts/seed-achievements.js`
3. Upsert pattern will update existing record

### Check Achievement by ID

```bash
mongosh "$MONGODB_URI" --eval "db.achievements.findOne({ achievementId: 'sweet-sixteen' })"
```

### List All Achievement IDs

```bash
mongosh "$MONGODB_URI" --eval "db.achievements.find({}, { achievementId: 1, _id: 0 }).toArray()"
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Lint checks passing (`npm run lint`)
- [ ] Spanish translations professionally reviewed
- [ ] Seed script tested in staging environment
- [ ] Backup production database before seeding

### Deploy to Production

```bash
# 1. Set production environment variables
export MONGODB_URI="mongodb+srv://..."

# 2. Run seed script
node scripts/seed-achievements.js

# 3. Verify count
mongosh "$MONGODB_URI" --eval "db.achievements.countDocuments()"
# Expected: 80-85
```

### Rollback Plan

If seed script causes issues:

1. Restore from backup:
   ```bash
   mongorestore --uri="$MONGODB_URI" --drop backup/
   ```

2. Re-deploy previous version:
   ```bash
   git revert <commit-hash>
   git push origin master
   ```

---

## Resources

- **Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Achievement Model**: `src/lib/models/Achievement.js`
- **Existing Seed Script**: `scripts/seed-achievements.js`

---

**Last Updated**: November 5, 2025  
**Questions?** Check [plan.md](./plan.md) or [research.md](./research.md) for design decisions.
