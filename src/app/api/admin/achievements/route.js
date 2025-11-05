/**
 * POST /api/admin/achievements
 * Create a new achievement definition (admin only)
 * 
 * Request Body:
 * - achievementId: Unique slug (e.g., 'first-fast')
 * - translations: Object with language codes (en required, es/fr/de/pt optional)
 *   - { en: { name, description, shortDescription }, es: {...}, ... }
 * - category: Enum (getting-started, duration, streak, goal, weight, consistency, special, knowledge)
 * - criteria: { type: string, params: object }
 * - points: Number (1-1000)
 * - rarity: Enum (common, rare, epic, legendary)
 * - badgeImage: { locked: string, unlocked: string } (optional)
 * - icon: Emoji or unicode character (optional)
 * - iconColor: Hex color code (optional)
 * - order: Display order (optional, default: 999)
 * - isActive: Boolean (optional, default: true)
 * - isSecret: Boolean (optional, default: false)
 * - releaseDate: ISO date string (optional)
 * 
 * Authentication: Required (Admin only)
 */

import { connectDB } from '@/lib/db';
import Achievement from '@/lib/models/Achievement';
import { withErrorHandler, okResponse, unauthorizedResponse, forbiddenResponse, badRequestResponse, errorResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

// Valid enum values
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

const VALID_RARITIES = ['common', 'rare', 'epic', 'legendary'];

const VALID_CRITERIA_TYPES = [
  'duration-milestone',
  'streak',
  'entry-count',
  'weight-loss',
  'custom'
];

export const POST = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // Check admin permission
  if (!session.user.isAdmin) {
    return forbiddenResponse('Admin access required to create achievements');
  }

  await connectDB();

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequestResponse('Invalid JSON in request body');
  }

  const {
    achievementId,
    translations,
    category,
    criteria,
    points,
    rarity,
    badgeImage,
    icon,
    iconColor,
    order,
    isActive,
    isSecret,
    releaseDate
  } = body;

  // Validate required fields
  const errors = [];

  if (!achievementId) {
    errors.push('achievementId is required');
  } else if (!/^[a-z0-9-]+$/.test(achievementId)) {
    errors.push('achievementId must contain only lowercase letters, numbers, and hyphens');
  }

  if (!translations) {
    errors.push('translations object is required');
  } else {
    if (!translations.en) {
      errors.push('translations.en (English) is required');
    } else {
      if (!translations.en.name) errors.push('translations.en.name is required');
      if (!translations.en.description) errors.push('translations.en.description is required');
      if (!translations.en.shortDescription) errors.push('translations.en.shortDescription is required');
    }
  }

  if (!category) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (!criteria) {
    errors.push('criteria object is required');
  } else {
    if (!criteria.type) {
      errors.push('criteria.type is required');
    } else if (!VALID_CRITERIA_TYPES.includes(criteria.type)) {
      errors.push(`criteria.type must be one of: ${VALID_CRITERIA_TYPES.join(', ')}`);
    }
    if (!criteria.params) {
      errors.push('criteria.params object is required');
    }
  }

  if (points === undefined || points === null) {
    errors.push('points is required');
  } else if (typeof points !== 'number' || points < 1 || points > 1000) {
    errors.push('points must be a number between 1 and 1000');
  }

  if (!rarity) {
    errors.push('rarity is required');
  } else if (!VALID_RARITIES.includes(rarity)) {
    errors.push(`rarity must be one of: ${VALID_RARITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    return badRequestResponse('Validation failed', { errors });
  }

  // Check for duplicate achievementId
  const existingAchievement = await Achievement.findOne({ achievementId });
  if (existingAchievement) {
    return errorResponse(
      `Achievement with ID '${achievementId}' already exists`,
      409, // Conflict
      { 
        existingAchievementId: existingAchievement._id,
        message: 'Use a different achievementId or update the existing achievement'
      }
    );
  }

  // Create achievement document
  const achievementData = {
    achievementId,
    translations,
    category,
    criteria,
    points,
    rarity,
    order: order ?? 999,
    isActive: isActive ?? true,
    isSecret: isSecret ?? false,
    createdBy: session.user.id
  };

  // Add optional fields if provided
  if (badgeImage) {
    achievementData.badgeImage = badgeImage;
  }
  if (icon) {
    achievementData.icon = icon;
  }
  if (iconColor) {
    achievementData.iconColor = iconColor;
  }
  if (releaseDate) {
    achievementData.releaseDate = new Date(releaseDate);
  }

  const achievement = await Achievement.create(achievementData);

  return okResponse({
    message: 'Achievement created successfully',
    achievement: {
      _id: achievement._id,
      achievementId: achievement.achievementId,
      name: achievement.translations.en.name,
      category: achievement.category,
      points: achievement.points,
      rarity: achievement.rarity,
      isActive: achievement.isActive,
      isSecret: achievement.isSecret,
      createdAt: achievement.createdAt
    },
    createdBy: {
      adminId: session.user.id,
      adminEmail: session.user.email
    }
  }, 201); // Created
});
