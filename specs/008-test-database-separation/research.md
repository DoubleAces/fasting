# Phase 0: Research & Technical Decisions

**Feature**: Test Database Separation  
**Date**: October 22, 2025  
**Status**: Complete

## Overview

This document records technical research and decisions made during the planning phase for implementing test database separation in the fasting tracker application.

## Research Areas

### 1. Environment-Based Database Selection

**Decision**: Use `NODE_ENV` environment variable to determine which database URI to use

**Rationale**: 
- Jest already supports setting `NODE_ENV=test` in configuration
- Standard practice in Node.js applications
- Allows automatic selection without manual configuration per test file
- Provides clear semantic meaning (production vs development vs test)

**Alternatives Considered**:
- **Manual URI switching in each test**: Rejected due to maintenance burden and error-prone
- **Separate jest.config for integration tests**: Rejected as unnecessarily complex
- **Test-specific environment files (.env.test)**: Considered but rejected as dotenv doesn't support this pattern well with existing .env.local

**Implementation Approach**:
```javascript
// In src/lib/db.js
export function getMongoURI() {
  const env = process.env.NODE_ENV;
  
  if (env === 'test') {
    return process.env.MONGODB_TEST_URI;
  }
  
  return process.env.MONGODB_URI;
}
```

### 2. Test Database Name Validation

**Decision**: Implement validation that test database name must contain "test" keyword

**Rationale**:
- Prevents accidental misconfiguration pointing tests at production
- Provides clear safety check that fails fast
- Simple string-based validation is sufficient
- No performance impact (checked once at connection time)

**Implementation Approach**:
```javascript
// Validate in connectDB() when NODE_ENV=test
if (process.env.NODE_ENV === 'test') {
  const uri = process.env.MONGODB_TEST_URI;
  if (!uri) {
    throw new Error('MONGODB_TEST_URI must be set when NODE_ENV=test');
  }
  
  // Extract database name from MongoDB URI
  const dbName = extractDatabaseName(uri);
  if (!dbName.toLowerCase().includes('test')) {
    throw new Error(
      `Test database name must include 'test'. Found: ${dbName}`
    );
  }
}
```

**Alternatives Considered**:
- **Whitelist specific database names**: Too restrictive, doesn't scale with multiple developers
- **No validation**: Unsafe, doesn't prevent misconfiguration
- **Regex pattern matching**: Overengineered for this use case

### 3. Jest Configuration for Integration Tests

**Decision**: Configure Jest to set `NODE_ENV=test` globally and use `testEnvironment: 'node'` for integration tests

**Rationale**:
- Jest's `testEnvironment` can be set per-file using docblock comments
- Integration tests already use `@jest-environment node` pattern
- Global `NODE_ENV=test` ensures all tests use test database
- No changes needed to individual test files beyond imports

**Implementation Approach**:
```javascript
// jest.config.js
export default {
  // Existing config...
  setupFiles: ['<rootDir>/jest.env.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Ensure NODE_ENV is set for all tests
  testEnvironment: 'jest-environment-jsdom', // Default for component tests
  
  // Integration tests override with @jest-environment node
}

// jest.env.setup.js (modify existing)
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
```

**Alternatives Considered**:
- **Separate jest config for integration**: Creates configuration duplication
- **npm script with cross-env**: Adds dependency and complexity
- **Per-test environment setting**: Too verbose, easy to forget

### 4. Test Database Cleanup Strategy

**Decision**: Use `beforeEach` and `afterAll` hooks in a shared setup file for collection cleanup

**Rationale**:
- `beforeEach` ensures clean state for each test
- `afterAll` ensures proper connection cleanup
- Shared setup file reduces code duplication across test files
- Mongoose provides efficient `deleteMany({})` for cleanup
- Maintains existing test patterns

**Implementation Approach**:
```javascript
// tests/integration/setup.js (new file)
import { connectDB, disconnectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function setupTestDatabase() {
  await connectDB();
  
  // Clean all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function teardownTestDatabase() {
  await disconnectDB();
}

// Usage in test files:
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  // Clean collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

**Alternatives Considered**:
- **Transaction-based rollback**: Not supported well in MongoDB for tests
- **Database recreation per test**: Too slow, adds 5+ seconds per test
- **Manual cleanup in each test**: Error-prone, leads to test pollution
- **Global Jest setup/teardown**: Doesn't work well with parallel test execution

### 5. MongoDB URI Parsing

**Decision**: Use URL parsing to extract database name from MongoDB connection string

**Rationale**:
- MongoDB URIs follow standard URL format
- Node.js URL class handles edge cases (special characters, query params)
- Works with both `mongodb://` and `mongodb+srv://` schemes
- No additional dependencies needed

**Implementation Approach**:
```javascript
function extractDatabaseName(uri) {
  try {
    const url = new URL(uri);
    // Database name is the pathname without leading slash
    const dbName = url.pathname.slice(1).split('?')[0];
    if (!dbName) {
      throw new Error('No database name found in URI');
    }
    return dbName;
  } catch (error) {
    throw new Error(`Invalid MongoDB URI: ${error.message}`);
  }
}
```

**Alternatives Considered**:
- **Regex parsing**: More error-prone, doesn't handle edge cases
- **MongoDB driver parsing**: Would require additional imports
- **Manual string splitting**: Fragile, doesn't handle query parameters

### 6. Backward Compatibility with Unit Tests

**Decision**: No changes required to unit tests - they continue using MongoDB Memory Server

**Rationale**:
- Unit tests already use `mongodb-memory-server` which creates isolated in-memory instances
- Unit tests don't import `connectDB()` function - they create their own connections
- Test environment detection only affects integration tests
- Maintains clear separation: unit tests = in-memory, integration tests = real database

**Verification**:
```javascript
// Unit tests (tests/unit/lib/models/User.test.js) - NO CHANGES NEEDED
import { MongoMemoryServer } from 'mongodb-memory-server';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri); // Direct connection, bypasses connectDB()
});
```

### 7. CI/CD Configuration

**Decision**: Add `MONGODB_TEST_URI` as a secret in GitHub Actions and Vercel

**Rationale**:
- Follows existing pattern for `MONGODB_URI` secrets
- GitHub Actions supports encrypted secrets
- Vercel environment variables per environment (development, preview, production)
- Test database can be shared across CI runs (data is ephemeral)

**Implementation Approach**:
```yaml
# .github/workflows/test.yml (example)
env:
  NODE_ENV: test
  MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
```

**Alternatives Considered**:
- **MongoDB Memory Server in CI**: Too slow for integration tests, doesn't test real MongoDB behavior
- **Docker MongoDB in CI**: Adds complexity and CI time
- **Atlas free tier**: Selected as best option - fast, reliable, no CI setup needed

### 8. Error Messages and Developer Experience

**Decision**: Provide clear, actionable error messages with examples

**Rationale**:
- Developers need immediate understanding of configuration issues
- Error messages should include expected environment variable names
- Example values help developers configure correctly
- Console logging should clearly show which database is being used

**Implementation Examples**:
```javascript
// Missing test URI
throw new Error(
  'MONGODB_TEST_URI environment variable is required when running tests.\n' +
  'Add to .env.local:\n' +
  'MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test'
);

// Invalid database name
throw new Error(
  `Test database name must include 'test' for safety.\n` +
  `Current: ${dbName}\n` +
  `Example: fasting-tracker-test`
);

// Success message
console.log(`✓ Test database connected: ${dbName}`);
```

## Best Practices Applied

### Jest Testing
- Environment-specific test configuration using `@jest-environment` docblocks
- Shared setup/teardown utilities to reduce duplication
- Fast test execution with efficient database cleanup
- Clear test isolation with `beforeEach` cleanup

### MongoDB with Mongoose
- Connection pooling maintained for test database
- Proper connection cleanup in `afterAll` hooks
- Efficient collection cleanup using `deleteMany({})`
- URI validation at connection time

### Environment Configuration
- Clear separation of environment variables by purpose
- Fail-fast validation with helpful error messages
- Documentation in `.env.example` for discoverability
- Support for local development, CI/CD, and production environments

### Error Handling
- Explicit validation of test database configuration
- Helpful error messages with examples
- Safety checks prevent accidental production database usage
- Console logging provides visibility into database selection

## Testing Strategy

### Unit Tests (No Changes)
- Continue using MongoDB Memory Server
- Isolated, fast, in-memory
- No network dependencies

### Integration Tests (Updated)
- Use real test database via `MONGODB_TEST_URI`
- Environment-aware via `NODE_ENV=test`
- Automatic cleanup before each test
- Shared setup utilities for consistency

### Verification Tests (New)
- Test that `NODE_ENV=test` selects test database
- Test that missing `MONGODB_TEST_URI` throws clear error
- Test that non-test database names are rejected
- Test that production database is never touched during tests

## Performance Considerations

- **Database selection**: One-time cost at connection initialization
- **Cleanup overhead**: ~100-500ms per test suite (acceptable)
- **No production impact**: Changes only affect test runtime
- **CI/CD**: Atlas connection adds ~1-2s vs local MongoDB (acceptable tradeoff for reliability)

## Security Considerations

- Test database credentials stored as environment variables
- No credentials committed to version control
- Test database should not contain production data
- Clear separation between production and test environments
- CI/CD uses encrypted secrets for test database credentials

## Migration Path

1. **Phase 1**: Update `src/lib/db.js` with environment-aware connection
2. **Phase 2**: Create shared test setup utilities
3. **Phase 3**: Update `.env.example` with test database documentation
4. **Phase 4**: Update integration test files to use shared setup
5. **Phase 5**: Verify all tests pass with test database
6. **Phase 6**: Update CI/CD configuration with test database secrets

**Rollback Plan**: If issues arise, environment variable can be removed and tests will fall back to current behavior (using MONGODB_URI).

## Open Questions

**None** - All technical decisions have been made with clear rationale.

## References

- Jest Environment Configuration: https://jestjs.io/docs/configuration#testenvironment-string
- Mongoose Connection Best Practices: https://mongoosejs.com/docs/connections.html
- MongoDB URI Format: https://www.mongodb.com/docs/manual/reference/connection-string/
- Node.js URL Parsing: https://nodejs.org/api/url.html
