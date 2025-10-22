# Quickstart Guide: Test Database Separation

**Estimated Implementation Time**: 3-4 hours  
**Difficulty**: Moderate  
**Prerequisites**: Understanding of MongoDB, Jest, environment variables

---

## 🎯 Goal

Separate test database from production/development databases to prevent data loss during integration test runs. Tests will automatically use a dedicated test database, ensuring production data safety.

---

## 📋 Prerequisites

Before starting implementation, ensure:

- ✅ Node.js 18+ installed
- ✅ MongoDB access (local instance or MongoDB Atlas account)
- ✅ Existing integration tests passing with current setup
- ✅ Familiarity with Jest testing framework
- ✅ Understanding of environment variables in Node.js
- ✅ Branch `008-test-database-separation` checked out

---

## 🚀 Quick Setup (For Testing This Feature)

### 1. Create Test Database

**Option A: MongoDB Atlas (Recommended)**

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your existing cluster
3. **Database name convention**: Add `-test` suffix to your development database
   - Example: If dev DB is `fasting-tracker`, use `fasting-tracker-test`
4. Copy connection string and update database name

**Option B: Local MongoDB**

```bash
# No setup needed - MongoDB supports multiple databases on same instance
# Simply use a different database name with '-test' suffix
```

### 2. Configure Environment Variables

Update `.env.local`:

```bash
# Existing production/development database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fasting-tracker?retryWrites=true&w=majority

# NEW: Test database (must include 'test' in name)
MONGODB_TEST_URI=mongodb+srv://user:pass@cluster.mongodb.net/fasting-tracker-test?retryWrites=true&w=majority
```

**Important**: 
- Test database name MUST include `test` keyword
- Both databases can be on the same MongoDB instance/cluster
- Keep credentials secret (never commit `.env.local`)

### 3. Verify Configuration

```bash
# Run this to verify your test database is accessible
node -e "console.log('MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET')"
```

---

## 📐 Implementation Phases

### Phase 1: Update Database Connection Utility (1 hour)

**File**: `src/lib/db.js`

**Goal**: Add environment-aware database URI selection

**Changes**:

1. **Add URI selection function**:
   ```javascript
   /**
    * Get appropriate MongoDB URI based on environment
    */
   function getMongoURI() {
     const env = process.env.NODE_ENV;
     
     if (env === 'test') {
       const uri = process.env.MONGODB_TEST_URI;
       if (!uri) {
         throw new Error(
           'MONGODB_TEST_URI environment variable is required when running tests.\n' +
           'Add to .env.local:\n' +
           'MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test'
         );
       }
       return uri;
     }
     
     return process.env.MONGODB_URI;
   }
   ```

2. **Add test database validation**:
   ```javascript
   /**
    * Validate test database name includes 'test'
    */
   function validateTestDatabase(uri) {
     const url = new URL(uri);
     const dbName = url.pathname.slice(1).split('?')[0];
     
     if (!dbName.toLowerCase().includes('test')) {
       throw new Error(
         `Test database name must include 'test' for safety.\n` +
         `Current: ${dbName}\n` +
         `Example: fasting-tracker-test`
       );
     }
     
     return dbName;
   }
   ```

3. **Update `connectDB()` function**:
   ```javascript
   export async function connectDB() {
     const uri = getMongoURI();
     
     // Validate test database name
     if (process.env.NODE_ENV === 'test') {
       const dbName = validateTestDatabase(uri);
       console.log(`✓ Test database selected: ${dbName}`);
     }
     
     // ... rest of existing connection logic
   }
   ```

**Testing**:
```bash
# Test environment detection
NODE_ENV=test npm test -- tests/unit/lib/db.test.js
```

---

### Phase 2: Create Test Database Utilities (30 mins)

**File**: `src/lib/test-utils/db-test-helper.js` (NEW)

**Goal**: Shared utilities for test database setup/cleanup

**Implementation**:

```javascript
/**
 * Test Database Utilities
 * Shared setup/teardown for integration tests
 */

import { connectDB, disconnectDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * Setup test database connection
 * Call in beforeAll() hook
 */
export async function setupTestDatabase() {
  await connectDB();
  
  // Initial cleanup
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  console.log('✓ Test database initialized');
}

/**
 * Clean all collections in test database
 * Call in beforeEach() hook for test isolation
 */
export async function cleanTestDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Teardown test database connection
 * Call in afterAll() hook
 */
export async function teardownTestDatabase() {
  await disconnectDB();
  console.log('✓ Test database disconnected');
}
```

**Testing**:
```javascript
// Add to tests/unit/lib/test-utils/db-test-helper.test.js
describe('Test Database Utilities', () => {
  test('setupTestDatabase connects and cleans', async () => {
    await setupTestDatabase();
    expect(mongoose.connection.readyState).toBe(1);
  });
});
```

---

### Phase 3: Update Environment Configuration (15 mins)

**Files**: 
- `jest.env.setup.js`
- `.env.example`

**Changes**:

1. **Update `jest.env.setup.js`**:
   ```javascript
   // Load environment variables BEFORE anything else
   import { config } from 'dotenv';
   import { resolve } from 'path';
   
   config({ path: resolve(process.cwd(), '.env.local') });
   
   // Set NODE_ENV for tests
   process.env.NODE_ENV = process.env.NODE_ENV || 'test';
   
   console.log('✓ Environment variables loaded for tests');
   console.log('✓ NODE_ENV:', process.env.NODE_ENV);
   console.log('✓ MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET');
   ```

2. **Update `.env.example`**:
   ```bash
   # MongoDB Connection String (Production/Development)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasting-tracker?retryWrites=true&w=majority
   
   # MongoDB Test Database (REQUIRED for running integration tests)
   # Database name MUST include 'test' for safety
   MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/fasting-tracker-test?retryWrites=true&w=majority
   
   # Node Environment
   NODE_ENV=development
   ```

---

### Phase 4: Update Integration Tests (1-1.5 hours)

**Goal**: Update all integration test files to use test database utilities

**Pattern** (apply to all integration test files):

```javascript
/**
 * Integration Test: [Feature Name]
 * @jest-environment node
 */

// Load test utilities
import { 
  setupTestDatabase, 
  cleanTestDatabase, 
  teardownTestDatabase 
} from '@/lib/test-utils/db-test-helper';

describe('[Feature] Integration Tests', () => {
  // Setup test database before all tests
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // Clean database before each test for isolation
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  // Teardown after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  // Your existing tests...
});
```

**Files to Update** (15+ files):
```
tests/integration/
├── auth.test.js
├── entries.test.js
├── settings.test.js
├── admin-access-denied.test.js
├── admin-privilege-management.test.js
├── password-reset.test.js
├── protected-routes.test.js
├── session-expiration.test.js
├── user-model-terms.test.js
└── [other integration test files]
```

**Automation Script** (optional helper):

```bash
# Create update-integration-tests.js
node scripts/update-integration-tests.js
```

---

### Phase 5: Verify Implementation (30 mins)

**Verification Checklist**:

1. **✅ Unit tests still pass** (should not be affected):
   ```bash
   npm test -- tests/unit/
   ```

2. **✅ Integration tests use test database**:
   ```bash
   npm test -- tests/integration/
   ```

3. **✅ Production database unchanged**:
   ```bash
   # Inspect production database - no test data should exist
   node scripts/inspect-db.js
   ```

4. **✅ Error handling works**:
   ```bash
   # Remove MONGODB_TEST_URI temporarily
   unset MONGODB_TEST_URI
   npm test -- tests/integration/auth.test.js
   # Should fail with clear error message
   ```

5. **✅ Test database name validated**:
   ```bash
   # Set invalid test database name
   export MONGODB_TEST_URI="mongodb://localhost:27017/production"
   npm test
   # Should fail with validation error
   ```

6. **✅ Console output clear**:
   - Should see: `"✓ Test database connected: fasting-tracker-test"`
   - Should NOT see production database name

---

## 🔍 Verification & Testing

### Manual Verification Steps

1. **Before running tests**:
   ```bash
   # Check production database document count
   mongosh "your-connection-string" --eval "db.users.countDocuments()"
   # Record the count
   ```

2. **Run integration tests**:
   ```bash
   npm test -- tests/integration/
   ```

3. **After tests complete**:
   ```bash
   # Check production database again
   mongosh "your-connection-string" --eval "db.users.countDocuments()"
   # Count should be UNCHANGED
   ```

4. **Check test database**:
   ```bash
   # Test database should be empty after tests
   mongosh "your-test-connection-string" --eval "db.users.countDocuments()"
   # Should return 0 or small number (cleanup completed)
   ```

### Automated Verification

```javascript
// tests/integration/test-database-separation.test.js (NEW)
describe('Test Database Separation Verification', () => {
  test('uses test database when NODE_ENV=test', async () => {
    expect(process.env.NODE_ENV).toBe('test');
    
    const uri = getMongoURI();
    expect(uri).toBe(process.env.MONGODB_TEST_URI);
    expect(uri).toContain('test');
  });

  test('production database untouched by tests', async () => {
    // Create test data
    await User.create({ email: 'test@example.com' });
    
    // Verify it's in test database
    const testUser = await User.findOne({ email: 'test@example.com' });
    expect(testUser).toBeTruthy();
    
    // Production database should not have this data
    // (Manual verification recommended)
  });
});
```

---

## 🚨 Troubleshooting

### Issue: Tests fail with "MONGODB_TEST_URI not set"

**Solution**:
```bash
# Verify .env.local exists and has MONGODB_TEST_URI
cat .env.local | grep MONGODB_TEST_URI

# If missing, add it:
echo "MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test" >> .env.local
```

### Issue: "Test database name must include 'test'"

**Solution**:
```bash
# Update your MONGODB_TEST_URI to include 'test' in database name
# Change: fasting-tracker-prod
# To: fasting-tracker-test
```

### Issue: Tests are slow after implementation

**Check**:
- Database connection time (should be <5 seconds)
- Cleanup time per test (should be <500ms)
- Network latency if using Atlas (local MongoDB is faster)

**Solution**:
```javascript
// Reduce cleanup overhead - only clean used collections
export async function cleanTestDatabase(collectionsToClean = []) {
  if (collectionsToClean.length === 0) {
    // Clean all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } else {
    // Clean specific collections only
    for (const name of collectionsToClean) {
      await mongoose.connection.collection(name).deleteMany({});
    }
  }
}
```

### Issue: Unit tests affected by changes

**Check**:
- Unit tests should NOT import `connectDB` from `@/lib/db`
- Unit tests should use MongoDB Memory Server
- Unit tests should not depend on environment variables

**Verification**:
```bash
# Unit tests should still pass
npm test -- tests/unit/
```

---

## 📝 Post-Implementation Checklist

- [ ] All integration tests passing with test database
- [ ] Unit tests still passing (unchanged)
- [ ] Production database verified empty of test data
- [ ] `.env.example` updated with `MONGODB_TEST_URI`
- [ ] README updated with test database setup instructions
- [ ] CI/CD pipeline updated with test database secrets
- [ ] Team notified of required local `.env.local` changes
- [ ] Documentation updated (if applicable)

---

## 🔄 CI/CD Setup

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      NODE_ENV: test
      MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test
```

**Required Secret**: Add `MONGODB_TEST_URI` to GitHub repository secrets

### Vercel

**Environment Variables**:
1. Go to Project Settings → Environment Variables
2. Add `MONGODB_TEST_URI` for:
   - Development environment
   - Preview environment
   - Production environment (optional - depends on if you run tests in prod builds)

---

## ⏱️ Implementation Timeline

| Phase | Task | Duration | Cumulative |
|-------|------|----------|------------|
| 1 | Update `db.js` with environment selection | 1 hour | 1 hour |
| 2 | Create test database utilities | 30 mins | 1.5 hours |
| 3 | Update environment configuration | 15 mins | 1.75 hours |
| 4 | Update all integration test files | 1-1.5 hours | 3-3.25 hours |
| 5 | Verification and testing | 30 mins | 3.5-3.75 hours |

**Total**: 3.5-4 hours

---

## 📚 Additional Resources

- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Jest Environment Configuration](https://jestjs.io/docs/configuration#testenvironment-string)
- [Mongoose Connection Best Practices](https://mongoosejs.com/docs/connections.html)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)

---

## 🎓 Next Steps

After implementation:

1. **Run full test suite** to ensure everything works
2. **Update team documentation** with setup instructions
3. **Configure CI/CD pipelines** with test database secrets
4. **Monitor test execution time** to ensure performance targets met
5. **Consider future enhancements** (per-developer test databases, Docker setup, etc.)

---

**Questions or Issues?** Check the troubleshooting section or review the full specification in `spec.md`.
