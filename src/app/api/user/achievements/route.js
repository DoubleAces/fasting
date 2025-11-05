/**
 * GET /api/user/achievements
 * Retrieve all achievements with personalized progress and unlock status for the authenticated user
 * 
 * Query Parameters:
 * - status: Filter by unlocked|locked (optional)
 * - category: Filter by achievement category (optional)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - sort: Sort by dateUnlocked|points|order (default: dateUnlocked)
 * - lang: Language code for translations (optional, uses user.preferredLanguage if available)
 * 
 * Authentication: Required
 */

import { connectDB } from '@/lib/db';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import { withErrorHandler, okResponse, unauthorizedResponse, badRequestResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

// Valid category enum values
const VALID_CATEGORIES = [
  'getting-started',
  'duration',
  'streak',
  'goal',
  'weight',
  'consistency',
  'special',
  'knowledge'
];

// Valid sort options
const VALID_SORTS = ['dateUnlocked', 'points', 'order'];
const VALID_STATUS = ['unlocked', 'locked'];

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to view personal achievements');
  }

  await connectDB();

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const sort = searchParams.get('sort') || 'dateUnlocked';
  const lang = searchParams.get('lang') || session.user.preferredLanguage || 'en';

  // Validate status
  if (status && !VALID_STATUS.includes(status)) {
    return badRequestResponse(
      `Invalid status. Must be one of: ${VALID_STATUS.join(', ')}`,
      { validStatus: VALID_STATUS }
    );
  }

  // Validate category
  if (category && !VALID_CATEGORIES.includes(category)) {
    return badRequestResponse(
      `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      { validCategories: VALID_CATEGORIES }
    );
  }

  // Validate sort
  if (!VALID_SORTS.includes(sort)) {
    return badRequestResponse(
      `Invalid sort. Must be one of: ${VALID_SORTS.join(', ')}`,
      { validSorts: VALID_SORTS }
    );
  }

  // Build achievement filter
  const achievementFilter = { isActive: true };
  if (category) {
    achievementFilter.category = category;
  }

  // Fetch all achievements and user's unlocked achievements
  const [allAchievements, userAchievements] = await Promise.all([
    Achievement.find(achievementFilter).lean(),
    UserAchievement.find({ userId: session.user.id }).lean()
  ]);

  // Create a map of unlocked achievements by achievementId
  const unlockedMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  // Combine achievement data with user progress
  let combinedAchievements = allAchievements
    .map(achievement => {
      const userAchievement = unlockedMap.get(achievement.achievementId);
      const isUnlocked = !!userAchievement;

      // Filter out secret achievements that aren't unlocked
      if (achievement.isSecret && !isUnlocked) {
        return null;
      }

      return {
        achievement,
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt || null
      };
    })
    .filter(item => item !== null); // Remove filtered secret achievements

  // Apply status filter
  if (status === 'unlocked') {
    combinedAchievements = combinedAchievements.filter(item => item.isUnlocked);
  } else if (status === 'locked') {
    combinedAchievements = combinedAchievements.filter(item => !item.isUnlocked);
  }

  // Sort achievements
  combinedAchievements.sort((a, b) => {
    switch (sort) {
      case 'dateUnlocked':
        // Unlocked first, sorted by unlock date (newest first), then locked by order
        if (a.isUnlocked && b.isUnlocked) {
          return b.unlockedAt - a.unlockedAt;
        }
        if (a.isUnlocked) return -1;
        if (b.isUnlocked) return 1;
        return a.achievement.order - b.achievement.order;
      
      case 'points':
        return b.achievement.points - a.achievement.points;
      
      case 'order':
        return a.achievement.order - b.achievement.order;
      
      default:
        return 0;
    }
  });

  // Apply pagination
  const skip = (page - 1) * limit;
  const paginatedAchievements = combinedAchievements.slice(skip, skip + limit);

  // Format response with selected language
  const formattedAchievements = paginatedAchievements.map(({ achievement, isUnlocked, unlockedAt }) => {
    const translation = achievement.translations[lang] || achievement.translations.en;
    
    return {
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
        unlockedAt
      }
    };
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(combinedAchievements.length / limit);
  const hasMore = page < totalPages;

  // Calculate summary statistics
  const unlockedCount = combinedAchievements.filter(item => item.isUnlocked).length;
  const totalPoints = combinedAchievements
    .filter(item => item.isUnlocked)
    .reduce((sum, item) => sum + item.achievement.points, 0);

  return okResponse({
    achievements: formattedAchievements,
    pagination: {
      page,
      limit,
      total: combinedAchievements.length,
      totalPages,
      hasMore
    },
    summary: {
      totalAchievements: combinedAchievements.length,
      unlockedCount,
      lockedCount: combinedAchievements.length - unlockedCount,
      totalPoints
    }
  });
});
