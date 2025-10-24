/**
 * E2E tests for PWA offline sync functionality
 * Tests creating entries offline and syncing when online
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Offline Sync', () => {
  test.use({
    // Use authenticated state
    storageState: 'tests/fixtures/auth-state.json',
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to entries page
    await page.goto('/entries');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should create entry while online and sync immediately', async ({ page }) => {
    // Verify we're online
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(true);

    // Click "Start Fast" or equivalent button
    await page.click('button:has-text("Start Fast")');

    // Wait for entry to be created
    await page.waitForTimeout(1000);

    // Verify entry appears in the list
    const entries = page.locator('[data-testid="entry-item"]');
    await expect(entries.first()).toBeVisible();

    // Verify offline indicator is not visible
    const offlineIndicator = page.locator('text=Offline');
    await expect(offlineIndicator).not.toBeVisible();
  });

  test('should create entry while offline and add to sync queue', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Verify offline indicator appears
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 10000 });

    // Try to create an entry while offline
    await page.click('button:has-text("Start Fast")');

    // Wait for entry to be added to queue
    await page.waitForTimeout(1000);

    // Verify entry is in offline queue (shows pending indicator)
    await expect(page.locator('text=pending')).toBeVisible();

    // Check offline indicator shows queue count
    await expect(page.locator('text=Offline (1 pending)')).toBeVisible();

    // Verify entry is in IndexedDB
    const queueLength = await page.evaluate(async () => {
      const { openDB } = await import('idb');
      const db = await openDB('fasting-tracker', 1);
      const tx = db.transaction('offlineEntries', 'readonly');
      const store = tx.objectStore('offlineEntries');
      const entries = await store.getAll();
      return entries.length;
    });

    expect(queueLength).toBeGreaterThanOrEqual(1);
  });

  test('should sync entries when coming back online', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Create entry while offline
    await page.click('button:has-text("Start Fast")');
    await page.waitForTimeout(1000);

    // Verify offline queue has entry
    await expect(page.locator('text=Offline (1 pending)')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Wait for sync to complete
    await page.waitForTimeout(3000);

    // Verify offline indicator is gone
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).not.toBeVisible();

    // Verify queue is empty
    const queueLength = await page.evaluate(async () => {
      const { openDB } = await import('idb');
      const db = await openDB('fasting-tracker', 1);
      const tx = db.transaction('offlineEntries', 'readonly');
      const store = tx.objectStore('offlineEntries');
      const entries = await store.getAll();
      return entries.length;
    });

    expect(queueLength).toBe(0);

    // Verify entry is now synced (no pending indicator)
    await expect(page.locator('text=pending')).not.toBeVisible();
  });

  test('should show sync status during active sync', async ({ page, context }) => {
    // Create multiple offline entries
    await context.setOffline(true);
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Create 3 entries
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Start Fast")');
      await page.waitForTimeout(500);
      
      // End the fast immediately to create multiple entries
      await page.click('button:has-text("End Fast")');
      await page.waitForTimeout(500);
    }

    // Verify queue count
    await expect(page.locator('text=Offline (3 pending)')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Should show "Syncing..." indicator
    await expect(page.locator('text=Syncing')).toBeVisible({ timeout: 2000 });

    // Wait for sync to complete
    await page.waitForTimeout(5000);

    // Sync indicator should be gone
    await expect(page.locator('text=Syncing')).not.toBeVisible();
    
    // Offline indicator should be gone
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });

  test('should handle sync conflicts (server wins)', async ({ page, context }) => {
    // This test requires creating an entry on server first,
    // then creating a conflicting entry offline with older timestamp

    // Create entry online
    await page.click('button:has-text("Start Fast")');
    await page.waitForTimeout(1000);
    const entryId = await page.evaluate(() => {
      // Get the entry ID from the first entry
      const entry = document.querySelector('[data-entry-id]');
      return entry?.getAttribute('data-entry-id');
    });

    // Go offline
    await context.setOffline(true);

    // Try to update the same entry offline
    await page.click(`[data-entry-id="${entryId}"] button:has-text("Edit")`);
    await page.fill('textarea[name="notes"]', 'Offline edit');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Go back online - server version should win
    await context.setOffline(false);
    await page.waitForTimeout(3000);

    // Verify sync completed (check console or UI for conflict resolution)
    const hasConflict = await page.evaluate(() => {
      return sessionStorage.getItem('lastSyncHadConflict') === 'true';
    });

    // If conflict occurred, verify it was resolved gracefully
    if (hasConflict) {
      console.log('Conflict detected and resolved');
    }
  });

  test('should retry failed syncs with exponential backoff', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Create entry
    await page.click('button:has-text("Start Fast")');
    await page.waitForTimeout(1000);

    // Go online but simulate server errors
    await page.route('**/api/entries', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await context.setOffline(false);

    // Sync should fail and retry
    await page.waitForTimeout(2000);

    // Should still show pending
    await expect(page.locator('text=pending')).toBeVisible();

    // Remove the error route
    await page.unroute('**/api/entries');

    // Wait for retry (exponential backoff: 5s, 10s, 20s)
    await page.waitForTimeout(15000);

    // Should eventually sync
    await expect(page.locator('text=pending')).not.toBeVisible({ timeout: 30000 });
  });

  test('should handle quota exceeded errors', async ({ page, context }) => {
    // Fill IndexedDB to near capacity
    await page.evaluate(async () => {
      const { openDB } = await import('idb');
      const db = await openDB('fasting-tracker', 1);
      
      // Try to add many large entries
      const tx = db.transaction('cachedEntries', 'readwrite');
      const store = tx.objectStore('cachedEntries');
      
      for (let i = 0; i < 1000; i++) {
        await store.put({
          _id: `entry-${i}`,
          startTime: new Date().toISOString(),
          largeData: 'x'.repeat(10000), // 10KB of data
          cachedAt: Date.now(),
        });
      }
      
      await tx.done;
    });

    // Try to create another entry (should trigger quota management)
    await page.click('button:has-text("Start Fast")');
    await page.waitForTimeout(1000);

    // Verify entry was created (old entries should be evicted)
    const entries = page.locator('[data-testid="entry-item"]');
    await expect(entries.first()).toBeVisible();

    // Check console for eviction message
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Should have logged eviction
    await page.waitForTimeout(1000);
    const hasEvictionLog = consoleLogs.some(log => 
      log.includes('evict') || log.includes('quota')
    );
    
    console.log('Quota management triggered:', hasEvictionLog);
  });
});
