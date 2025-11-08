/**
 * Backfill Achievements API Route
 * 
 * POST /api/admin/users/[userId]/backfill-achievements
 * 
 * Admin-only endpoint that retroactively evaluates all historical entries
 * for a user and unlocks qualifying achievements. Processes entries
 * sequentially in chronological order.
 * 
 * Use Cases:
 * - New achievements deployed → backfill for existing users
 * - Achievement logic bugfix → recalculate for affected users
 * - Manual admin intervention for data migration
 * 
 * Idempotency:
 * - Safe to run multiple times on the same user
 * - Duplicate achievements prevented by unique index on UserAchievement model:
 *   { userId: 1, achievementId: 1, unique: true }
 * - If achievement already unlocked, AchievementService.evaluateAndUnlock()
 *   returns empty array (MongoDB duplicate key error caught silently)
 * - Statistics reflect only NEW achievements unlocked in current operation
 * - Example: First run unlocks 8 achievements, second run shows "unlocked 0"
 * 
 * Request:
 * - POST /api/admin/users/[userId]/backfill-achievements
 * - No request body required
 * 
 * Response Format (Success):
 * {
 *   "success": true,
 *   "entriesProcessed": 127,
 *   "achievementsUnlocked": 8,
 *   "pointsEarned": 450
 * }
 * 
 * Response Format (Error):
 * {
 *   "success": false,
 *   "error": "Error message"
 * }
 * 
 * Status Codes:
 * - 200: Success
 * - 401: Unauthorized (not logged in)
 * - 403: Forbidden (not admin)
 * - 404: Not Found (user not found)
 * - 500: Internal Server Error
 * 
 * Performance:
 * - Target: <10 seconds @ 95th percentile for 50-150 entries
 * - Maximum: 60 seconds total (Vercel function timeout)
 * - Evaluation: ~200ms per entry (Feature 031 target)
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { AchievementService } from '@/lib/services/AchievementService';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';

/**
 * POST handler for /api/admin/users/[userId]/backfill-achievements
 * 
 * Sequentially evaluates all user entries in chronological order
 * and unlocks qualifying achievements.
 */
export async function POST(request, { params }) {
  try {
    // ========================================================================
    // AUTHENTICATION & AUTHORIZATION
    // ========================================================================

    // Get session from NextAuth
    const session = await auth();

    // Check if user is logged in
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      );
    }

    // ========================================================================
    // VALIDATE TARGET USER
    // ========================================================================

    await connectDB();

    // Extract userId from route params
    const { userId } = params;

    // Verify user exists
    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // ========================================================================
    // FETCH USER ENTRIES
    // ========================================================================

    // Fetch all entries for user in chronological order (oldest first)
    // Use lean() for performance (read-only, no Mongoose overhead)
    const entries = await Entry.find({ userId })
      .sort({ date: 1 }) // Ascending = chronological
      .lean();

    // ========================================================================
    // SEQUENTIAL EVALUATION
    // ========================================================================

    // Initialize statistics
    let totalAchievementsUnlocked = 0;
    let totalPointsEarned = 0;
    const totalEntries = entries.length;

    // Log start of processing
    if (totalEntries > 0) {
      console.log(`🔄 Starting achievement backfill for user ${userId}: ${totalEntries} entries to process`);
    }

    // Process each entry sequentially
    // Note: Sequential processing preserves achievement evaluation order
    // (streak calculations depend on previously evaluated entries)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      try {
        // Evaluate achievements for this entry
        const result = await AchievementService.evaluateAndUnlock(
          userId,
          entry._id.toString()
        );

        // Aggregate statistics
        totalAchievementsUnlocked += result.unlockedAchievements.length;
        totalPointsEarned += result.totalPointsEarned;

        // Log progress every 10 entries for visibility
        if ((i + 1) % 10 === 0 || (i + 1) === totalEntries) {
          console.log(
            `📊 Progress: ${i + 1}/${totalEntries} entries processed ` +
            `(${Math.round(((i + 1) / totalEntries) * 100)}%) - ` +
            `${totalAchievementsUnlocked} achievements unlocked so far`
          );
        }
      } catch (evaluationError) {
        // Log error but continue processing remaining entries
        // Non-blocking error handling per Feature 031 design
        console.error(
          `⚠️ Error evaluating entry ${entry._id} for user ${userId}:`,
          evaluationError.message
        );
      }
    }

    // ========================================================================
    // AUDIT LOGGING
    // ========================================================================

    console.log('✅ Achievement backfill completed', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      entriesProcessed: entries.length,
      achievementsUnlocked: totalAchievementsUnlocked,
      pointsEarned: totalPointsEarned,
      timestamp: new Date().toISOString(),
    });

    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================

    return NextResponse.json(
      {
        success: true,
        entriesProcessed: entries.length,
        achievementsUnlocked: totalAchievementsUnlocked,
        pointsEarned: totalPointsEarned,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error in POST /api/admin/users/[userId]/backfill-achievements:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to backfill achievements',
      },
      { status: 500 }
    );
  }
}
