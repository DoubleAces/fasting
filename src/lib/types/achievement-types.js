/**
 * @fileoverview TypeScript-style JSDoc type definitions for Achievement models
 * Provides IDE autocomplete and type checking support for JavaScript
 * 
 * Usage in model files:
 * @typedef {import('@/lib/types/achievement-types').IAchievement} IAchievement
 * @typedef {import('@/lib/types/achievement-types').IUserAchievement} IUserAchievement
 */

/**
 * Translation for a specific language
 * @typedef {Object} AchievementTranslation
 * @property {string} name - Achievement name (e.g., "First Fast")
 * @property {string} description - Full description (2-3 sentences)
 * @property {string} shortDescription - Brief description (1 sentence, <50 chars)
 */

/**
 * Multilingual translations object
 * Keys are ISO 639-1 language codes (en, es, fr, de, pt)
 * @typedef {Object} AchievementTranslations
 * @property {AchievementTranslation} en - English translation (required)
 * @property {AchievementTranslation} [es] - Spanish translation (optional)
 * @property {AchievementTranslation} [fr] - French translation (optional)
 * @property {AchievementTranslation} [de] - German translation (optional)
 * @property {AchievementTranslation} [pt] - Portuguese translation (optional)
 */

/**
 * Badge image URLs
 * @typedef {Object} BadgeImage
 * @property {string|null} locked - URL to locked (grayed out) badge image
 * @property {string|null} unlocked - URL to unlocked (colored) badge image
 */

/**
 * Unlock criteria for achievement
 * @typedef {Object} AchievementCriteria
 * @property {string} type - Criteria type (e.g., 'manual', 'entry-count', 'streak', 'duration', 'weight-loss')
 * @property {Object.<string, any>} params - Flexible parameters for criteria logic (Schema.Types.Mixed)
 * @property {number} [params.count] - Count threshold (for entry-count, streak)
 * @property {number} [params.duration] - Duration in minutes (for duration criteria)
 * @property {number} [params.weight] - Weight loss in kg (for weight-loss criteria)
 */

/**
 * Achievement category enum
 * @typedef {'getting-started'|'duration'|'streak'|'goal'|'weight'|'consistency'|'special'|'knowledge'} AchievementCategory
 */

/**
 * Achievement rarity enum
 * @typedef {'common'|'rare'|'epic'|'legendary'} AchievementRarity
 */

/**
 * Achievement document interface
 * @typedef {Object} IAchievement
 * @property {import('mongoose').Types.ObjectId} _id - MongoDB ObjectId (auto-generated)
 * @property {string} achievementId - Unique human-readable slug (e.g., 'first-fast', 'sweet-sixteen')
 * @property {AchievementTranslations} translations - Multilingual names and descriptions
 * @property {BadgeImage|null} badgeImage - Badge image URLs (locked/unlocked)
 * @property {string|null} icon - Emoji or unicode character (alternative to badgeImage)
 * @property {string|null} iconColor - Hex color code for icon background (e.g., '#4F46E5')
 * @property {AchievementCategory} category - Achievement category
 * @property {number} points - Gamification points awarded when unlocked
 * @property {AchievementRarity} rarity - Rarity tier
 * @property {number} order - Display order for sorting (ascending)
 * @property {AchievementCriteria} criteria - Unlock criteria logic
 * @property {boolean} isActive - Whether achievement is active (soft delete support)
 * @property {boolean} isSecret - Whether achievement is hidden until unlocked
 * @property {Date|null} releaseDate - Date when achievement becomes available
 * @property {import('mongoose').Types.ObjectId} createdBy - Admin user who created this achievement
 * @property {Date} createdAt - Timestamp when achievement was created (auto)
 * @property {Date} updatedAt - Timestamp when achievement was last updated (auto)
 */

/**
 * User Achievement document interface
 * @typedef {Object} IUserAchievement
 * @property {import('mongoose').Types.ObjectId} _id - MongoDB ObjectId (auto-generated)
 * @property {import('mongoose').Types.ObjectId} userId - Reference to User document
 * @property {string} achievementId - String reference to Achievement.achievementId (not ObjectId)
 * @property {Date} unlockedAt - Timestamp when achievement was unlocked
 * @property {number} progress - Progress value for incremental achievements (0-100 or count)
 * @property {boolean} notificationSeen - Whether user has seen the unlock notification
 * @property {Date} createdAt - Timestamp when unlock was created (auto)
 * @property {Date} updatedAt - Timestamp when progress was last updated (auto)
 */

/**
 * User document extensions for achievements
 * @typedef {Object} IUserAchievementExtensions
 * @property {'en'|'es'|'fr'|'de'|'pt'|'ja'|'zh'} preferredLanguage - User's preferred language for achievement translations
 * @property {number} achievementPoints - Total gamification points earned from unlocked achievements
 */

/**
 * Achievement query filter options
 * @typedef {Object} AchievementQueryOptions
 * @property {AchievementCategory} [category] - Filter by category
 * @property {AchievementRarity} [rarity] - Filter by rarity
 * @property {boolean} [isActive] - Filter by active status
 * @property {boolean} [isSecret] - Filter by secret status
 * @property {number} [skip] - Number of documents to skip (pagination)
 * @property {number} [limit] - Maximum number of documents to return
 * @property {Object} [sort] - Sort criteria (e.g., { order: 1 })
 */

/**
 * UserAchievement query filter options
 * @typedef {Object} UserAchievementQueryOptions
 * @property {import('mongoose').Types.ObjectId} [userId] - Filter by user
 * @property {string} [achievementId] - Filter by achievement slug
 * @property {Date} [unlockedAfter] - Filter achievements unlocked after date
 * @property {Date} [unlockedBefore] - Filter achievements unlocked before date
 * @property {boolean} [notificationSeen] - Filter by notification status
 * @property {number} [skip] - Number of documents to skip (pagination)
 * @property {number} [limit] - Maximum number of documents to return
 * @property {Object} [sort] - Sort criteria (e.g., { unlockedAt: -1 })
 */

/**
 * Achievement creation input
 * @typedef {Object} CreateAchievementInput
 * @property {string} achievementId - Unique slug
 * @property {AchievementTranslations} translations - Multilingual translations
 * @property {BadgeImage} [badgeImage] - Badge images
 * @property {string} [icon] - Icon emoji
 * @property {string} [iconColor] - Icon color
 * @property {AchievementCategory} category - Category
 * @property {number} points - Points value
 * @property {AchievementRarity} rarity - Rarity tier
 * @property {number} order - Display order
 * @property {AchievementCriteria} criteria - Unlock criteria
 * @property {boolean} [isActive] - Active status (default: true)
 * @property {boolean} [isSecret] - Secret status (default: false)
 * @property {Date} [releaseDate] - Release date
 * @property {import('mongoose').Types.ObjectId} createdBy - Creator admin ID
 */

/**
 * UserAchievement creation input
 * @typedef {Object} CreateUserAchievementInput
 * @property {import('mongoose').Types.ObjectId} userId - User ID
 * @property {string} achievementId - Achievement slug
 * @property {Date} [unlockedAt] - Unlock timestamp (default: now)
 * @property {number} [progress] - Progress value (default: 0)
 * @property {boolean} [notificationSeen] - Notification status (default: false)
 */

export {};
