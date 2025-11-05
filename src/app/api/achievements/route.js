/**
 * GET /api/achievements
 * Browse all active achievements with filtering, pagination, sorting, and language support
 * 
 * Query Parameters:
 * - category: Filter by achievement category (optional)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - sort: Sort by order|rarity|points|newest (default: order)
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
const VALID_SORTS = ['order', 'rarity', 'points', 'newest'];

// Rarity sort order
const RARITY_ORDER = { legendary: 4, epic: 3, rare: 2, common: 1 };

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to browse achievements');
  }

  await connectDB();

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const sort = searchParams.get('sort') || 'order';
  const lang = searchParams.get('lang') || session.user.preferredLanguage || 'en';

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

  // Build query filter
  const filter = { isActive: true };
  if (category) {
    filter.category = category;
  }

  // Get user's unlocked achievements to filter out non-unlocked secret achievements
  const unlockedAchievements = await UserAchievement.find({ userId: session.user.id })
    .select('achievementId')
    .lean();
  const unlockedSet = new Set(unlockedAchievements.map(ua => ua.achievementId));

  // Build sort criteria
  let sortCriteria = {};
  switch (sort) {
    case 'order':
      sortCriteria = { order: 1 };
      break;
    case 'points':
      sortCriteria = { points: -1 };
      break;
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'rarity':
      // Rarity will be sorted in memory after query
      sortCriteria = { order: 1 }; // Default sort for now
      break;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Fetch achievements
  const [rawAchievements, total] = await Promise.all([
    Achievement.find(filter)
      .sort(sortCriteria)
      .lean(),
    Achievement.countDocuments(filter)
  ]);

  // Filter out secret achievements user hasn't unlocked
  let achievements = rawAchievements.filter(achievement => {
    if (achievement.isSecret && !unlockedSet.has(achievement.achievementId)) {
      return false;
    }
    return true;
  });

  // Apply rarity sorting if needed (in memory)
  if (sort === 'rarity') {
    achievements.sort((a, b) => {
      const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.order - b.order; // Secondary sort by order
    });
  }

  // Apply pagination after filtering
  const paginatedAchievements = achievements.slice(skip, skip + limit);

  // Format response with selected language
  const formattedAchievements = paginatedAchievements.map(achievement => {
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
      isSecret: achievement.isSecret
    };
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(achievements.length / limit);
  const hasMore = page < totalPages;

  return okResponse({
    achievements: formattedAchievements,
    pagination: {
      page,
      limit,
      total: achievements.length,
      totalPages,
      hasMore
    }
  });
});
