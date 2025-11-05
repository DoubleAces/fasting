/**
 * POST /api/achievements/unlock
 * Manually unlock an achievement for a user (admin only)
 * 
 * Request Body:
 * - userId: User ID to unlock achievement for
 * - achievementId: Achievement ID to unlock
 * 
 * Authentication: Required (Admin only)
 * 
 * Use cases:
 * - Testing achievements
 * - Correcting unlock issues
 * - Awarding special achievements
 */

import { connectDB } from '@/lib/db';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import User from '@/lib/models/User';
import { withErrorHandler, okResponse, unauthorizedResponse, forbiddenResponse, badRequestResponse, notFoundResponse, errorResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

export const POST = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // Check admin permission
  if (!session.user.isAdmin) {
    return forbiddenResponse('Admin access required to manually unlock achievements');
  }

  await connectDB();

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequestResponse('Invalid JSON in request body');
  }

  const { userId, achievementId } = body;

  // Validate required fields
  if (!userId) {
    return badRequestResponse('userId is required');
  }

  if (!achievementId) {
    return badRequestResponse('achievementId is required');
  }

  // Validate achievement exists
  const achievement = await Achievement.findOne({ achievementId, isActive: true }).lean();
  if (!achievement) {
    return notFoundResponse(`Achievement '${achievementId}' not found or inactive`);
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    return notFoundResponse(`User with ID '${userId}' not found`);
  }

  // Check if already unlocked (prevent duplicates)
  const existingUnlock = await UserAchievement.findOne({
    userId,
    achievementId
  });

  if (existingUnlock) {
    return errorResponse(
      `Achievement '${achievementId}' is already unlocked for this user`,
      409, // Conflict
      { 
        unlockedAt: existingUnlock.unlockedAt,
        message: 'Duplicate unlock prevented'
      }
    );
  }

  // Create UserAchievement record
  const userAchievement = await UserAchievement.create({
    userId,
    achievementId,
    unlockedAt: new Date()
  });

  // Increment user's achievement points atomically
  await User.findByIdAndUpdate(
    userId,
    { $inc: { achievementPoints: achievement.points } },
    { new: true }
  );

  // Get updated user for response
  const updatedUser = await User.findById(userId).select('achievementPoints').lean();

  return okResponse({
    message: 'Achievement unlocked successfully',
    achievement: {
      achievementId: achievement.achievementId,
      name: achievement.translations.en.name,
      points: achievement.points,
      unlockedAt: userAchievement.unlockedAt
    },
    user: {
      userId: user._id,
      email: user.email,
      achievementPoints: updatedUser.achievementPoints
    },
    unlockedBy: {
      adminId: session.user.id,
      adminEmail: session.user.email,
      method: 'manual'
    }
  }, 201); // Created
});
