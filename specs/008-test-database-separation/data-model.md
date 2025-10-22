# Data Model: Test Database Separation

**Feature**: Test Database Separation  
**Date**: October 22, 2025

## Overview

This feature is infrastructure-focused and does not introduce new data entities. Instead, it manages existing database connections and configurations to separate test data from production/development data. This document describes the configuration entities and their relationships.

## Configuration Entities

### Environment Configuration

**Purpose**: Manages database connection URIs for different runtime environments

**Attributes**:
- `NODE_ENV` (string, required): Runtime environment identifier
  - Values: `'production'`, `'development'`, `'test'`
  - Source: Environment variable or Jest configuration
  - Validation: Must be one of the three valid values
  
- `MONGODB_URI` (string, required): Production/development database connection URI
  - Format: MongoDB connection string (e.g., `mongodb://localhost:27017/fasting-tracker`)
  - Source: `.env.local` environment file
  - Usage: Used when `NODE_ENV` is `'production'` or `'development'`
  - Validation: Must be valid MongoDB URI format
  
- `MONGODB_TEST_URI` (string, required when NODE_ENV=test): Test database connection URI
  - Format: MongoDB connection string (e.g., `mongodb://localhost:27017/fasting-tracker-test`)
  - Source: `.env.local` environment file
  - Usage: Used when `NODE_ENV` is `'test'`
  - Validation: 
    - Must be valid MongoDB URI format
    - Database name must contain 'test' keyword (case-insensitive)

**Relationships**:
- Selected by `Database Connection Manager` based on `NODE_ENV`
- Validated by `Configuration Validator` before connection

**State Transitions**:
```
[Application Start] → [Read NODE_ENV] → [Select Appropriate URI]
                                           ↓
                                    [Validate URI]
                                           ↓
                                    [Connect to Database]
```

---

### Database Connection Manager

**Purpose**: Manages MongoDB connections using environment-appropriate URIs

**Attributes**:
- `cachedConnection` (Mongoose instance, nullable): Cached database connection
  - Initialized: null
  - Set on first successful connection
  - Reused for subsequent connection requests (singleton pattern)
  
- `connectionPromise` (Promise, nullable): Pending connection promise
  - Prevents duplicate connection attempts
  - Cleared on connection failure
  
- `selectedURI` (string): The database URI chosen for current environment
  - Determined by `NODE_ENV` value
  - Immutable after selection

**Relationships**:
- Consumes `Environment Configuration` to determine which URI to use
- Uses `Configuration Validator` to validate URI before connecting
- Provides connection instance to all application code and tests

**Validation Rules**:
- URI must not be empty
- URI must be valid MongoDB format
- If `NODE_ENV=test`, database name must include 'test'
- Connection must be established within timeout (5 seconds)

**Methods** (logical operations):
- `getConnectionURI()`: Returns appropriate URI based on NODE_ENV
- `validateTestDatabase()`: Validates test database name contains 'test'
- `connect()`: Establishes connection using selected URI
- `disconnect()`: Closes active connection and clears cache
- `isConnected()`: Checks current connection state

---

### Configuration Validator

**Purpose**: Validates database configuration before connection attempts

**Attributes**:
- `validationRules` (object): Set of validation rules
  - `uriFormat`: MongoDB URI format validation
  - `testDatabaseName`: Test database name must contain 'test'
  - `requiredVariables`: Required environment variables based on NODE_ENV

**Relationships**:
- Used by `Database Connection Manager` before connecting
- Reports validation errors to developer via console/exceptions

**Validation Rules**:

1. **Environment-Specific Requirements**:
   ```
   IF NODE_ENV = 'test' THEN
     MONGODB_TEST_URI must be defined
     MONGODB_TEST_URI database name must include 'test'
   ELSE
     MONGODB_URI must be defined
   END IF
   ```

2. **URI Format Validation**:
   - Must start with `mongodb://` or `mongodb+srv://`
   - Must include database name in path
   - Must be parseable as valid URL

3. **Test Database Safety Check**:
   ```
   IF NODE_ENV = 'test' THEN
     database_name = extract_from_uri(MONGODB_TEST_URI)
     IF NOT database_name.toLowerCase().includes('test') THEN
       THROW Error('Database name must include test')
     END IF
   END IF
   ```

**Error Messages**:
- Missing URI: `"MONGODB_TEST_URI environment variable is required when running tests"`
- Invalid test DB name: `"Test database name must include 'test'. Found: {dbName}"`
- Invalid URI format: `"Invalid MongoDB URI: {error details}"`

---

### Test Setup/Teardown Handler

**Purpose**: Manages test database lifecycle (cleanup, connection management)

**Attributes**:
- `cleanupMode` (enum): When to clean database
  - Values: `'before-each'`, `'before-all'`, `'after-each'`, `'after-all'`
  - Default: `'before-each'` for integration tests
  
- `collectionsToClean` (array): List of collection names to clean
  - Default: All collections in database
  - Can be filtered for specific test suites

**Relationships**:
- Uses `Database Connection Manager` to establish test database connection
- Executes cleanup operations on test database collections
- Coordinates with Jest lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach)

**Lifecycle Operations**:

1. **Setup** (beforeAll):
   ```
   Connect to test database
   Verify database name includes 'test'
   Log database name to console
   ```

2. **Pre-Test Cleanup** (beforeEach):
   ```
   Get all collections from mongoose.connection
   FOR EACH collection DO
     collection.deleteMany({})
   END FOR
   ```

3. **Teardown** (afterAll):
   ```
   Disconnect from database
   Clear cached connection
   Log disconnection
   ```

**Performance Characteristics**:
- Setup: ~500ms for connection establishment
- Cleanup per test: ~100-300ms depending on data volume
- Teardown: ~100ms for disconnection

---

## Data Flow Diagrams

### Database Selection Flow

```
┌─────────────────┐
│ Application     │
│ Starts          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Read NODE_ENV   │
│ from environment│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│ 'test'│ │ other    │
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌─────────┐ ┌────────────┐
│ Use     │ │ Use        │
│ TEST_URI│ │ MONGODB_URI│
└────┬────┘ └─────┬──────┘
     │            │
     ▼            │
┌─────────────┐   │
│ Validate    │   │
│ DB name has │   │
│ 'test'      │   │
└──────┬──────┘   │
       │          │
       └────┬─────┘
            │
            ▼
     ┌──────────────┐
     │ Connect to   │
     │ Database     │
     └──────────────┘
```

### Integration Test Flow

```
┌─────────────────┐
│ Jest starts     │
│ integration test│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ jest.env.setup  │
│ sets NODE_ENV   │
│ to 'test'       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ beforeAll hook  │
│ calls           │
│ setupTestDB()   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ connectDB()     │
│ selects TEST_URI│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate test   │
│ database name   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Connect to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ beforeEach hook │
│ cleans all      │
│ collections     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Run test        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ afterAll hook   │
│ disconnects DB  │
└─────────────────┘
```

---

## Configuration File Structure

### .env.local (example)

```bash
# Production/Development Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fasting-tracker?retryWrites=true&w=majority

# Test Database (must include 'test' in name)
MONGODB_TEST_URI=mongodb+srv://user:pass@cluster.mongodb.net/fasting-tracker-test?retryWrites=true&w=majority

# Node Environment (set by Jest for tests)
NODE_ENV=development
```

### jest.config.js (relevant sections)

```javascript
{
  setupFiles: ['<rootDir>/jest.env.setup.js'], // Sets NODE_ENV=test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Loads test utilities
}
```

---

## Constraints and Invariants

### Invariants (must always be true)

1. **Environment Safety**: If `NODE_ENV=test`, then `MONGODB_TEST_URI` must be used (never `MONGODB_URI`)

2. **Test Database Naming**: Any database used for testing must have 'test' in its name (case-insensitive)

3. **Connection Singleton**: Only one database connection exists per process

4. **Clean State**: Each integration test starts with empty collections

5. **No Cross-Contamination**: Test data never appears in production/development databases

### Constraints

1. **Performance**: Database cleanup must complete in <500ms per test
2. **Timeout**: Database connection must establish in <5 seconds
3. **Backward Compatibility**: Unit tests continue using MongoDB Memory Server (no database URI)
4. **Error Handling**: Missing or invalid configuration fails immediately with clear error message

---

## Migration Considerations

**No data migration required** - this feature only affects test infrastructure configuration. Existing data in production, development, and any existing test databases remains untouched.

**Configuration migration**:
1. Developers must add `MONGODB_TEST_URI` to `.env.local`
2. CI/CD pipelines must add `MONGODB_TEST_URI` to secrets
3. Test database must be created (empty) before running tests

---

## Testing the Configuration

### Configuration Validation Tests

```javascript
describe('Database Configuration', () => {
  test('selects test URI when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-db';
    
    const uri = getMongoURI();
    expect(uri).toBe(process.env.MONGODB_TEST_URI);
  });
  
  test('throws error when test DB name missing "test"', () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/production';
    
    expect(() => validateTestDatabase()).toThrow('must include test');
  });
});
```

---

## Summary

This feature introduces **no new data entities** but adds **configuration management** for test database separation. The key concepts are:

1. **Environment-aware URI selection** based on `NODE_ENV`
2. **Safety validation** for test database names
3. **Automated test lifecycle management** with cleanup hooks
4. **Clear error messages** for configuration issues

The data model focuses on configuration state and validation logic rather than persistent data structures.
