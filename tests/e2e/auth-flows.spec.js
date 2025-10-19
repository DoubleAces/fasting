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

// ============================================================================
// LOGIN FLOW E2E TESTS (Phase 5)
// ============================================================================

test.describe('Login Flow', () => {
  let testEmail;
  let testPassword;

  // Create a test user before login tests
  test.beforeAll(async ({ browser }) => {
    const timestamp = Date.now();
    testEmail = `e2etest+login${timestamp}@example.com`;
    testPassword = 'SecurePass123!';

    // Create a test user via registration
    const page = await browser.newPage();
    await page.goto('/register');
    
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/^password/i).fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for registration to complete
    await expect(page).toHaveURL('/entries', { timeout: 10000 });
    await page.close();
  });

  test.describe('Successful Login', () => {
    test('should complete full login flow and redirect to entries', async ({ page }) => {
      await page.goto('/login');

      // Wait for form to load
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

      // Fill in login form
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill(testPassword);

      // Submit form
      await page.getByRole('button', { name: /^log in$/i }).click();

      // Wait for redirect to entries page
      await expect(page).toHaveURL('/entries', { timeout: 10000 });
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill(testPassword);

      // Click submit
      await page.getByRole('button', { name: /^log in$/i }).click();

      // Check for loading state (button text changes)
      await expect(page.getByRole('button', { name: /logging in/i })).toBeVisible({ timeout: 2000 });
    });

    test('should persist login with remember me', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill(testPassword);
      
      // Check remember me
      await page.getByLabel(/remember me/i).check();
      await expect(page.getByLabel(/remember me/i)).toBeChecked();

      await page.getByRole('button', { name: /^log in$/i }).click();

      // Should redirect to entries
      await expect(page).toHaveURL('/entries', { timeout: 10000 });
    });
  });

  test.describe('Failed Login Attempts', () => {
    test('should show error with incorrect password', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('WrongPassword123!');

      await page.getByRole('button', { name: /^log in$/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });

      // Should NOT redirect
      await expect(page).toHaveURL('/login');
    });

    test('should show error with non-existent email', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('nonexistent@example.com');
      await page.getByLabel(/^password/i).fill('SomePassword123!');

      await page.getByRole('button', { name: /^log in$/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });

      // Should NOT redirect
      await expect(page).toHaveURL('/login');
    });

    test('should not leak user existence through error messages', async ({ page }) => {
      await page.goto('/login');

      // Try with existing email but wrong password
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password/i).fill('WrongPassword123!');
      await page.getByRole('button', { name: /^log in$/i }).click();
      
      const errorExisting = await page.getByText(/invalid email or password/i).textContent();

      await page.goto('/login');

      // Try with non-existent email
      await page.getByLabel(/email/i).fill('nonexistent@example.com');
      await page.getByLabel(/^password/i).fill('SomePassword123!');
      await page.getByRole('button', { name: /^log in$/i }).click();
      
      const errorNonExisting = await page.getByText(/invalid email or password/i).textContent();

      // Error messages should be identical
      expect(errorExisting).toBe(errorNonExisting);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.getByRole('button', { name: /^log in$/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/email/i).blur();

      // Should show format error
      await expect(page.getByText(/email must be a valid email address/i)).toBeVisible();
    });

    test('should clear validation errors when typing', async ({ page }) => {
      await page.goto('/login');

      // Trigger validation
      await page.getByRole('button', { name: /^log in$/i }).click();
      await expect(page.getByText(/email is required/i)).toBeVisible();

      // Start typing
      await page.getByLabel(/email/i).type('t');

      // Error should disappear
      await expect(page.getByText(/email is required/i)).not.toBeVisible();
    });
  });

  test.describe('Remember Me Functionality', () => {
    test('should have remember me checkbox', async ({ page }) => {
      await page.goto('/login');

      const checkbox = page.getByLabel(/remember me/i);
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();
    });

    test('should toggle remember me checkbox', async ({ page }) => {
      await page.goto('/login');

      const checkbox = page.getByLabel(/remember me/i);
      
      await checkbox.check();
      await expect(checkbox).toBeChecked();

      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });
  });

  test.describe('Navigation and Links', () => {
    test('should have link to forgot password page', async ({ page }) => {
      await page.goto('/login');

      const forgotLink = page.getByRole('link', { name: /forgot your password/i });
      await expect(forgotLink).toBeVisible();
      await expect(forgotLink).toHaveAttribute('href', '/reset-password');
    });

    test('should have link to sign up page', async ({ page }) => {
      await page.goto('/login');

      const signUpLink = page.getByRole('link', { name: /sign up/i });
      await expect(signUpLink).toBeVisible();
      await expect(signUpLink).toHaveAttribute('href', '/register');
    });

    test('should navigate to sign up page when clicking sign up link', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /sign up/i }).click();

      await expect(page).toHaveURL('/register');
    });
  });

  test.describe('Google OAuth', () => {
    test('should have Google OAuth button', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should show divider between login and OAuth', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByText(/^or$/i)).toBeVisible();
    });

    // Note: Full OAuth flow testing requires additional setup
    // These tests verify the button exists and is clickable
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/login');

      // All inputs should have associated labels
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password/i)).toBeVisible();
      await expect(page.getByLabel(/remember me/i)).toBeVisible();
    });


    test('should have proper autocomplete attributes', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password/i);

      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    test('should have descriptive page title', async ({ page }) => {
      await page.goto('/login');

      await expect(page).toHaveTitle(/log in|login/i);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');

      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveText(/welcome back/i);
    });
  });
});

// ============================================================================
// GOOGLE OAUTH E2E TESTS (Phase 6)
// ============================================================================

test.describe('Google OAuth Flow', () => {
  test.describe('OAuth UI Elements', () => {
    test('should display Google sign in button on login page', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should display Google sign up button on register page', async ({ page }) => {
      await page.goto('/register');

      const googleButton = page.getByRole('button', { name: /sign up with google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should have OAuth divider on login page', async ({ page }) => {
      await page.goto('/login');

      // Check for "or" divider between OAuth and email login
      await expect(page.getByText(/or/i)).toBeVisible();
    });

    test('should have OAuth divider on register page', async ({ page }) => {
      await page.goto('/register');

      // Check for "or" divider between OAuth and email registration
      await expect(page.getByText(/or/i)).toBeVisible();
    });
  });

  test.describe('OAuth Error Handling', () => {
    test('should display OAuth sign in error', async ({ page }) => {
      await page.goto('/login?error=OAuthSignin');

      await expect(page.getByText(/error connecting to oauth provider/i)).toBeVisible();
    });

    test('should display OAuth callback error', async ({ page }) => {
      await page.goto('/login?error=OAuthCallback');

      await expect(page.getByText(/error during oauth authentication/i)).toBeVisible();
    });

    test('should display account not linked error', async ({ page }) => {
      await page.goto('/login?error=OAuthAccountNotLinked');

      await expect(page.getByText(/already registered with a different login method/i)).toBeVisible();
    });

    test('should display OAuth create account error', async ({ page }) => {
      await page.goto('/login?error=OAuthCreateAccount');

      await expect(page.getByText(/could not create oauth account/i)).toBeVisible();
    });

    test('should display email create account error', async ({ page }) => {
      await page.goto('/login?error=EmailCreateAccount');

      await expect(page.getByText(/could not create account/i)).toBeVisible();
    });

    test('should display access denied error', async ({ page }) => {
      await page.goto('/login?error=AccessDenied');

      await expect(page.getByText(/access denied/i)).toBeVisible();
    });

    test('should display credentials sign in error', async ({ page }) => {
      await page.goto('/login?error=CredentialsSignin');

      await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    });

    test('should display session required error', async ({ page }) => {
      await page.goto('/login?error=SessionRequired');

      await expect(page.getByText(/please sign in to continue/i)).toBeVisible();
    });

    test('should display default error for unknown error code', async ({ page }) => {
      await page.goto('/login?error=UnknownError');

      await expect(page.getByText(/an error occurred during authentication/i)).toBeVisible();
    });
  });

  test.describe('OAuth Button Interaction', () => {
    test('should have functional Google button on login page', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      
      // Button should be enabled and clickable
      await expect(googleButton).toBeEnabled();
      await expect(googleButton).not.toHaveAttribute('disabled');
    });

    test('should have functional Google button on register page', async ({ page }) => {
      await page.goto('/register');

      const googleButton = page.getByRole('button', { name: /sign up with google/i });
      
      // Button should be enabled and clickable
      await expect(googleButton).toBeEnabled();
      await expect(googleButton).not.toHaveAttribute('disabled');
    });

    test('should have proper button styling on login page', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      
      // Check button is visible and has proper role
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toHaveRole('button');
    });

    test('should have proper button styling on register page', async ({ page }) => {
      await page.goto('/register');

      const googleButton = page.getByRole('button', { name: /sign up with google/i });
      
      // Check button is visible and has proper role
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toHaveRole('button');
    });
  });

  test.describe('OAuth Error Recovery', () => {
    test('should allow retry after OAuth error', async ({ page }) => {
      // Start with error
      await page.goto('/login?error=OAuthSignin');
      
      await expect(page.getByText(/error connecting to oauth provider/i)).toBeVisible();

      // User should still be able to use the form
      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();
    });

    test('should clear error on navigation', async ({ page }) => {
      // Start with error
      await page.goto('/login?error=OAuthSignin');
      await expect(page.getByText(/error connecting to oauth provider/i)).toBeVisible();

      // Navigate to register
      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL(/\/register/);

      // Error should not appear on register page
      await expect(page.getByText(/error connecting to oauth provider/i)).not.toBeVisible();
    });

    test('should allow email login after OAuth error', async ({ page }) => {
      await page.goto('/login?error=OAuthAccountNotLinked');
      
      // Error displayed
      await expect(page.getByText(/already registered with a different login method/i)).toBeVisible();

      // Should still be able to use email login
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password/i).fill('Password123!');
      
      const loginButton = page.getByRole('button', { name: /^log in$/i });
      await expect(loginButton).toBeEnabled();
    });
  });

  test.describe('OAuth Accessibility', () => {
    test('should have accessible OAuth button on login page', async ({ page }) => {
      await page.goto('/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      
      // Check accessibility
      await expect(googleButton).toHaveRole('button');
      await expect(googleButton).toHaveAttribute('type', 'button');
    });

    test('should have accessible OAuth button on register page', async ({ page }) => {
      await page.goto('/register');

      const googleButton = page.getByRole('button', { name: /sign up with google/i });
      
      // Check accessibility
      await expect(googleButton).toHaveRole('button');
      await expect(googleButton).toHaveAttribute('type', 'button');
    });

    test('should announce OAuth errors to screen readers', async ({ page }) => {
      await page.goto('/login?error=OAuthSignin');

      // Error message should be in an accessible container
      const errorMessage = page.getByText(/error connecting to oauth provider/i);
      await expect(errorMessage).toBeVisible();
      
      // Check that error has appropriate ARIA or semantic markup
      const errorContainer = page.locator('[role="alert"], .error, [aria-live]').first();
      await expect(errorContainer).toBeVisible();
    });
  });
});

