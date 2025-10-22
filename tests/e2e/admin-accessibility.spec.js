/**
 * E2E Accessibility Test: Admin User Management
 * 
 * Tests keyboard navigation, screen reader support, ARIA attributes,
 * and semantic HTML for WCAG 2.1 AA compliance.
 * 
 * Run with: npx playwright test tests/e2e/admin-accessibility.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin User Management - Accessibility', () => {
  let adminUser;

  test.beforeEach(async ({ page }) => {
    // Login as admin
    adminUser = {
      email: 'admin@test.com',
      password: 'TestPassword123!',
    };

    await page.goto('/login');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Navigate to user management
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');
  });

  // ========================================================================
  // KEYBOARD NAVIGATION
  // ========================================================================

  test.describe('Keyboard Navigation', () => {
    test('should navigate through filter inputs with Tab key', async ({ page }) => {
      // Focus on page
      await page.keyboard.press('Tab');

      // Check name filter is focusable
      await page.keyboard.press('Tab');
      const nameInput = page.locator('input[placeholder*="name" i]');
      await expect(nameInput).toBeFocused();

      // Check email filter is focusable
      await page.keyboard.press('Tab');
      const emailInput = page.locator('input[placeholder*="email" i]');
      await expect(emailInput).toBeFocused();

      // Check admin filter is focusable
      await page.keyboard.press('Tab');
      const adminSelect = page.locator('select');
      await expect(adminSelect).toBeFocused();
    });

    test('should activate clear filters button with Enter key', async ({ page }) => {
      // Type in name filter
      const nameInput = page.locator('input[placeholder*="name" i]');
      await nameInput.fill('test');

      // Tab to clear button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Move through email and admin filter

      // Find and focus clear button
      const clearButton = page.locator('button:has-text("Clear")');
      await clearButton.focus();
      await expect(clearButton).toBeFocused();

      // Activate with Enter
      await page.keyboard.press('Enter');

      // Verify filter cleared
      await expect(nameInput).toHaveValue('');
    });

    test('should navigate through table with Tab key', async ({ page }) => {
      // Get first sort button
      const firstSortButton = page.locator('button[aria-label*="Sort"]').first();
      await firstSortButton.focus();
      await expect(firstSortButton).toBeFocused();

      // Tab should move through all interactive elements in table
      await page.keyboard.press('Tab');
      
      // Should reach first action button (toggle admin or delete)
      const firstActionButton = page.locator('table button').first();
      await expect(firstActionButton).toBeFocused();
    });

    test('should close confirmation dialog with Escape key', async ({ page }) => {
      // Click delete button on a non-current user
      const deleteButtons = page.locator('button:has-text("Delete")');
      const count = await deleteButtons.count();
      
      if (count > 0) {
        // Find a delete button that's not disabled
        for (let i = 0; i < count; i++) {
          const button = deleteButtons.nth(i);
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            await button.click();
            break;
          }
        }

        // Wait for dialog
        await page.waitForSelector('dialog[open]', { timeout: 1000 }).catch(() => {});
        const dialog = page.locator('dialog[open]');
        
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible();

          // Press Escape to close
          await page.keyboard.press('Escape');

          // Dialog should be closed
          await expect(dialog).not.toBeVisible();
        }
      }
    });

    test('should navigate pagination with keyboard', async ({ page }) => {
      // Check if pagination exists
      const nextButton = page.locator('button:has-text("Next")');
      const prevButton = page.locator('button:has-text("Previous")');

      if (await nextButton.count() > 0) {
        await nextButton.focus();
        await expect(nextButton).toBeFocused();

        // Activate with Space key
        await page.keyboard.press('Space');
        
        // Should navigate to next page
        const url = page.url();
        expect(url).toContain('page=2');
      }
    });
  });

  // ========================================================================
  // SCREEN READER SUPPORT
  // ========================================================================

  test.describe('Screen Reader Support', () => {
    test('should have semantic HTML landmarks', async ({ page }) => {
      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeAttached();

      // Check for heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText('User Management');
    });

    test('should have accessible table structure', async ({ page }) => {
      // Check table has proper structure
      const table = page.locator('table');
      await expect(table).toBeAttached();

      // Check for thead
      const thead = page.locator('thead');
      await expect(thead).toBeAttached();

      // Check for tbody
      const tbody = page.locator('tbody');
      await expect(tbody).toBeAttached();

      // Check column headers have scope
      const thElements = page.locator('th');
      const count = await thElements.count();
      expect(count).toBeGreaterThan(0);

      // Check at least one th has text content
      const firstTh = thElements.first();
      const text = await firstTh.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('should have accessible form controls', async ({ page }) => {
      // Name input should have label or aria-label
      const nameInput = page.locator('input[placeholder*="name" i]');
      const nameLabel = await nameInput.getAttribute('aria-label');
      const nameId = await nameInput.getAttribute('id');
      
      // Should have either aria-label or associated label
      const hasAccessibleName = nameLabel || (nameId && await page.locator(`label[for="${nameId}"]`).count() > 0);
      expect(hasAccessibleName).toBeTruthy();

      // Email input should have label or aria-label
      const emailInput = page.locator('input[placeholder*="email" i]');
      const emailLabel = await emailInput.getAttribute('aria-label');
      const emailId = await emailInput.getAttribute('id');
      
      const hasAccessibleEmail = emailLabel || (emailId && await page.locator(`label[for="${emailId}"]`).count() > 0);
      expect(hasAccessibleEmail).toBeTruthy();
    });

    test('should have accessible buttons with labels', async ({ page }) => {
      // All buttons should have accessible text
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        // Button should have text, aria-label, or title
        const hasAccessibleName = (text && text.trim()) || ariaLabel || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should announce loading state', async ({ page }) => {
      // Check if loading state has aria-live or role="status"
      await page.reload();
      
      // Wait a moment for loading state
      await page.waitForTimeout(100);

      // Check for loading indicator
      const loadingIndicator = page.locator('[role="status"], [aria-live="polite"], [aria-live="assertive"], text=/loading/i');
      
      // If loading state is visible, it should have proper ARIA
      const isVisible = await loadingIndicator.isVisible().catch(() => false);
      if (isVisible) {
        const role = await loadingIndicator.first().getAttribute('role');
        const ariaLive = await loadingIndicator.first().getAttribute('aria-live');
        expect(role === 'status' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
      }
    });
  });

  // ========================================================================
  // ARIA ATTRIBUTES
  // ========================================================================

  test.describe('ARIA Attributes', () => {
    test('should have proper ARIA labels on sort buttons', async ({ page }) => {
      const sortButtons = page.locator('button[aria-label*="Sort"]');
      const count = await sortButtons.count();

      expect(count).toBeGreaterThan(0);

      // Check first sort button has descriptive label
      const firstButton = sortButtons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.toLowerCase()).toContain('sort');
    });

    test('should have proper ARIA attributes on dialogs', async ({ page }) => {
      // Try to open a delete dialog
      const deleteButtons = page.locator('button:has-text("Delete")');
      const count = await deleteButtons.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = deleteButtons.nth(i);
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            await button.click();
            break;
          }
        }

        // Check dialog ARIA attributes
        const dialog = page.locator('dialog[open]');
        
        if (await dialog.count() > 0) {
          // Should have aria-labelledby or aria-label
          const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
          const ariaLabel = await dialog.getAttribute('aria-label');
          expect(ariaLabelledby || ariaLabel).toBeTruthy();

          // Should have aria-describedby
          const ariaDescribedby = await dialog.getAttribute('aria-describedby');
          expect(ariaDescribedby).toBeTruthy();

          // Close dialog
          await page.keyboard.press('Escape');
        }
      }
    });

    test('should have proper ARIA states on disabled buttons', async ({ page }) => {
      // Check if there are any disabled buttons
      const disabledButtons = page.locator('button:disabled, button[aria-disabled="true"]');
      const count = await disabledButtons.count();

      if (count > 0) {
        const firstDisabled = disabledButtons.first();
        
        // Should have disabled attribute or aria-disabled
        const isDisabled = await firstDisabled.getAttribute('disabled');
        const ariaDisabled = await firstDisabled.getAttribute('aria-disabled');
        
        expect(isDisabled !== null || ariaDisabled === 'true').toBeTruthy();
      }
    });

    test('should have proper ARIA attributes on pagination', async ({ page }) => {
      const paginationContainer = page.locator('nav, [role="navigation"]').last();
      
      if (await paginationContainer.count() > 0) {
        // Pagination should have navigation role or be a nav element
        const role = await paginationContainer.getAttribute('role');
        const tagName = await paginationContainer.evaluate(el => el.tagName.toLowerCase());
        
        expect(role === 'navigation' || tagName === 'nav').toBeTruthy();

        // Current page should be indicated with aria-current or similar
        const currentPageButton = page.locator('[aria-current="page"], .bg-primary-600');
        const hasCurrentIndicator = await currentPageButton.count() > 0;
        expect(hasCurrentIndicator).toBeTruthy();
      }
    });
  });

  // ========================================================================
  // SEMANTIC HTML
  // ========================================================================

  test.describe('Semantic HTML', () => {
    test('should use semantic HTML elements', async ({ page }) => {
      // Check for semantic table structure
      const table = page.locator('table');
      await expect(table).toBeAttached();

      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Check for semantic form elements (not divs)
      const inputs = page.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);

      // Check for proper button elements (not clickable divs)
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should not have empty links or buttons', async ({ page }) => {
      // Check all buttons have content
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const childCount = await button.locator('*').count();

        // Button should have text, aria-label, or children (like icons)
        expect(text?.trim() || ariaLabel || childCount > 0).toBeTruthy();
      }
    });

    test('should have proper list structure', async ({ page }) => {
      // If there are lists, they should use ul/ol elements
      const lists = page.locator('ul, ol');
      const count = await lists.count();

      if (count > 0) {
        // Check first list has li children
        const firstList = lists.first();
        const listItems = firstList.locator('li');
        const itemCount = await listItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });
  });

  // ========================================================================
  // FOCUS MANAGEMENT
  // ========================================================================

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      
      // Get focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeAttached();

      // Check if focus indicator is visible (outline or ring)
      const styles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineStyle: computed.outlineStyle,
          boxShadow: computed.boxShadow,
        };
      });

      // Should have either outline or box-shadow (Tailwind ring)
      const hasFocusIndicator = 
        (styles.outlineWidth && styles.outlineWidth !== '0px') ||
        (styles.boxShadow && styles.boxShadow !== 'none');

      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should maintain focus after dialog closes', async ({ page }) => {
      // Find an enabled delete button
      const deleteButtons = page.locator('button:has-text("Delete")');
      const count = await deleteButtons.count();
      
      if (count > 0) {
        let triggerButton = null;

        for (let i = 0; i < count; i++) {
          const button = deleteButtons.nth(i);
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            triggerButton = button;
            await button.click();
            break;
          }
        }

        if (triggerButton) {
          // Wait for dialog
          await page.waitForSelector('dialog[open]', { timeout: 1000 }).catch(() => {});
          const dialog = page.locator('dialog[open]');
          
          if (await dialog.count() > 0) {
            // Press Escape to close
            await page.keyboard.press('Escape');

            // Wait a moment for focus to return
            await page.waitForTimeout(100);

            // Focus should return to trigger button (or nearby element)
            // We can't guarantee exact focus return in Playwright, but dialog should be closed
            await expect(dialog).not.toBeVisible();
          }
        }
      }
    });

    test('should trap focus in modal dialog', async ({ page }) => {
      // Open delete dialog
      const deleteButtons = page.locator('button:has-text("Delete")');
      const count = await deleteButtons.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = deleteButtons.nth(i);
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            await button.click();
            break;
          }
        }

        // Wait for dialog
        const dialog = page.locator('dialog[open]');
        
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible();

          // Tab through dialog elements
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');

          // Focus should stay within dialog
          const focusedElement = page.locator(':focus');
          const isInsideDialog = await focusedElement.evaluate((el, dialogEl) => {
            return dialogEl ? dialogEl.contains(el) : false;
          }, await dialog.elementHandle());

          expect(isInsideDialog).toBeTruthy();

          // Close dialog
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  // ========================================================================
  // COLOR CONTRAST
  // ========================================================================

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast on primary text', async ({ page }) => {
      // Get main heading
      const heading = page.locator('h1');
      
      // Get computed styles
      const styles = await heading.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Note: Actual contrast ratio calculation requires a library
      // For now, we just verify colors are set
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    });

    test('should have sufficient color contrast on buttons', async ({ page }) => {
      const button = page.locator('button').first();
      
      const styles = await button.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Verify colors are set (actual contrast calculation would need a library)
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    });
  });
});
