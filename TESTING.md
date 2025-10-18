# Testing Guide

This project follows **Test-Driven Development (TDD)** with a minimum 80% code coverage requirement.

## Test Structure

```
tests/
├── unit/              # Unit tests for utilities, helpers, calculators
├── integration/       # API route integration tests
├── components/        # React component tests (RTL)
└── e2e/              # End-to-end tests (Playwright)
```

## Running Tests

### Jest (Unit & Component Tests)

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should calculate fasting"
```

### Playwright (E2E Tests)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
```

## TDD Workflow

### Red → Green → Refactor

1. **Red**: Write a failing test
   ```javascript
   it('should calculate fasting duration', () => {
     const result = calculateFasting('20:00', '12:00');
     expect(result).toEqual({ hours: 16, minutes: 0 });
   });
   ```

2. **Green**: Write minimal code to make it pass
   ```javascript
   export function calculateFasting(lastMeal, firstMeal) {
     // Implementation
     return { hours: 16, minutes: 0 };
   }
   ```

3. **Refactor**: Improve the code while keeping tests green
   ```javascript
   export function calculateFasting(lastMeal, firstMeal) {
     // Cleaner, more maintainable implementation
     const last = parseTime(lastMeal);
     const first = parseTime(firstMeal);
     return calculateDuration(last, first);
   }
   ```

## Test Coverage Requirements

- **Minimum**: 80% coverage across:
  - Branches
  - Functions
  - Lines
  - Statements

- **Run coverage check**:
  ```bash
  npm run test:coverage
  ```

- View coverage report: `coverage/lcov-report/index.html`

## Writing Good Tests

### Unit Tests

```javascript
// tests/unit/utils/fastingCalculator.test.js
import { calculateFasting } from '@/lib/utils/fastingCalculator';

describe('calculateFasting', () => {
  it('should calculate hours across midnight', () => {
    const result = calculateFasting('23:00', '07:00');
    expect(result).toEqual({ hours: 8, minutes: 0 });
  });

  it('should return null when previous meal missing', () => {
    const result = calculateFasting(null, '07:00');
    expect(result).toBeNull();
  });
});
```

### Component Tests

```javascript
// tests/components/atoms/Button.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/atoms/Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have minimum touch target size', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test');
    const styles = window.getComputedStyle(button);
    
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
  });
});
```

### E2E Tests

```javascript
// tests/e2e/log-entry.spec.js
import { test, expect } from '@playwright/test';

test.describe('Log Daily Entry', () => {
  test('should create a new entry', async ({ page }) => {
    await page.goto('/log');
    
    // Fill form
    await page.fill('[name="firstMealTime"]', '12:00');
    await page.fill('[name="lastMealTime"]', '20:00');
    await page.fill('[name="hoursOfSleep"]', '8');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## Best Practices

1. **Write tests first** (TDD mandatory)
2. **Test behavior, not implementation**
3. **Use descriptive test names**: `should [expected behavior] when [condition]`
4. **Follow AAA pattern**: Arrange, Act, Assert
5. **Keep tests isolated**: No shared state between tests
6. **Mock external dependencies**: API calls, database, etc.
7. **Test edge cases**: null, undefined, empty strings, very large numbers
8. **Test accessibility**: keyboard navigation, screen readers, ARIA labels

## Mocking

### Mock API Routes

```javascript
// tests/integration/api/entries.test.js
import { GET } from '@/app/api/entries/route';

// Mock database
jest.mock('@/lib/db', () => ({
  connectDB: jest.fn(),
}));

jest.mock('@/lib/models/Entry', () => ({
  find: jest.fn(),
}));

describe('GET /api/entries', () => {
  it('should return entries array', async () => {
    Entry.find.mockResolvedValue([
      { date: '2025-10-17', firstMealTime: '12:00' }
    ]);
    
    const response = await GET();
    const data = await response.json();
    
    expect(data).toHaveLength(1);
  });
});
```

### Mock Next.js Components

```javascript
// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));
```

## Debugging Tests

### Jest

```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log in tests
it('should do something', () => {
  console.log('Debug output:', myVariable);
  expect(myVariable).toBe(42);
});
```

### Playwright

```bash
# Run in debug mode with browser visible
npm run test:e2e:debug

# Use page.pause() to pause execution
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens Playwright Inspector
});
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests (GitHub Actions)
- Before deployment

**CI must pass before merging!**

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
