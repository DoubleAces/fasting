# Integration Tests

This directory contains integration tests that test the full stack with real database connections.

## Prerequisites

Integration tests require a running MongoDB instance. You have several options:

###  Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: Follow official docs for your distribution

2. **Start MongoDB**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod --dbpath /path/to/data/directory
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasting-tracker-test?retryWrites=true&w=majority
   ```

### Option 3: Docker

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb-test mongo:latest

# Stop when done
docker stop mongodb-test
docker rm mongodb-test
```

## Running Integration Tests

```bash
# Run all integration tests
npm test -- tests/integration

# Run specific integration test file
npm test -- entries.test.js

# Run with coverage
npm run test:coverage -- tests/integration
```

## Test Environment Configuration

Integration tests use the `node` test environment (not `jsdom`) to properly test API routes and database operations. This is configured with the `@jest-environment node` comment at the top of each integration test file.

## Test Database

Integration tests will:
- Connect to MongoDB using `MONGODB_URI` from environment variables
- Create a test database (default: `fasting-tracker-test`)
- Clean up data before each test (`beforeEach`)
- Disconnect after all tests (`afterAll`)

**Important**: Integration tests will delete all data in the test database between runs. Never point integration tests at a production database!

## Writing Integration Tests

Example structure:

```javascript
/**
 * @jest-environment node
 */

import { connectDB, disconnectDB } from '@/lib/db';
import YourModel from '@/lib/models/YourModel';

describe('Your Integration Test', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean database before each test
    await YourModel.deleteMany({});
  });

  it('should test something', async () => {
    // Your test code
  });
});
```

## Current Test Coverage

- **Entry Endpoints**: 21 tests covering GET, POST, PUT, DELETE operations
  - List entries with pagination
  - Create entries with fasting calculation
  - Update entries with recalculation
  - Delete entries with cascade updates
  
- **Settings Endpoints**: (Coming soon)
  - Get user settings
  - Update/create settings

## Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running. Start MongoDB using one of the methods above.

### "Exceeded timeout of 5000 ms"
- MongoDB connection is slow. Increase Jest timeout:
  ```javascript
  jest.setTimeout(30000); // 30 seconds
  ```

### "SyntaxError: Unexpected token 'export'"
- Make sure integration test has `@jest-environment node` comment
- Check that `jest.config.js` has proper transform configuration

## Next Steps

After implementing the full API layer with integration tests, we'll move to:
- Phase 3: UI Components with React Testing Library
- Phase 4: End-to-end tests with Playwright
