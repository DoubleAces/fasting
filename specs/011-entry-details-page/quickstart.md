# Quickstart: Entry Details Page

**Date**: October 24, 2025  
**Feature**: Entry Details Page  
**Phase**: 1 - Design & Contracts

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- MongoDB running (local or Atlas)
- Project cloned and dependencies installed (`npm install`)
- Environment variables configured (`.env.local`)
- Existing user account and entries in database (or use seed script)

## Development Setup

### 1. Create Feature Branch

```powershell
# Already created by /speckit.specify
git checkout 011-entry-details-page
git pull origin 011-entry-details-page
```

### 2. Run Development Server

```powershell
npm run dev
```

Server starts at `http://localhost:3000`

### 3. Access Entry Details Page

Navigate to: `http://localhost:3000/entries/[entry-id]`

Replace `[entry-id]` with valid MongoDB ObjectId from your entries collection.

**Example**:
```
http://localhost:3000/entries/673abc123def456789012345
```

---

## TDD Workflow

### Step 1: Write Tests First

```powershell
# Create test file BEFORE implementation
New-Item -Path "tests/unit/services/entryInsightsService.test.js" -ItemType File

# Write test cases for insights calculations
# Example: test longest fast detection, ranking, averages
```

### Step 2: Run Tests (Should Fail)

```powershell
npm test -- tests/unit/services/entryInsightsService.test.js
```

Expected: ❌ **Tests fail** (service doesn't exist yet)

### Step 3: Implement to Pass Tests

```powershell
# Create service file
New-Item -Path "src/lib/services/entryInsightsService.js" -ItemType File

# Implement functions to pass tests
```

### Step 4: Verify Tests Pass

```powershell
npm test -- tests/unit/services/entryInsightsService.test.js
```

Expected: ✅ **Tests pass**

### Step 5: Refactor & Repeat

Continue TDD cycle for each component:
1. FastingTimeline component
2. EntryInsights component
3. EntryActions component
4. Main page integration

---

## File Creation Order (TDD Approach)

### Phase 1: Foundation (Atoms & Services)

```powershell
# 1. Insights Service (Business Logic)
#    Tests → Implementation
tests/unit/services/entryInsightsService.test.js
src/lib/services/entryInsightsService.js

# 2. Badge Component (Atom)
#    Tests → Implementation
tests/unit/components/atoms/Badge.test.js
src/components/atoms/Badge.js

# 3. TimeDisplay Component (Atom)
#    Tests → Implementation
tests/unit/components/atoms/TimeDisplay.test.js
src/components/atoms/TimeDisplay.js
```

### Phase 2: Molecules

```powershell
# 4. Fasting Timeline (Circular Clock)
#    Tests → Implementation
tests/unit/components/molecules/FastingTimeline.test.js
src/components/molecules/FastingTimeline.js

# 5. Insight Card
#    Tests → Implementation
tests/unit/components/molecules/InsightCard.test.js
src/components/molecules/InsightCard.js

# 6. Entry Metadata
#    Tests → Implementation
tests/unit/components/molecules/EntryMetadata.test.js
src/components/molecules/EntryMetadata.js
```

### Phase 3: Organisms

```powershell
# 7. Entry Insights Section
#    Tests → Implementation
tests/unit/components/organisms/EntryInsights.test.js
src/components/organisms/EntryInsights.js

# 8. Entry Actions
#    Tests → Implementation
tests/unit/components/organisms/EntryActions.test.js
src/components/organisms/EntryActions.js

# 9. Entry Details View (Main Container)
#    Tests → Implementation
tests/unit/components/organisms/EntryDetailsView.test.js
src/components/organisms/EntryDetailsView.js
```

### Phase 4: Page & Integration

```powershell
# 10. Page Route (Server Component)
#     Integration tests → Implementation
tests/integration/entry-details.test.js
src/app/entries/[id]/page.js
src/app/entries/[id]/loading.js

# 11. Entry List Modification (Add Links)
#     Tests → Implementation
tests/unit/components/organisms/EntryList.test.js  # Update existing
src/components/organisms/EntryList.js               # Modify existing
```

### Phase 5: E2E Tests

```powershell
# 12. End-to-End User Flows
tests/e2e/entry-details-flow.spec.js
```

---

## Running Tests

### Unit Tests

```powershell
# Run all unit tests
npm test -- tests/unit/

# Run specific component test
npm test -- tests/unit/components/molecules/FastingTimeline.test.js

# Watch mode (auto-rerun on changes)
npm test:watch
```

### Integration Tests

```powershell
# Run integration tests (uses MongoDB Memory Server)
npm test -- tests/integration/entry-details.test.js
```

### E2E Tests

```powershell
# Install Playwright browsers (first time only)
npm run playwright:install

# Run E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run specific test
npx playwright test tests/e2e/entry-details-flow.spec.js
```

### Coverage Report

```powershell
# Generate coverage report (target: 80%+)
npm run test:coverage

# View HTML report
start coverage/lcov-report/index.html
```

---

## Key Development Commands

### Create New Component (TDD)

```powershell
# 1. Create test file
New-Item -Path "tests/unit/components/atoms/Badge.test.js" -ItemType File

# 2. Write test cases in editor
code tests/unit/components/atoms/Badge.test.js

# 3. Run test (should fail)
npm test -- tests/unit/components/atoms/Badge.test.js

# 4. Create component file
New-Item -Path "src/components/atoms/Badge.js" -ItemType File

# 5. Implement component
code src/components/atoms/Badge.js

# 6. Run test (should pass)
npm test -- tests/unit/components/atoms/Badge.test.js
```

### Debug Test Failures

```powershell
# Run single test file with verbose output
npm test -- tests/unit/services/entryInsightsService.test.js --verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest tests/unit/services/entryInsightsService.test.js
```

### Lint & Format

```powershell
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Format with Prettier (if configured)
npx prettier --write "src/**/*.{js,jsx}"
```

---

## Database Setup for Testing

### Seed Test Data

```powershell
# Create seed script (if doesn't exist)
node scripts/seed-test-entries.js

# Example: Create 30 entries for test user
# - Varying fasting durations (14h - 20h)
# - Different mood ratings
# - Some with weight, some without
```

### MongoDB Queries for Testing

```javascript
// In MongoDB shell or Compass
// Find user's entries
db.entries.find({ userId: ObjectId("671def456abc789012345678") })
  .sort({ date: -1 })
  .limit(10);

// Calculate average duration manually (verify service logic)
db.entries.aggregate([
  { 
    $match: { 
      userId: ObjectId("671def456abc789012345678"),
      date: { $gte: new Date("2025-09-24") }
    } 
  },
  { $group: { _id: null, avg: { $avg: "$fastingDuration" } } }
]);
```

---

## Common Issues & Solutions

### Issue: "Entry not found" 404 Error

**Cause**: Invalid ObjectId or entry doesn't exist  
**Solution**: 
```powershell
# Verify entry exists in database
# Use valid entry ID from your database
# Check MongoDB logs for query errors
```

### Issue: Authorization Error (Redirect to /entries)

**Cause**: Entry belongs to different user  
**Solution**:
```powershell
# Log in as correct user
# Verify entry.userId matches session.user.id
# Check auth middleware is working
```

### Issue: Insights Not Showing

**Cause**: Insufficient entries (<7) or calculation error  
**Solution**:
```powershell
# Create more test entries (need 7+ for insights)
# Check console for service errors
# Verify MongoDB queries returning data
```

### Issue: Circular Clock Not Rendering

**Cause**: SVG path calculation error or missing props  
**Solution**:
```powershell
# Check browser console for React errors
# Verify FastingTimeline receiving correct props
# Test angle calculation logic in unit tests
```

### Issue: Tests Timing Out

**Cause**: MongoDB Memory Server slow to start  
**Solution**:
```powershell
# Increase Jest timeout in test file
# jest.setTimeout(30000);

# Or skip integration tests for faster unit testing
npm test -- tests/unit/ --testPathIgnorePatterns=integration
```

---

## Project Structure Overview

```
src/app/entries/[id]/
├── page.js          # Server Component (data fetching)
└── loading.js       # Loading skeleton

src/components/
├── atoms/           # Basic building blocks
├── molecules/       # Composed components
└── organisms/       # Complex sections

src/lib/services/
└── entryInsightsService.js  # Business logic

tests/
├── unit/            # Component & service tests
├── integration/     # API & page tests
└── e2e/             # User flow tests
```

---

## Next Steps

1. **Review Research & Data Model**: Read `research.md` and `data-model.md` for design decisions
2. **Start TDD Cycle**: Begin with insights service tests
3. **Build Components**: Follow atomic design progression (atoms → molecules → organisms)
4. **Integration Testing**: Test full page with real data
5. **E2E Testing**: Verify user flows (P1, P2, P3)
6. **Manual Testing**: Test on mobile devices and different browsers
7. **Accessibility Check**: Run Lighthouse audit, test keyboard navigation
8. **Performance Check**: Verify <2s load time, Core Web Vitals

## Resources

- **Spec**: `specs/011-entry-details-page/spec.md`
- **Research**: `specs/011-entry-details-page/research.md`
- **Data Model**: `specs/011-entry-details-page/data-model.md`
- **API Contracts**: `specs/011-entry-details-page/contracts/api-specification.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Playwright Docs**: https://playwright.dev/docs/intro
