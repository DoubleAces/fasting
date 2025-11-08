# Implementation Quickstart: Admin Achievement Backfill

**Feature**: 033-admin-achievement-backfill  
**Date**: November 7, 2025  
**Estimated Time**: 6-8 hours

> **Note on Test Naming**: This guide references test scenarios as "T001", "T002", etc. (e.g., "T001: Returns 401 when not authenticated"). These are test case identifiers within the test files and are distinct from the Task IDs (T001-T091) in `tasks.md` which track implementation progress. Context makes the distinction clear: test scenarios appear in code comments, while Task IDs appear in the tasks checklist.

## Overview

This quickstart provides a step-by-step implementation guide for Feature 033. Follow the TDD workflow: write tests first, verify they fail, then implement code to make them pass.

---

## Prerequisites

- ✅ Feature 006 (Admin User Management) - Provides admin page and existing button patterns
- ✅ Feature 021 (Toast Notifications) - Provides toast notification system
- ✅ Feature 031 (Achievement Unlock Logic) - Provides AchievementService.evaluateAndUnlock()
- ✅ Feature 032 (Achievement Unlock API Response) - Established achievement evaluation patterns

**Verify Prerequisites**:
```bash
# Verify admin page exists
ls src/app/admin/users/components/DeleteUserButton.js

# Verify toast hook exists
ls src/hooks/useToast.js

# Verify achievement service exists
ls src/lib/services/AchievementService.js
```

---

## Implementation Steps

### Phase 1: Setup & Planning (15 minutes)

**1.1 Create feature branch** (already done via /speckit.specify)
```bash
git checkout 033-admin-achievement-backfill
git pull origin 033-admin-achievement-backfill
```

**1.2 Review specifications**
- Read `spec.md` (feature requirements)
- Read `plan.md` (this file - implementation approach)
- Read `data-model.md` (data structures and flow)
- Review `contracts/backfill-achievements-api.yaml` (API contract)

**1.3 Verify test environment**
```bash
# Run existing tests to establish baseline
npm test

# Verify MongoDB Memory Server works
npm test -- tests/integration/api/admin/backfill-achievements.test.js --verbose
```

---

### Phase 2: API Endpoint (TDD) - 2 hours

**2.1 Write API Integration Tests** (45 minutes)

Create `tests/integration/api/admin/backfill-achievements.test.js`:

```javascript
/**
 * Integration Tests: POST /api/admin/users/[userId]/backfill-achievements
 * 
 * Tests the achievement backfill API endpoint with real database operations.
 * Uses MongoDB Memory Server for isolated testing.
 */

import { POST } from '@/app/api/admin/users/[userId]/backfill-achievements/route';
import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import { auth } from '@/lib/auth';

// Mock NextAuth
jest.mock('@/lib/auth');

describe('POST /api/admin/users/[userId]/backfill-achievements', () => {
  let adminUser, regularUser, testUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});

    // Create test users
    adminUser = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      password: 'hashed',
      isAdmin: true,
    });

    regularUser = await User.create({
      email: 'user@test.com',
      name: 'Regular User',
      password: 'hashed',
      isAdmin: false,
    });

    testUser = await User.create({
      email: 'target@test.com',
      name: 'Target User',
      password: 'hashed',
      isAdmin: false,
    });

    // Create test achievement
    await Achievement.create({
      achievementId: 'first-sixteen',
      criteria: { type: 'duration-milestone', durationHours: 16 },
      points: 15,
      translations: {
        en: {
          name: 'Sweet Sixteen',
          description: 'Complete your first 16-hour fast',
        },
      },
    });
  });

  describe('Authentication & Authorization', () => {
    test('T001: Returns 401 when not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('T002: Returns 403 when user is not admin', async () => {
      auth.mockResolvedValue({ user: { id: regularUser._id.toString(), isAdmin: false } });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    test('T003: Admin can backfill achievements for any user', async () => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);

      expect(response.status).toBe(200);
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });
    });

    test('T004: Returns correct statistics when backfilling user with entries', async () => {
      // Create 3 entries for testUser (each qualifies for Sweet Sixteen achievement)
      await Entry.create([
        { userId: testUser._id, date: new Date('2025-11-01'), fastingTime: '17h 30m' },
        { userId: testUser._id, date: new Date('2025-11-02'), fastingTime: '18h 15m' },
        { userId: testUser._id, date: new Date('2025-11-03'), fastingTime: '16h 45m' },
      ]);

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.entriesProcessed).toBe(3);
      expect(data.achievementsUnlocked).toBeGreaterThanOrEqual(1); // At least Sweet Sixteen
      expect(data.pointsEarned).toBeGreaterThan(0);
      expect(Array.isArray(data.achievements)).toBe(true);
    });

    test('T005: Returns zero stats when user has no entries', async () => {
      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.entriesProcessed).toBe(0);
      expect(data.achievementsUnlocked).toBe(0);
      expect(data.pointsEarned).toBe(0);
      expect(data.achievements).toEqual([]);
    });

    test('T006: Idempotency - Running twice does not create duplicates', async () => {
      // Create entry
      await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-01'),
        fastingTime: '17h 30m',
      });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      // First backfill
      const response1 = await POST(request, params);
      const data1 = await response1.json();

      // Second backfill (should show 0 new achievements)
      const response2 = await POST(request, params);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.achievementsUnlocked).toBe(0);
      expect(data2.pointsEarned).toBe(0);

      // Verify no duplicates in database
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      const uniqueAchievements = new Set(userAchievements.map(ua => ua.achievementId.toString()));
      expect(userAchievements.length).toBe(uniqueAchievements.size);
    });
  });

  describe('Error Cases', () => {
    beforeEach(() => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });
    });

    test('T007: Returns 404 when target user does not exist', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId but doesn't exist

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: fakeUserId } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });
});
```

**Run tests (should fail):**
```bash
npm test -- tests/integration/api/admin/backfill-achievements.test.js
# Expected: All tests fail (endpoint doesn't exist yet)
```

**2.2 Implement API Endpoint** (75 minutes)

Create `src/app/api/admin/users/[userId]/backfill-achievements/route.js`:

```javascript
/**
 * POST /api/admin/users/[userId]/backfill-achievements
 * 
 * Backfill achievements for a specific user by evaluating all their historical entries.
 * 
 * Authentication: Admin only
 * Method: POST
 * Input: userId from URL parameter
 * Output: { success, entriesProcessed, achievementsUnlocked, pointsEarned, achievements }
 */

import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';
import {
  withErrorHandler,
  okResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/errorHandler';

export const POST = withErrorHandler(async (request, { params }) => {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // 2. Verify admin role
  if (!session.user.isAdmin) {
    return forbiddenResponse('Admin access required');
  }

  // 3. Connect to database
  await connectDB();

  // 4. Extract userId from path parameters
  const { userId } = params;

  // 5. Verify target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return notFoundResponse('User not found');
  }

  // 6. Log operation for audit trail
  console.log(
    `[Backfill] Admin ${session.user.id} (${session.user.email}) initiated backfill for user ${userId}`
  );

  // 7. Fetch all entries for user in chronological order
  const entries = await Entry.find({ userId })
    .sort({ date: 1 }) // Oldest to newest (important for streak calculation)
    .select('_id date fastingTime')
    .lean();

  console.log(`[Backfill] Found ${entries.length} entries for user ${userId}`);

  // 8. Sequentially evaluate each entry
  const { AchievementService } = await import('@/lib/services/AchievementService');
  
  let totalAchievementsUnlocked = 0;
  let totalPointsEarned = 0;
  const allUnlockedAchievements = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    try {
      const result = await AchievementService.evaluateAndUnlock(
        userId,
        entry._id.toString()
      );

      totalAchievementsUnlocked += result.unlockedAchievements.length;
      totalPointsEarned += result.totalPointsEarned;
      allUnlockedAchievements.push(...result.unlockedAchievements);

      // Log progress every 50 entries
      if ((i + 1) % 50 === 0) {
        console.log(`[Backfill] Processed ${i + 1}/${entries.length} entries...`);
      }
    } catch (error) {
      console.error(`[Backfill] Error evaluating entry ${entry._id}:`, error.message);
      // Continue processing remaining entries (non-blocking)
    }
  }

  // 9. Log completion
  console.log(
    `[Backfill] Complete: ${entries.length} entries, ${totalAchievementsUnlocked} achievements unlocked, ${totalPointsEarned} points earned`
  );

  // 10. Return aggregate statistics
  return okResponse({
    success: true,
    entriesProcessed: entries.length,
    achievementsUnlocked: totalAchievementsUnlocked,
    pointsEarned: totalPointsEarned,
    achievements: allUnlockedAchievements,
  });
});
```

**Run tests (should pass):**
```bash
npm test -- tests/integration/api/admin/backfill-achievements.test.js
# Expected: All 7 integration tests pass
```

---

### Phase 3: Client Component (TDD) - 2.5 hours

**3.1 Write Component Unit Tests** (60 minutes)

Create `tests/unit/components/admin/BackfillAchievementsButton.test.js`:

```javascript
/**
 * Unit Tests: BackfillAchievementsButton Component
 * 
 * Tests button rendering, loading states, API calls, and toast notifications.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BackfillAchievementsButton from '@/app/admin/users/components/BackfillAchievementsButton';
import { useToast } from '@/hooks/useToast';

// Mock useToast hook
jest.mock('@/hooks/useToast');

// Mock fetch
global.fetch = jest.fn();

describe('BackfillAchievementsButton', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockOnBackfillSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });
    global.fetch.mockClear();
  });

  describe('Rendering', () => {
    test('T008: Renders button with correct text', () => {
      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      expect(screen.getByText('Backfill Achievements')).toBeInTheDocument();
    });

    test('T009: Button has correct aria-label for accessibility', () => {
      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Backfill achievements for Test User');
    });

    test('T010: Button is enabled by default', () => {
      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    test('T011: Shows loading spinner when clicked', async () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });

    test('T012: Button is disabled during loading', async () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Success Handling', () => {
    test('T013: Shows success toast with statistics when achievements unlocked', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          entriesProcessed: 127,
          achievementsUnlocked: 8,
          pointsEarned: 150,
          achievements: [],
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          '✅ Processed 127 entries, unlocked 8 achievements, 150 points earned'
        );
      });
    });

    test('T014: Shows different message when no new achievements', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          entriesProcessed: 50,
          achievementsUnlocked: 0,
          pointsEarned: 0,
          achievements: [],
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          '✅ Processed 50 entries, 0 new achievements (all already unlocked)'
        );
      });
    });

    test('T015: Calls onBackfillSuccess callback after successful backfill', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          entriesProcessed: 10,
          achievementsUnlocked: 2,
          pointsEarned: 30,
          achievements: [],
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnBackfillSuccess).toHaveBeenCalledTimes(1);
      });
    });

    test('T016: Button returns to enabled state after success', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          entriesProcessed: 10,
          achievementsUnlocked: 2,
          pointsEarned: 30,
          achievements: [],
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('T017: Shows error toast when API returns error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'User not found',
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          '❌ Failed to backfill achievements. Please try again.'
        );
      });
    });

    test('T018: Shows error toast when network request fails', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          '❌ Failed to backfill achievements. Please try again.'
        );
      });
    });

    test('T019: Button returns to enabled state after error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      render(
        <BackfillAchievementsButton
          userId="123"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('API Call', () => {
    test('T020: Makes POST request to correct endpoint', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          entriesProcessed: 0,
          achievementsUnlocked: 0,
          pointsEarned: 0,
          achievements: [],
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="507f1f77bcf86cd799439011"
          userName="Test User"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/users/507f1f77bcf86cd799439011/backfill-achievements',
          { method: 'POST' }
        );
      });
    });
  });
});
```

**Run tests (should fail):**
```bash
npm test -- tests/unit/components/admin/BackfillAchievementsButton.test.js
# Expected: All tests fail (component doesn't exist yet)
```

**3.2 Implement Client Component** (90 minutes)

Create `src/app/admin/users/components/BackfillAchievementsButton.js`:

```javascript
/**
 * BackfillAchievementsButton Component
 * 
 * Action button for admin user management table to backfill achievements for a user.
 * Triggers evaluation of all user entries and unlocks qualifying achievements.
 * 
 * Features:
 * - Loading state with spinner
 * - Disabled during processing
 * - Toast notifications (success with statistics, error with retry prompt)
 * - Optional callback after successful backfill
 * 
 * Usage:
 * ```jsx
 * <BackfillAchievementsButton
 *   userId="507f1f77bcf86cd799439011"
 *   userName="John Doe"
 *   onBackfillSuccess={handleRefresh}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

/**
 * BackfillAchievementsButton component
 * 
 * @param {Object} props
 * @param {string} props.userId - MongoDB ObjectId of target user
 * @param {string} props.userName - Display name for aria-label
 * @param {Function} [props.onBackfillSuccess] - Optional callback after successful backfill
 */
export default function BackfillAchievementsButton({
  userId,
  userName,
  onBackfillSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  /**
   * Handle backfill button click
   */
  const handleBackfill = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/backfill-achievements`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to backfill achievements');
      }

      // Extract statistics from response
      const { entriesProcessed, achievementsUnlocked, pointsEarned } = data;

      // Show appropriate success message
      if (achievementsUnlocked === 0) {
        showSuccess(
          `✅ Processed ${entriesProcessed} entries, 0 new achievements (all already unlocked)`
        );
      } else {
        showSuccess(
          `✅ Processed ${entriesProcessed} entries, unlocked ${achievementsUnlocked} achievements, ${pointsEarned} points earned`
        );
      }

      // Trigger parent refresh if callback provided
      if (onBackfillSuccess) {
        onBackfillSuccess();
      }
    } catch (error) {
      console.error('❌ Error backfilling achievements:', error);
      showError('❌ Failed to backfill achievements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBackfill}
      disabled={isLoading}
      aria-label={`Backfill achievements for ${userName}`}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-colors
        ${
          isLoading
            ? 'bg-purple-300 text-purple-700 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
        }
      `}
    >
      {isLoading ? (
        <>
          <svg
            data-testid="loading-spinner"
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Backfill Achievements
        </>
      )}
    </button>
  );
}
```

**Run tests (should pass):**
```bash
npm test -- tests/unit/components/admin/BackfillAchievementsButton.test.js
# Expected: All 13 component tests pass
```

---

### Phase 4: Integration with UserRow - 30 minutes

**4.1 Update UserRow Component**

Edit `src/app/admin/users/components/UserRow.js`:

```javascript
// Add import at top
import BackfillAchievementsButton from './BackfillAchievementsButton';

// In the Actions Column section (around line 140), add the button:
{/* Actions Column */}
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex items-center justify-end gap-2">
    {/* Toggle Admin Button */}
    <AdminToggle
      userId={user._id}
      userName={user.name || user.email}
      isAdmin={user.isAdmin}
      isCurrentUser={isCurrentUser}
      onToggleSuccess={onRefresh}
    />

    {/* Backfill Achievements Button - NEW */}
    <BackfillAchievementsButton
      userId={user._id}
      userName={user.name || user.email}
      onBackfillSuccess={onRefresh}
    />

    {/* Delete User Button */}
    <DeleteUserButton
      userId={user._id}
      userName={user.name || user.email}
      isCurrentUser={isCurrentUser}
      onDeleteSuccess={onRefresh}
    />
  </div>
</td>
```

**Test manually:**
```bash
npm run dev
# Visit http://localhost:3000/admin/users
# Verify button appears next to each user
# Click button and verify toast notification appears
```

---

### Phase 5: E2E Testing - 1 hour

**5.1 Write E2E Test**

Create `tests/e2e/admin/achievement-backfill.spec.js`:

```javascript
/**
 * E2E Tests: Admin Achievement Backfill
 * 
 * Tests the complete user flow from admin login through backfill operation.
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Achievement Backfill', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Navigate to admin users page
    await page.goto('/admin/users');
    await page.waitForSelector('[data-testid="user-table"]');
  });

  test('T021: Backfill button appears for all users', async ({ page }) => {
    const backfillButtons = await page.locator('button:has-text("Backfill Achievements")').count();
    expect(backfillButtons).toBeGreaterThan(0);
  });

  test('T022: Clicking backfill shows loading state then success toast', async ({ page }) => {
    // Click first backfill button
    const button = page.locator('button:has-text("Backfill Achievements")').first();
    await button.click();

    // Verify loading state
    await expect(button).toBeDisabled();
    await expect(button).toContainText('Processing...');

    // Wait for completion (up to 60 seconds)
    await expect(page.locator('.toast-success')).toBeVisible({ timeout: 60000 });
    
    // Verify success message format
    const toast = page.locator('.toast-success');
    await expect(toast).toContainText(/Processed \d+ entries/);
  });

  test('T023: Can backfill multiple users sequentially', async ({ page }) => {
    // Backfill first user
    await page.locator('button:has-text("Backfill Achievements")').first().click();
    await expect(page.locator('.toast-success')).toBeVisible({ timeout: 60000 });
    
    // Close toast
    await page.locator('.toast-close').first().click();
    
    // Backfill second user
    await page.locator('button:has-text("Backfill Achievements")').nth(1).click();
    await expect(page.locator('.toast-success')).toBeVisible({ timeout: 60000 });
  });
});
```

**Run E2E tests:**
```bash
npx playwright test tests/e2e/admin/achievement-backfill.spec.js
# Expected: All 3 E2E tests pass
```

---

### Phase 6: Final Testing & Documentation - 1 hour

**6.1 Run Full Test Suite**
```bash
# Run all tests
npm test

# Verify no regressions
npm test -- --coverage

# Run E2E tests
npx playwright test
```

**6.2 Manual Testing Checklist**

- [ ] Button appears in admin user table for all users
- [ ] Button shows loading spinner when clicked
- [ ] Button is disabled during processing
- [ ] Success toast shows correct statistics (entries, achievements, points)
- [ ] Success toast shows "0 new achievements" message when appropriate
- [ ] Error toast shows when user deleted mid-process
- [ ] Error toast shows when network fails
- [ ] Can backfill same user multiple times without errors
- [ ] Can backfill multiple users sequentially
- [ ] Non-admin users cannot access endpoint (403)
- [ ] Admin can backfill their own achievements
- [ ] Button is keyboard accessible (Tab + Enter)
- [ ] Screen reader announces button properly
- [ ] Button works on mobile (touch-friendly)

**6.3 Update Documentation**

Add entry to `CLAUDE.md`:
```markdown
## Feature 033: Admin Achievement Backfill
- JavaScript (ES6+) / Next.js 15.x (App Router) + Mongoose ODM, AchievementService (Feature 031), useToast hook (Feature 021)
- MongoDB (existing Entry, Achievement, UserAchievement, User models)
```

---

## Deployment Checklist

**Before merging to master:**

- [ ] All tests pass (unit + integration + E2E)
- [ ] No TypeScript/ESLint errors
- [ ] Code reviewed by team member
- [ ] Manual testing completed
- [ ] Documentation updated (CLAUDE.md, README if needed)
- [ ] Performance tested with 500+ entry user
- [ ] Accessibility verified (keyboard, screen reader)

**Deployment configuration:**

```javascript
// vercel.json - Ensure API timeout is sufficient
{
  "functions": {
    "src/app/api/admin/users/[userId]/backfill-achievements/route.js": {
      "maxDuration": 60
    }
  }
}
```

---

## Troubleshooting

### Issue: Endpoint returns 504 timeout
**Solution**: User has >500 entries. Increase Vercel function timeout or optimize AchievementService.

### Issue: Button doesn't appear
**Solution**: Verify admin is logged in and UserRow imported BackfillAchievementsButton correctly.

### Issue: Toast shows "0 achievements" despite qualifying entries
**Solution**: Achievements may already be unlocked. Check UserAchievement collection in database.

### Issue: Duplicate achievements created
**Solution**: Verify unique constraint exists on UserAchievement collection: `{ userId: 1, achievementId: 1 }, { unique: true }`

---

## Time Breakdown

| Phase | Task | Estimated Time | Actual Time |
|-------|------|----------------|-------------|
| 1 | Setup & Planning | 15 min | ___ |
| 2 | API Endpoint (TDD) | 2 hours | ___ |
| 3 | Client Component (TDD) | 2.5 hours | ___ |
| 4 | UserRow Integration | 30 min | ___ |
| 5 | E2E Testing | 1 hour | ___ |
| 6 | Final Testing & Docs | 1 hour | ___ |
| **Total** | | **~7 hours** | ___ |

---

## Success Criteria

✅ Feature is complete when:

1. All 23 tests pass (7 integration + 13 unit + 3 E2E)
2. Button appears in admin user table
3. Backfill operation completes successfully for 1-500 entries
4. Toast notifications show correct statistics
5. Idempotency verified (can run multiple times safely)
6. Access control verified (admin-only)
7. Performance target met (<10s @ 95th percentile)
8. Accessibility verified (WCAG 2.1 AA)
9. Documentation updated
10. No regressions in existing tests

---

## Git Workflow

```bash
# Commit after each phase
git add .
git commit -m "feat(admin): Phase 2 - API endpoint with integration tests"

# Final commit and push
git add .
git commit -m "feat: implement admin achievement backfill (Feature 033)

- Add BackfillAchievementsButton component to admin user table
- Add POST /api/admin/users/[userId]/backfill-achievements endpoint
- Sequential evaluation of all user entries with AchievementService
- Toast notifications with aggregate statistics
- Idempotent operation (safe to run multiple times)
- Admin-only access with audit logging
- 23/23 tests passing (integration + unit + E2E)
- Performance: <10s typical, <60s max timeout"

git push origin 033-admin-achievement-backfill

# Create pull request to master
# Title: Feature 033: Admin Achievement Backfill
# Link to spec.md in PR description
```

---

**END OF QUICKSTART** 🚀
