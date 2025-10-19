/**
 * E2E Tests: Authentication Flows - Registration
 * 
 * Test coverage:
 * - Complete registration flow
 * - Duplicate email handling
 * - Password validation
 * - Form validation errors
 * - Auto-login after registration
 * - Redirect to dashboard
 */

const { test, expect } = require('@playwright/test');

test.describe('Registration Flow', () => {
  test.describe('Successful Registration', () => {
    test('should complete full registration flow and redirect to entries', async ({ page }) => {
      // Generate unique email for this test
      const timestamp = Date.now();
      const testEmail = `e2etest+${timestamp}@example.com`;

      // Navigate to registration page
      await page.goto('/register');

      // Wait for form to load
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

      // Fill in registration form
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^name/i).fill('E2E Test User');
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');

      // Submit form
      await page.getByRole('button', { name: /create account/i }).click();

      // Wait for redirect to entries page (after auto-login)
      await expect(page).toHaveURL('/entries', { timeout: 10000 });

      // Verify we're logged in by checking for user-specific content
      // (This would depend on your entries page structure)
      await expect(page).toHaveURL(/\/entries/);
    });

    test('should register without optional name field', async ({ page }) => {
      const timestamp = Date.now();
      const testEmail = `e2etest+noname${timestamp}@example.com`;

      await page.goto('/register');

      // Fill only required fields
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');

      await page.getByRole('button', { name: /create account/i }).click();

      // Should still successfully register and redirect
      await expect(page).toHaveURL('/entries', { timeout: 10000 });
    });

    test('should show loading state during registration', async ({ page }) => {
      const timestamp = Date.now();
      const testEmail = `e2etest+loading${timestamp}@example.com`;

      await page.goto('/register');

      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');

      // Click submit
      await page.getByRole('button', { name: /create account/i }).click();

      // Check for loading state (button text changes)
      await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Duplicate Email Handling', () => {
    test('should show error when registering with existing email', async ({ page }) => {
      // First, register a user
      const timestamp = Date.now();
      const testEmail = `e2etest+duplicate${timestamp}@example.com`;

      await page.goto('/register');

      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      // Wait for successful registration
      await expect(page).toHaveURL('/entries', { timeout: 10000 });

      // Log out (you'll need to implement logout functionality)
      // For now, just go back to register page in a new context
      await page.goto('/register');

      // Try to register with same email
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('DifferentPass123!');
      await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      // Should show error message
      await expect(page.getByText(/email already exists|already registered/i)).toBeVisible({ timeout: 5000 });

      // Should stay on registration page
      await expect(page).toHaveURL('/register');
    });

    test('should handle duplicate email case-insensitively', async ({ page }) => {
      const timestamp = Date.now();
      const testEmail = `e2etest+case${timestamp}@example.com`;

      // Register with lowercase email
      await page.goto('/register');

      await page.getByLabel(/email/i).fill(testEmail.toLowerCase());
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page).toHaveURL('/entries', { timeout: 10000 });

      // Try to register with uppercase email
      await page.goto('/register');

      await page.getByLabel(/email/i).fill(testEmail.toUpperCase());
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      // Should show error
      await expect(page.getByText(/email already exists|already registered/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Password Validation', () => {
    test('should show error for weak password (too short)', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('Short1');
      await page.getByLabel(/confirm password/i).fill('Short1');
      await page.getByRole('button', { name: /create account/i }).click();

      // Should show validation error
      await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
    });

    test('should show error for password without uppercase', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('lowercase123');
      await page.getByLabel(/confirm password/i).fill('lowercase123');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/password must contain.*uppercase/i)).toBeVisible();
    });

    test('should show error for password without lowercase', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('UPPERCASE123');
      await page.getByLabel(/confirm password/i).fill('UPPERCASE123');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/password must contain.*lowercase/i)).toBeVisible();
    });

    test('should show error for password without number', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('NoNumbersHere');
      await page.getByLabel(/confirm password/i).fill('NoNumbersHere');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/password must contain.*number/i)).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should display password strength indicator', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.getByLabel(/^password/i);

      // Type weak password
      await passwordInput.fill('Pass123');
      await expect(page.getByText(/password strength.*weak/i)).toBeVisible();

      // Type medium password
      await passwordInput.fill('SecurePass123');
      await expect(page.getByText(/password strength.*medium/i)).toBeVisible();

      // Type strong password
      await passwordInput.fill('SecurePass123!@#');
      await expect(page.getByText(/password strength.*strong/i)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/email must be a valid email/i)).toBeVisible();
    });

    test('should show errors for all empty required fields', async ({ page }) => {
      await page.goto('/register');

      // Submit empty form
      await page.getByRole('button', { name: /create account/i }).click();

      // Should show multiple validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test('should show error for name exceeding max length', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^name/i).fill('a'.repeat(101)); // 101 characters
      await page.getByLabel(/^password/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/name cannot exceed 100 characters/i)).toBeVisible();
    });

    test('should clear errors when user starts typing', async ({ page }) => {
      await page.goto('/register');

      // Submit to trigger validation
      await page.getByRole('button', { name: /create account/i }).click();

      // Verify error appears
      await expect(page.getByText(/email is required/i)).toBeVisible();

      // Start typing in email field
      await page.getByLabel(/email/i).type('t');

      // Error should disappear
      await expect(page.getByText(/email is required/i)).not.toBeVisible();
    });
  });

  test.describe('Navigation and Links', () => {
    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');

      const loginLink = page.getByRole('link', { name: /log in/i });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('should navigate to login page when clicking login link', async ({ page }) => {
      await page.goto('/register');

      await page.getByRole('link', { name: /log in/i }).click();

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/register');

      // All inputs should have associated labels
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^name/i)).toBeVisible();
      await expect(page.getByLabel(/^password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    });

    test('should have proper autocomplete attributes', async ({ page }) => {
      await page.goto('/register');

      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password/i);
      const nameInput = page.getByLabel(/^name/i);

      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
      await expect(nameInput).toHaveAttribute('autocomplete', 'name');
    });

    test('should have descriptive page title', async ({ page }) => {
      await page.goto('/register');

      await expect(page).toHaveTitle(/create account|register/i);
    });
  });
});
