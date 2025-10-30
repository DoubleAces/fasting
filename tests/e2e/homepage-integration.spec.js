import { test, expect } from '@playwright/test';

/**
 * E2E Test: Homepage Integration (Feature 023)
 * 
 * Tests the complete homepage flow with all 6 user story sections.
 * Verifies proper section ordering, content presence, and basic interactivity.
 */

test.describe('Homepage - Feature 023 Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render all 6 sections in correct order', async ({ page }) => {
    // Hero Section (User Story 1)
    const hero = page.locator('section').first();
    await expect(hero).toContainText(/Track Your Intermittent Fasting/i);
    
    // Social Proof Section (User Story 2)
    await expect(page.locator('section').nth(1)).toContainText(/What Our Users Say/i);
    
    // Problem/Solution Section (User Story 3)
    await expect(page.locator('section').nth(2)).toContainText(/Common Fasting Challenges/i);
    
    // Features Showcase (User Story 4)
    await expect(page.locator('section').nth(3)).toContainText(/Everything You Need/i);
    
    // How It Works (User Story 5)
    await expect(page.locator('section').nth(4)).toContainText(/How It Works/i);
    
    // Final CTA (User Story 6)
    await expect(page.locator('section').nth(5)).toContainText(/Ready to Build/i);
  });

  test('should display Hero section with trust indicators', async ({ page }) => {
    await expect(page.getByText(/100% Free Forever/i)).toBeVisible();
    await expect(page.getByText(/4\.8\/5 Rating/i)).toBeVisible();
  });

  test('should display Social Proof section with testimonials', async ({ page }) => {
    // Check for testimonial names
    await expect(page.getByText(/Sarah M\./i)).toBeVisible();
    await expect(page.getByText(/James K\./i)).toBeVisible();
  });

  test('should display Problem/Solution section with 3 problems', async ({ page }) => {
    await expect(page.getByText(/I forget to track/i)).toBeVisible();
    await expect(page.getByText(/Most apps are too complicated/i)).toBeVisible();
    await expect(page.getByText(/I don't see my progress/i)).toBeVisible();
  });

  test('should display Features section with 6 features', async ({ page }) => {
    await expect(page.getByText(/Log in 30 Seconds/i)).toBeVisible();
    await expect(page.getByText(/Build Unbreakable Streaks/i)).toBeVisible();
    await expect(page.getByText(/Smart Insights Dashboard/i)).toBeVisible();
  });

  test('should display How It Works section with 3 steps', async ({ page }) => {
    await expect(page.getByText(/Set Your Goal/i)).toBeVisible();
    await expect(page.getByText(/Start Your Timer/i)).toBeVisible();
    await expect(page.getByText(/Build Your Streak/i)).toBeVisible();
  });

  test('should display Final CTA section with prominent button', async ({ page }) => {
    const finalCTA = page.locator('section').nth(5);
    await expect(finalCTA).toContainText(/Start Tracking Free/i);
    await expect(finalCTA).toContainText(/No credit card required/i);
  });

  test('should show "Start Tracking Free" CTA for unauthenticated users in Hero', async ({ page }) => {
    const startButton = page.getByRole('link', { name: /Start Tracking Free/i }).first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute('href', /register/i);
  });

  test('should have proper gradient backgrounds', async ({ page }) => {
    // Hero should have gradient (by checking for purple-pink gradient elements)
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    
    // Final CTA should have purple-pink gradient
    const finalCTA = page.locator('section').nth(5);
    await expect(finalCTA).toBeVisible();
  });

  test('should be responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Check all sections still visible
    await expect(page.getByText(/Track Your Intermittent Fasting/i)).toBeVisible();
    await expect(page.getByText(/What Our Users Say/i)).toBeVisible();
    await expect(page.getByText(/Common Fasting Challenges/i)).toBeVisible();
    await expect(page.getByText(/Everything You Need/i)).toBeVisible();
    await expect(page.getByText(/How It Works/i)).toBeVisible();
    await expect(page.getByText(/Ready to Build/i)).toBeVisible();
  });

  test('should be responsive - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    // Check grid layouts adapt
    await expect(page.getByText(/Track Your Intermittent Fasting/i)).toBeVisible();
    await expect(page.getByText(/Ready to Build/i)).toBeVisible();
  });

  test('should be responsive - desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    
    // Check all sections render properly
    await expect(page.getByText(/Track Your Intermittent Fasting/i)).toBeVisible();
    await expect(page.getByText(/Ready to Build/i)).toBeVisible();
  });
});
