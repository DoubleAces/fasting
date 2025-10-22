# Feature Specification: Test Database Separation

**Feature Branch**: `008-test-database-separation`  
**Created**: October 22, 2025  
**Status**: Draft  
**Input**: User description: "I need to implement a test database for integration tests. At the moment, the tests wipe out the live data in the main mongodb. I need to make sure testing is done on test db and nothing live gets affected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe Integration Test Execution (Priority: P1)

As a developer running integration tests, I need the test suite to automatically use a separate test database so that I can run tests at any time without risking production or development data loss.

**Why this priority**: This is the critical safety requirement. Without this, developers risk data loss every time tests run, making the test suite dangerous to use and potentially causing production incidents.

**Independent Test**: Run the full integration test suite (`npm test`) and verify that: 1) tests pass successfully, 2) the production database shows no changes to existing data, 3) test database contains only test data, and 4) test database is automatically cleaned up after tests complete.

**Acceptance Scenarios**:

1. **Given** I have a local `.env.local` file with production `MONGODB_URI`, **When** I run integration tests via `npm test`, **Then** tests use a separate test database and production data remains untouched
2. **Given** I am running integration tests, **When** tests execute database operations, **Then** all operations target the test database, not the production database
3. **Given** integration tests have completed successfully, **When** I inspect the production database, **Then** no test data exists in production collections
4. **Given** integration tests have completed with failures, **When** I inspect the production database, **Then** no test data exists in production collections (tests don't pollute production even on failure)
5. **Given** I run integration tests multiple times in succession, **When** each test run begins, **Then** the test database is cleaned from the previous run automatically

---

### User Story 2 - Test Environment Configuration (Priority: P1)

As a developer, I need clear environment configuration that distinguishes between production, development, and test database connections so that the system automatically uses the correct database based on the runtime environment.

**Why this priority**: Proper configuration is foundational - without it, developers could accidentally point tests at production. This enables safe, predictable behavior across all environments.

**Independent Test**: Create a test that reads environment variables in different configurations (NODE_ENV=test vs development) and verifies that the correct database URI is selected. Run tests and confirm they connect to the test database URI, not the production URI.

**Acceptance Scenarios**:

1. **Given** I set `NODE_ENV=test` in my environment, **When** the application initializes database connection, **Then** it uses the test database URI
2. **Given** I set `NODE_ENV=development` in my environment, **When** the application starts, **Then** it uses the development database URI
3. **Given** I set `NODE_ENV=production` in my environment, **When** the application starts in production, **Then** it uses the production database URI
4. **Given** I have both `MONGODB_URI` and `MONGODB_TEST_URI` configured, **When** integration tests run, **Then** tests ignore `MONGODB_URI` and use `MONGODB_TEST_URI` exclusively
5. **Given** `MONGODB_TEST_URI` is not configured, **When** I attempt to run integration tests, **Then** tests fail immediately with a clear error message indicating the missing configuration
6. **Given** I am reviewing environment configuration, **When** I examine `.env.example`, **Then** I see documented examples for all three database URIs (production, development, test)

---

### User Story 3 - Test Database Lifecycle Management (Priority: P2)

As a developer, I need the test database to be automatically set up before tests run and cleaned up after tests complete so that each test run starts with a known clean state without manual intervention.

**Why this priority**: While automated database selection (P1) prevents data loss, automated lifecycle management ensures tests are reliable and repeatable. This is a quality-of-life improvement that prevents flaky tests.

**Independent Test**: Run integration tests and verify that: 1) before tests start, all test collections are empty, 2) after tests complete, test data is cleaned up, 3) running tests twice in a row produces identical results (idempotent).

**Acceptance Scenarios**:

1. **Given** I am starting a test run, **When** the test setup phase executes, **Then** all collections in the test database are emptied before any tests run
2. **Given** integration tests are running, **When** each test suite completes, **Then** that suite's test data is cleaned up from the database
3. **Given** integration tests have completed, **When** the test teardown phase executes, **Then** the database connection is properly closed
4. **Given** I run the same integration test twice, **When** both runs complete, **Then** both produce identical results (tests are idempotent)
5. **Given** a test fails mid-execution, **When** the test suite continues, **Then** the failed test's data is still cleaned up (via beforeEach hooks before the next test begins) and doesn't affect subsequent tests

---

### User Story 4 - CI/CD Pipeline Test Database Support (Priority: P2)

As a developer working with continuous integration, I need the test database configuration to work seamlessly in CI/CD environments (GitHub Actions, etc.) so that automated tests run safely without requiring manual setup.

**Why this priority**: Essential for modern development workflows. While local development is covered by P1, CI/CD support enables automated testing in the deployment pipeline.

**Independent Test**: Configure a CI/CD pipeline with appropriate environment variables and verify that tests run successfully in the CI environment, using a CI-specific test database without manual intervention.

**Acceptance Scenarios**:

1. **Given** I have configured `MONGODB_TEST_URI` as a CI environment variable, **When** tests run in the CI pipeline, **Then** tests connect to the CI test database successfully
2. **Given** tests are running in a CI environment, **When** tests complete, **Then** test artifacts and logs clearly indicate which database was used
3. **Given** CI pipeline uses MongoDB Atlas for testing, **When** tests run, **Then** connection string includes appropriate timeout and retry settings for cloud database
4. **Given** CI environment lacks `MONGODB_TEST_URI`, **When** the CI pipeline runs, **Then** the build fails with a clear error message indicating missing test database configuration

---

### User Story 5 - Development Database Protection (Priority: P3)

As a developer, I want visual confirmation when integration tests are about to run so that I can verify I'm not accidentally targeting the wrong database before tests execute.

**Why this priority**: This is a safety enhancement and developer experience improvement. The core protection is already provided by P1 (automatic test DB selection), but this adds an extra safety layer for peace of mind.

**Independent Test**: Run integration tests and observe console output that clearly indicates which database is being targeted. Verify that the database name is prominently displayed before any tests execute.

**Acceptance Scenarios**:

1. **Given** I start running integration tests, **When** test setup begins, **Then** console output displays the database name being used within the first 3 lines with clear visual formatting (e.g., "✓ Using test database: fasting-tracker-test")
2. **Given** integration tests are running, **When** I view test output, **Then** I can clearly see which database is active from the logs (database name appears in test output header)
3. **Given** I accidentally try to run tests with missing test configuration, **When** the error appears, **Then** the error message includes the expected environment variable name and example value

---

### Edge Cases

- What happens when a developer forgets to set `MONGODB_TEST_URI` and runs integration tests?
  - Tests should fail immediately with a clear error message, preventing any database operations
- What happens if `MONGODB_TEST_URI` accidentally points to the production database?
  - Tests should detect if the database name doesn't include "test" and refuse to run with a warning
- What happens when test database connection fails mid-test?
  - Test suite should fail gracefully with connection error, no data should be written to fallback production DB
- What happens when tests are interrupted (Ctrl+C) before cleanup?
  - Database connection should close properly via cleanup handlers
- What happens when multiple developers run tests simultaneously against the same test database?
  - Each developer should ideally use their own test database instance, or tests should be isolated by unique identifiers
- What happens when running unit tests vs integration tests?
  - Unit tests should continue using MongoDB Memory Server (in-memory), not connect to any real database
  - Integration tests should use the test database
- What happens when NODE_ENV is not set?
  - System should default to development mode and require explicit test configuration for running tests

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use a separate database URI for integration tests that is distinct from production and development database URIs
- **FR-002**: System MUST read test database configuration from `MONGODB_TEST_URI` environment variable when running in test mode
- **FR-003**: System MUST automatically detect test environment based on `NODE_ENV=test` and select the appropriate database connection
- **FR-004**: Integration tests MUST fail immediately with a clear error if `MONGODB_TEST_URI` is not configured
- **FR-005**: System MUST prevent integration tests from connecting to production database even if only `MONGODB_URI` is set
- **FR-006**: System MUST validate that test database name contains "test" keyword before allowing integration tests to proceed
- **FR-007**: System MUST clean up all test collections before each test suite runs to ensure clean state
- **FR-008**: System MUST properly close database connections after all tests complete
- **FR-009**: Unit tests MUST continue using MongoDB Memory Server (in-memory) without connecting to external databases
- **FR-010**: Test output MUST clearly display which database is being used at the start of test execution
- **FR-011**: System MUST maintain backward compatibility with existing unit tests that use MongoDB Memory Server
- **FR-012**: Integration test setup files MUST be updated to use environment-aware database configuration
- **FR-013**: Environment example file (`.env.example`) MUST include documentation for `MONGODB_TEST_URI`
- **FR-014**: Jest configuration MUST be updated to set `NODE_ENV=test` when running integration tests
- **FR-015**: Database connection utility MUST support selecting database based on environment (production, development, test)

### Key Entities

- **Environment Configuration**: Manages database URIs for different environments (production via `MONGODB_URI`, development via `MONGODB_URI`, test via `MONGODB_TEST_URI`)
- **Database Connection Manager**: Selects appropriate database URI based on `NODE_ENV` and establishes connections
- **Test Setup/Teardown**: Handles database cleanup before/after test runs, ensures proper connection lifecycle
- **Configuration Validator**: Validates database URIs and environment settings before tests run

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can run full integration test suite (`npm test`) without any production or development data being modified or deleted
- **SC-002**: Integration tests automatically use test database 100% of the time without requiring manual configuration changes
- **SC-003**: Test suite fails within 5 seconds with clear error message when test database is not configured properly
- **SC-004**: Running integration tests 10 times consecutively produces identical results (no data pollution between runs)
- **SC-005**: All existing integration tests (15+ test files) pass successfully after implementing test database separation
- **SC-006**: Unit tests continue to run with MongoDB Memory Server without requiring any database configuration
- **SC-007**: Test execution time remains within 10% of baseline performance (baseline to be measured before implementation: run `npm test -- tests/integration/` 10 times and record average execution time)
- **SC-008**: Console output clearly displays test database name within first 3 lines of test execution
- **SC-009**: CI/CD pipeline integration tests run successfully with environment-based configuration without manual intervention
- **SC-010**: Zero incidents of test data appearing in production database after implementation

## Assumptions *(mandatory)*

- Developers have access to create separate MongoDB databases (either local, Atlas free tier, or Docker)
- Test database can be on the same MongoDB instance/cluster as development database (different database names)
- MongoDB Atlas connection strings support multiple databases by changing the database name in the URI
- Integration tests should use real database connections, not in-memory MongoDB (unlike unit tests)
- Existing integration tests follow a consistent pattern and can be updated with shared configuration
- Jest is the test runner and supports environment variable configuration
- Test database does not require complex seeding - tests create their own test data as needed
- Developers running tests locally have network access to the configured test database
- Test database can be ephemeral (data cleared between runs) or persistent (for debugging)

## Dependencies & Constraints *(mandatory)*

### Dependencies

- Existing MongoDB connection utility (`src/lib/db.js`) that supports connection management
- Jest testing framework with environment configuration support
- Dotenv for environment variable management
- Existing integration test files that need test database configuration updates
- `.env.local` file for local development configuration
- CI/CD environment variable configuration (GitHub Actions, Vercel, etc.)

### Constraints

- Must maintain backward compatibility with existing unit tests using MongoDB Memory Server
- Cannot require developers to run separate database instances for tests (same MongoDB instance is acceptable)
- Configuration changes must be minimal and follow existing project patterns
- Test database setup must not add more than 5 seconds to test suite startup time
- Solution must work across all environments: local development, CI/CD, and deployment previews
- Must not introduce new external dependencies (use existing packages where possible)
- Environment variable naming must follow project conventions (`MONGODB_*` prefix)

## Out of Scope *(optional)*

- Migrating unit tests from MongoDB Memory Server to real database (unit tests should remain in-memory)
- Creating separate test databases for each developer automatically (developers can configure their own)
- Implementing database seeding or fixtures for integration tests (tests create their own data)
- Adding test data generators or factories (can be added in future feature)
- Implementing parallel test execution with database isolation (Jest runs tests sequentially by default)
- Creating automated database cleanup scripts for CI environments (test cleanup should be automatic)
- Adding database schema migration tools for test database
- Implementing visual database state inspection tools for tests
- Creating test-specific MongoDB indexes or optimizations
- Adding database transaction rollback mechanisms for faster test cleanup

## Security & Privacy Considerations *(optional)*

- Test database credentials should be stored securely in environment variables, never committed to version control
- Test database should not contain any production data or personally identifiable information (PII)
- Test database access should be restricted to development and CI/CD environments only
- MongoDB Atlas test database should have IP whitelisting or network access controls configured
- Test database credentials should be rotated if exposed or shared beyond development team
- CI/CD secrets for test database should use platform-specific secret management (GitHub Secrets, Vercel Environment Variables)
- Test database backups are not required since data is ephemeral and recreated per test run
- Audit logging should distinguish between test and production database operations if centralized logging is used

## Future Enhancements *(optional)*

- Add support for running tests against multiple database versions (MongoDB 5.x, 6.x, 7.x)
- Implement per-developer test database namespaces for parallel development
- Create test database Docker Compose configuration for consistent local environments
- Add test data fixtures and seeders for common test scenarios
- Implement database state snapshots for faster test setup
- Add visual test database inspection tools integrated with VS Code
- Create automated test database maintenance scripts (cleanup old data, optimize indexes)
- Add support for testing database migrations and schema changes
- Implement transaction-based test isolation for faster cleanup
- Add metrics tracking for test database performance and connection pooling


