/**
 * E2E tests for Biological Stages Timeline
 * Tests the complete user journey through different fasting stages
 */

const { test, expect } = require('@playwright/test');

// Helper to set a mock fast with specific elapsed time
async function setMockFast(page, hoursElapsed) {
  const now = new Date();
  const lastMealTime = new Date(now.getTime() - (hoursElapsed * 60 * 60 * 1000));
  
  // Navigate to dashboard and start a fast (or mock the database entry)
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Note: This assumes we have a way to inject test data
  // In real implementation, might need to use test fixtures or API mocking
  await page.evaluate(({ lastMealTime }) => {
    localStorage.setItem('test-fasting-entry', JSON.stringify({
      lastMealTime: lastMealTime,
      isActive: true
    }));
  }, { lastMealTime: lastMealTime.toISOString() });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
}

test.describe('Biological Stages Timeline - User Story 1', () => {
  test.beforeEach(async ({ page }) => {
    // Login or set up authenticated session
    // This depends on your existing auth setup
    await page.goto('/login');
    // Add login steps if needed
  });

  test('US1-AS1: 14-hour fast shows Early Ketosis stage highlighted', async ({ page }) => {
    // Set up 14-hour fast
    await setMockFast(page, 14);
    
    // Verify timeline is visible
    const timeline = page.locator('[data-testid="biological-stages-timeline"]');
    await expect(timeline).toBeVisible();
    
    // Verify Early Ketosis stage is highlighted
    const earlyKetosisStage = page.locator('[data-testid="stage-card-3"]'); // Stage index 3
    await expect(earlyKetosisStage).toBeVisible();
    await expect(earlyKetosisStage).toHaveClass(/border-2/); // Highlighted border
    await expect(earlyKetosisStage).toHaveClass(/border-purple-500/);
    
    // Verify stage title and hour range
    await expect(earlyKetosisStage.locator('text=Early Ketosis')).toBeVisible();
    await expect(earlyKetosisStage.locator('text=12-16 Hours')).toBeVisible();
    
    // Verify progress bar is visible within current stage
    const progressBar = earlyKetosisStage.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    
    // Verify progress is approximately 50% (14hr is 2hr into 12-16hr stage)
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    const progressNum = parseInt(progressValue);
    expect(progressNum).toBeGreaterThan(40);
    expect(progressNum).toBeLessThan(60);
    
    // Verify biological processes are listed
    await expect(earlyKetosisStage.locator('text=Ketone body production')).toBeVisible();
    
    // Verify stages before current are displayed lighter (completed)
    const fedStateStage = page.locator('[data-testid="stage-card-0"]');
    await expect(fedStateStage).toBeVisible();
    await expect(fedStateStage).not.toHaveClass(/border-2/); // Not highlighted
    
    // Verify stages after current are displayed lighter (upcoming)
    const fullKetosisStage = page.locator('[data-testid="stage-card-4"]');
    await expect(fullKetosisStage).toBeVisible();
    await expect(fullKetosisStage).not.toHaveClass(/border-2/); // Not highlighted
  });
});

test.describe('Biological Stages Timeline - User Story 2', () => {
  test.beforeEach(async ({ page }) => {
    // Login or set up authenticated session
    await page.goto('/login');
    // Add login steps if needed
  });

  test('US2-AS2: 14-hour fast shows progress bar at ~50% with text indicator', async ({ page }) => {
    // Set up 14-hour fast (2 hours into 12-16 hour Early Ketosis stage)
    await setMockFast(page, 14);
    
    // Verify timeline is visible
    const timeline = page.locator('[data-testid="biological-stages-timeline"]');
    await expect(timeline).toBeVisible();
    
    // Verify Early Ketosis stage is current
    const earlyKetosisStage = page.locator('[data-testid="stage-card-3"]');
    await expect(earlyKetosisStage).toBeVisible();
    
    // Verify progress bar shows ~50%
    const progressBar = earlyKetosisStage.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    const progressNum = parseInt(progressValue);
    expect(progressNum).toBeGreaterThan(45);
    expect(progressNum).toBeLessThan(55);
    
    // Verify hours into stage text is displayed
    await expect(earlyKetosisStage.locator('text=/2\\.\\d+ hours into this stage/i')).toBeVisible();
    
    // Verify percentage through stage is displayed
    await expect(earlyKetosisStage.locator('text=/50% through this stage/i')).toBeVisible();
  });

  test('US2-AS1: Just entered stage shows 0% progress', async ({ page }) => {
    // Set up exactly 12-hour fast (just entered Early Ketosis)
    await setMockFast(page, 12);
    
    const timeline = page.locator('[data-testid="biological-stages-timeline"]');
    await expect(timeline).toBeVisible();
    
    const earlyKetosisStage = page.locator('[data-testid="stage-card-3"]');
    await expect(earlyKetosisStage).toBeVisible();
    
    // Verify progress bar shows 0%
    const progressBar = earlyKetosisStage.locator('[role="progressbar"]');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressValue)).toBeLessThan(5);
    
    // Verify text shows just started
    await expect(earlyKetosisStage.locator('text=/0\\.\\d+ hours into this stage/i')).toBeVisible();
  });

  test('US2-AS3: Near end of stage shows ~95% progress', async ({ page }) => {
    // Set up 15.8-hour fast (3.8 hours into 12-16 hour stage)
    await setMockFast(page, 15.8);
    
    const timeline = page.locator('[data-testid="biological-stages-timeline"]');
    await expect(timeline).toBeVisible();
    
    const earlyKetosisStage = page.locator('[data-testid="stage-card-3"]');
    await expect(earlyKetosisStage).toBeVisible();
    
    // Verify progress bar shows ~95%
    const progressBar = earlyKetosisStage.locator('[role="progressbar"]');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    const progressNum = parseInt(progressValue);
    expect(progressNum).toBeGreaterThan(90);
    expect(progressNum).toBeLessThan(100);
    
    // Verify text shows hours into stage
    await expect(earlyKetosisStage.locator('text=/3\\.8 hours into this stage/i')).toBeVisible();
  });

  test('US2-AS4: Long stage (30hr in 24-48hr stage) shows 25% progress', async ({ page }) => {
    // Set up 30-hour fast (6 hours into 24-48 hour Autophagy Activation stage)
    await setMockFast(page, 30);
    
    const timeline = page.locator('[data-testid="biological-stages-timeline"]');
    await expect(timeline).toBeVisible();
    
    const autophagyStage = page.locator('[data-testid="stage-card-6"]'); // Stage index 6
    await expect(autophagyStage).toBeVisible();
    
    // Verify progress bar shows ~25%
    const progressBar = autophagyStage.locator('[role="progressbar"]');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    const progressNum = parseInt(progressValue);
    expect(progressNum).toBeGreaterThan(20);
    expect(progressNum).toBeLessThan(30);
    
    // Verify text shows 6 hours into stage
    await expect(autophagyStage.locator('text=/6\\.\\d+ hours into this stage/i')).toBeVisible();
    
    // Verify percentage shows ~25%
    await expect(autophagyStage.locator('text=/25% through this stage/i')).toBeVisible();
  });
});
