# API Contracts: Test Database Separation

**Feature**: Test Database Separation  
**Date**: October 22, 2025

## Overview

This feature is **infrastructure-only** and does not expose any new public APIs or HTTP endpoints. All interactions are through internal JavaScript module exports used by test code. This document describes the internal contracts for test database utilities.

---

## Internal Module Contracts

### Module: `src/lib/db.js`

Enhanced database connection utility with environment-aware URI selection.

#### Function: `connectDB()`

**Description**: Connects to MongoDB using environment-appropriate database URI

**Signature**:
```javascript
/**
 * Connect to MongoDB database
 * Uses connection pooling and caching for optimal performance
 * Selects database URI based on NODE_ENV environment variable
 * 
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If MONGODB_URI (or MONGODB_TEST_URI for tests) is not defined
 * @throws {Error} If test database name doesn't include 'test' keyword
 * @throws {Error} If connection fails
 */
export async function connectDB(): Promise<Mongoose>
```

**Behavior**:
- **When `NODE_ENV=test`**:
  - Reads `MONGODB_TEST_URI` environment variable
  - Validates database name includes 'test' (case-insensitive)
  - Throws error if validation fails
  - Logs: `"✓ Test database connected: {dbName}"`
  
- **When `NODE_ENV=development` or `production`**:
  - Reads `MONGODB_URI` environment variable
  - No database name validation
  - Logs: `"✓ MongoDB connected successfully"`
  
- **When URI missing**:
  - Throws error with message including required variable name and example

**Error Cases**:
```javascript
// Missing test URI
Error: MONGODB_TEST_URI environment variable is required when running tests.
Add to .env.local:
MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test

// Invalid test database name
Error: Test database name must include 'test' for safety.
Current: fasting-tracker-production
Example: fasting-tracker-test

// Connection failure
Error: ✗ MongoDB connection error: {error details}
```

**Returns**: 
- Cached Mongoose instance if already connected
- New Mongoose instance on first connection

**Side Effects**:
- Establishes database connection
- Caches connection globally
- Registers connection event handlers

---

#### Function: `disconnectDB()`

**Description**: Disconnects from MongoDB and clears cached connection

**Signature**:
```javascript
/**
 * Disconnect from MongoDB database
 * Useful for cleanup in tests or graceful shutdown
 * 
 * @returns {Promise<void>}
 */
export async function disconnectDB(): Promise<void>
```

**Behavior**:
- Checks if connection exists (`readyState !== 0`)
- Disconnects if connected
- Clears global connection cache
- Logs: `"✓ MongoDB disconnected"`
- Safe to call multiple times (no-op if already disconnected)

**Side Effects**:
- Closes database connection
- Clears cached connection
- Removes event listeners

---

#### Function: `isConnected()`

**Description**: Checks current database connection status

**Signature**:
```javascript
/**
 * Check if MongoDB is currently connected
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected(): boolean
```

**Behavior**:
- Returns `true` if `mongoose.connection.readyState === 1`
- Returns `false` otherwise
- No side effects (read-only)

---

#### Function: `getConnectionState()`

**Description**: Returns human-readable connection state

**Signature**:
```javascript
/**
 * Get connection state as human-readable string
 * 
 * @returns {string} Connection state description
 */
export function getConnectionState(): string
```

**Returns**: One of:
- `'disconnected'` (readyState 0)
- `'connected'` (readyState 1)
- `'connecting'` (readyState 2)
- `'disconnecting'` (readyState 3)
- `'unknown'` (unexpected state)

---

### Module: `src/lib/test-utils/db-test-helper.js` (NEW)

Shared utilities for integration test database management.

#### Function: `setupTestDatabase()`

**Description**: Initializes test database connection and performs initial cleanup

**Signature**:
```javascript
/**
 * Setup test database connection for integration tests
 * Should be called in beforeAll() hook
 * 
 * @returns {Promise<void>}
 * @throws {Error} If MONGODB_TEST_URI is not configured
 * @throws {Error} If database name doesn't include 'test'
 */
export async function setupTestDatabase(): Promise<void>
```

**Behavior**:
1. Calls `connectDB()` to establish connection
2. Logs database name to console
3. Performs initial collection cleanup
4. Throws error if configuration invalid

**Usage Example**:
```javascript
import { setupTestDatabase } from '@/lib/test-utils/db-test-helper';

beforeAll(async () => {
  await setupTestDatabase();
});
```

---

#### Function: `cleanTestDatabase()`

**Description**: Removes all data from all collections in test database

**Signature**:
```javascript
/**
 * Clean all collections in test database
 * Should be called in beforeEach() hook for test isolation
 * 
 * @returns {Promise<void>}
 */
export async function cleanTestDatabase(): Promise<void>
```

**Behavior**:
1. Gets all collections from `mongoose.connection.collections`
2. Calls `deleteMany({})` on each collection
3. Fast operation (~100-300ms for small datasets)
4. Safe to call multiple times

**Usage Example**:
```javascript
import { cleanTestDatabase } from '@/lib/test-utils/db-test-helper';

beforeEach(async () => {
  await cleanTestDatabase();
});
```

---

#### Function: `teardownTestDatabase()`

**Description**: Disconnects from test database and performs cleanup

**Signature**:
```javascript
/**
 * Teardown test database connection
 * Should be called in afterAll() hook
 * 
 * @returns {Promise<void>}
 */
export async function teardownTestDatabase(): Promise<void>
```

**Behavior**:
1. Calls `disconnectDB()` to close connection
2. Clears cached connection state
3. Safe to call multiple times

**Usage Example**:
```javascript
import { teardownTestDatabase } from '@/lib/test-utils/db-test-helper';

afterAll(async () => {
  await teardownTestDatabase();
});
```

---

## Environment Variable Contract

### Required Variables

| Variable | Required When | Format | Example | Validation |
|----------|---------------|--------|---------|------------|
| `NODE_ENV` | Always | String enum | `'test'`, `'development'`, `'production'` | Must be one of valid values |
| `MONGODB_URI` | NODE_ENV ≠ test | MongoDB URI | `mongodb://localhost:27017/fasting-tracker` | Valid MongoDB URI format |
| `MONGODB_TEST_URI` | NODE_ENV = test | MongoDB URI | `mongodb://localhost:27017/fasting-tracker-test` | Valid MongoDB URI, DB name includes 'test' |

### Validation Rules

1. **Test Database Name Validation**:
   ```javascript
   const isValidTestDbName = (uri) => {
     const dbName = extractDatabaseName(uri);
     return dbName.toLowerCase().includes('test');
   };
   ```

2. **URI Format Validation**:
   - Must start with `mongodb://` or `mongodb+srv://`
   - Must include database name
   - Must be parseable as URL

---

## Jest Configuration Contract

### Required Setup Files

#### `jest.env.setup.js`

**Purpose**: Set environment variables before any tests run

**Contract**:
```javascript
// MUST set NODE_ENV to 'test' if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// MUST load .env.local before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
```

**Execution Order**: Runs FIRST (via `setupFiles` in jest.config.js)

---

#### `jest.setup.js`

**Purpose**: Setup test environment after environment variables loaded

**Contract**:
```javascript
// Can import modules that depend on environment variables
// Test database utilities available here
```

**Execution Order**: Runs SECOND (via `setupFilesAfterEnv` in jest.config.js)

---

### Test File Contract

Integration test files MUST include:

```javascript
/**
 * @jest-environment node
 */

import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } 
  from '@/lib/test-utils/db-test-helper';

describe('My Integration Test Suite', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  // Tests here...
});
```

---

## Error Contract

All configuration and connection errors MUST:

1. **Fail fast**: Throw immediately before any database operations
2. **Be descriptive**: Include what's wrong and how to fix it
3. **Include examples**: Show correct configuration format
4. **Be actionable**: Tell developer exactly what to do

### Error Message Format

```javascript
throw new Error(
  `{What went wrong}\n` +
  `{Current state/value}\n` +
  `{How to fix it}\n` +
  `{Example of correct configuration}`
);
```

---

## Backward Compatibility Contract

### Unit Tests (NO CHANGES)

**Contract**: Unit tests continue working exactly as before

```javascript
// Unit test pattern (unchanged)
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri); // Direct connection, bypasses connectDB()
});
```

**Guarantee**: Unit tests never call `connectDB()` from `src/lib/db.js`, so environment-aware logic doesn't affect them.

---

## Performance Contract

### Connection Time
- **First connection**: <5 seconds (includes network round-trip)
- **Cached connection**: <1ms (returns existing instance)

### Cleanup Time
- **Per-test cleanup**: <500ms for typical test data volume
- **Full teardown**: <1 second

### Overall Impact
- **Test suite overhead**: <5 seconds total additional time
- **Per-test overhead**: <500ms per test for cleanup

---

## Console Output Contract

### Successful Connection
```
✓ Test database connected: fasting-tracker-test
```

### Configuration Error
```
Error: MONGODB_TEST_URI environment variable is required when running tests.
Add to .env.local:
MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test
```

### Validation Error
```
Error: Test database name must include 'test' for safety.
Current: fasting-tracker-production
Example: fasting-tracker-test
```

### Disconnection
```
✓ MongoDB disconnected
```

---

## Summary

This feature provides:

1. **Internal module exports** for environment-aware database connections
2. **Test utility functions** for setup/cleanup lifecycle
3. **Clear error contracts** for configuration issues
4. **Performance guarantees** for test execution
5. **Backward compatibility** with existing unit tests

No public HTTP APIs are exposed. All contracts are for internal use by the test infrastructure.
