/**
 * GET /api/achievements/:id
 * Retrieve detailed information about a specific achievement
 * 
 * Path Parameters:
 * - id: achievementId of the achievement to retrieve
 * 
 * Query Parameters:
 * - lang: Language code for translations (optional, uses user.preferredLanguage if available)
 * 
 * Authentication: Required
 */

import { connectDB } from '@/lib/db';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import { withErrorHandler, okResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

export const GET = withErrorHandler(async (request, { params }) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to view achievement details');
  }

  await connectDB();

  // Get achievementId from params
  const { id: achievementId } = params;

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || session.user.preferredLanguage || 'en';

  // Fetch the achievement
  const achievement = await Achievement.findOne({ 
    achievementId,
    isActive: true 
  }).lean();

  if (!achievement) {
    return notFoundResponse('Achievement not found');
  }

  // Check if user has unlocked this achievement
  const userAchievement = await UserAchievement.findOne({
    userId: session.user.id,
    achievementId
  }).lean();

  const isUnlocked = !!userAchievement;

  // If secret and not unlocked, return 404 (hide existence)
  if (achievement.isSecret && !isUnlocked) {
    return notFoundResponse('Achievement not found');
  }

  // Get selected translation
  const translation = achievement.translations[lang] || achievement.translations.en;

  // Format response
  const response = {
    achievementId: achievement.achievementId,
    name: translation.name,
    description: translation.description,
    shortDescription: translation.shortDescription,
    badgeImage: achievement.badgeImage,
    icon: achievement.icon,
    iconColor: achievement.iconColor,
    category: achievement.category,
    points: achievement.points,
    rarity: achievement.rarity,
    order: achievement.order,
    criteria: achievement.criteria,
    isSecret: achievement.isSecret,
    userProgress: {
      isUnlocked,
      unlockedAt: userAchievement?.unlockedAt || null
    }
  };

  return okResponse(response);
});
