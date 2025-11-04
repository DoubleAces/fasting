/**
 * Achievement Model
 * 
 * Stores achievement/badge definitions with multilingual translations, unlock criteria, and visual assets.
 * Each achievement has a unique achievementId slug, category, rarity tier, and flexible criteria object.
 * 
 * Schema Fields:
 * - achievementId: Unique string slug (e.g., 'first-fast', 'sweet-sixteen')
 * - translations: Nested object with language codes (en/es/fr/de/pt) containing name/description/shortDescription
 * - badgeImage: Object with locked/unlocked URLs (optional)
 * - icon: Emoji or unicode character (alternative to badgeImage)
 * - iconColor: Hex color code for icon background
 * - category: Enum (getting-started, duration, streak, goal, weight, consistency, special, knowledge)
 * - points: Number of gamification points awarded
 * - rarity: Enum (common, rare, epic, legendary)
 * - order: Display order for sorting (ascending)
 * - criteria: Flexible object with type (string) and params (mixed) for unlock logic
 * - isActive: Boolean for soft delete support (default: true)
 * - isSecret: Boolean for hidden achievements (default: false)
 * - releaseDate: Date when achievement becomes available (optional)
 * - createdBy: ObjectId reference to admin User who created this
 * - createdAt/updatedAt: Automatic timestamps
 * 
 * Features:
 * - Unique index on achievementId for fast lookups
 * - Multilingual support with nested translations object
 * - Flexible criteria using Schema.Types.Mixed for extensibility
 * - Soft delete via isActive flag
 * - Category and rarity enums for data integrity
 * - Automatic timestamp tracking
 * 
 * Usage:
 * ```
 * import Achievement from '@/lib/models/Achievement';
 * 
 * // Create achievement
 * const achievement = await Achievement.create({
 *   achievementId: 'first-fast',
 *   translations: {
 *     en: {
 *       name: 'First Fast',
 *       description: 'Complete your first fasting entry',
 *       shortDescription: 'First fast',
 *     },
 *   },
 *   category: 'getting-started',
 *   points: 10,
 *   rarity: 'common',
 *   order: 1,
 *   criteria: { type: 'entry-count', params: { count: 1 } },
 *   createdBy: adminUserId,
 * });
 * 
 * // Query by achievementId
 * const achievement = await Achievement.findOne({ achievementId: 'first-fast' });
 * 
 * // Query by category
 * const gettingStarted = await Achievement.find({ 
 *   category: 'getting-started', 
 *   isActive: true 
 * }).sort({ order: 1 });
 * ```
 */

import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    // ============================================================================
    // IDENTITY
    // ============================================================================

    /**
     * Unique human-readable slug identifier
     * - Lowercase, kebab-case format (e.g., 'first-fast', 'sweet-sixteen')
     * - Unique index for fast lookups (defined in indexes section)
     * - String reference (not ObjectId) to support soft deletes
     */
    achievementId: {
      type: String,
      required: [true, 'Achievement ID is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        'Achievement ID must be lowercase kebab-case (e.g., first-fast)',
      ],
    },

    // ============================================================================
    // MULTILINGUAL CONTENT
    // ============================================================================

    /**
     * Multilingual translations object
     * Structure: { [languageCode]: { name, description, shortDescription } }
     * - en (English): Required
     * - es (Spanish): Optional
     * - fr (French): Optional
     * - de (German): Optional
     * - pt (Portuguese): Optional
     * 
     * Each translation contains:
     * - name: Achievement title (e.g., "First Fast")
     * - description: Full description (2-3 sentences)
     * - shortDescription: Brief description (<50 chars, for notifications)
     */
    translations: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Translations object is required'],
      validate: {
        validator: function (value) {
          // Ensure translations object exists
          if (!value || typeof value !== 'object') return false;
          
          // English translation is required
          if (!value.en || typeof value.en !== 'object') return false;
          
          // English must have name, description, and shortDescription
          if (!value.en.name || !value.en.description || !value.en.shortDescription) {
            return false;
          }
          
          return true;
        },
        message: 'Translations must include English (en) with name, description, and shortDescription',
      },
    },

    // ============================================================================
    // VISUAL ASSETS
    // ============================================================================

    /**
     * Badge image URLs
     * - locked: URL to locked (grayed out) badge image
     * - unlocked: URL to unlocked (colored) badge image
     * - Optional: Can use icon/iconColor instead
     */
    badgeImage: {
      locked: {
        type: String,
        default: null,
      },
      unlocked: {
        type: String,
        default: null,
      },
    },

    /**
     * Icon emoji or unicode character
     * - Alternative to badgeImage for simpler UI
     * - Examples: '🎯', '⭐', '🏆', '💪'
     */
    icon: {
      type: String,
      default: null,
    },

    /**
     * Icon background color
     * - Hex color code (e.g., '#4F46E5', '#10B981')
     * - Used when displaying icon-based badges
     */
    iconColor: {
      type: String,
      default: null,
      match: [
        /^#[0-9A-Fa-f]{6}$/,
        'Icon color must be a valid hex color code (e.g., #4F46E5)',
      ],
    },

    // ============================================================================
    // CLASSIFICATION
    // ============================================================================

    /**
     * Achievement category
     * - getting-started: Onboarding achievements
     * - duration: Based on fast duration (e.g., 16-hour, 24-hour)
     * - streak: Based on consecutive days
     * - goal: Based on reaching fasting goals
     * - weight: Based on weight loss milestones
     * - consistency: Based on regular tracking
     * - special: Event or milestone achievements
     * - knowledge: Educational content achievements
     */
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'getting-started',
          'duration',
          'streak',
          'goal',
          'weight',
          'consistency',
          'special',
          'knowledge',
        ],
        message: 'Category must be one of: getting-started, duration, streak, goal, weight, consistency, special, knowledge',
      },
    },

    /**
     * Gamification points awarded when unlocked
     * - Higher points for rarer/harder achievements
     * - Used to calculate user's total achievement points
     */
    points: {
      type: Number,
      required: [true, 'Points value is required'],
      min: [0, 'Points must be non-negative'],
    },

    /**
     * Achievement rarity tier
     * - common: Basic achievements (most users will unlock)
     * - rare: Moderate difficulty
     * - epic: Significant effort required
     * - legendary: Exceptional accomplishments
     */
    rarity: {
      type: String,
      required: [true, 'Rarity is required'],
      enum: {
        values: ['common', 'rare', 'epic', 'legendary'],
        message: 'Rarity must be one of: common, rare, epic, legendary',
      },
    },

    /**
     * Display order for sorting
     * - Lower numbers appear first
     * - Used for consistent achievement ordering in UI
     */
    order: {
      type: Number,
      required: [true, 'Display order is required'],
    },

    // ============================================================================
    // UNLOCK LOGIC
    // ============================================================================

    /**
     * Unlock criteria definition
     * - type: String identifying criteria logic (e.g., 'entry-count', 'duration', 'streak')
     * - params: Flexible object with criteria-specific parameters
     * 
     * Examples:
     * - { type: 'entry-count', params: { count: 7 } }
     * - { type: 'duration', params: { duration: 960 } } // 16 hours in minutes
     * - { type: 'streak', params: { count: 30 } }
     * - { type: 'manual', params: {} } // Admin-awarded only
     * 
     * Uses Schema.Types.Mixed for flexibility without schema migrations
     */
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Unlock criteria is required'],
      validate: {
        validator: function (value) {
          // Ensure criteria has type field
          if (!value || typeof value !== 'object') return false;
          if (!value.type || typeof value.type !== 'string') return false;
          
          // Ensure params exists (can be empty object)
          // Allow undefined params for flexibility, but if present must be object
          if (value.params === undefined) {
            // If params is missing, set it to empty object
            value.params = {};
          }
          if (typeof value.params !== 'object') return false;
          
          return true;
        },
        message: 'Criteria must include type (string) and params (object)',
      },
    },

    // ============================================================================
    // LIFECYCLE & VISIBILITY
    // ============================================================================

    /**
     * Active status (soft delete support)
     * - true: Achievement is active and visible
     * - false: Achievement is deactivated (soft deleted)
     * - Allows disabling achievements without breaking UserAchievement references
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Secret achievement flag
     * - true: Hidden until unlocked (surprise achievements)
     * - false: Visible to all users before unlocking
     */
    isSecret: {
      type: Boolean,
      default: false,
    },

    /**
     * Release date (optional)
     * - Date when achievement becomes available
     * - Can be used for timed releases or seasonal achievements
     */
    releaseDate: {
      type: Date,
      default: null,
    },

    // ============================================================================
    // AUDIT TRAIL
    // ============================================================================

    /**
     * Admin user who created this achievement
     * - ObjectId reference to User model
     * - Used for audit trail and accountability
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by admin user is required'],
    },

    // Note: createdAt and updatedAt are automatically created by timestamps: true option
  },
  {
    // Automatic timestamps
    timestamps: true,

    // Collection name
    collection: 'Achievements',
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// Unique index on achievementId for fast lookups and uniqueness enforcement
achievementSchema.index({ achievementId: 1 }, { unique: true });

// Index for category queries (common use case: fetch all achievements in a category)
achievementSchema.index({ category: 1, order: 1 });

// Index for active achievements (filter out soft-deleted)
achievementSchema.index({ isActive: 1 });

// ============================================================================
// QUERY EXAMPLES (JSDoc)
// ============================================================================

/**
 * Common Query Patterns
 * 
 * @example Get all active achievements sorted by category and order
 * const achievements = await Achievement.find({ isActive: true })
 *   .sort({ category: 1, order: 1 });
 * 
 * @example Get single achievement by achievementId
 * const achievement = await Achievement.findOne({ achievementId: 'first-fast' });
 * 
 * @example Get all achievements in a category
 * const durationAchs = await Achievement.find({
 *   category: 'duration',
 *   isActive: true
 * }).sort({ order: 1 });
 * 
 * @example Get achievements by rarity tier
 * const legendaryAchs = await Achievement.find({
 *   rarity: 'legendary',
 *   isActive: true
 * });
 * 
 * @example Get multiple achievements by IDs (for manual joins)
 * const achievements = await Achievement.find({
 *   achievementId: { $in: ['first-fast', 'sweet-sixteen', 'week-warrior'] }
 * });
 * 
 * @example Create new achievement
 * const newAchievement = await Achievement.create({
 *   achievementId: 'marathon-master',
 *   translations: {
 *     en: {
 *       name: 'Marathon Master',
 *       description: 'Complete a 24-hour fast',
 *       shortDescription: '24h fast'
 *     }
 *   },
 *   icon: '🏃',
 *   iconColor: '#10B981',
 *   category: 'duration',
 *   points: 50,
 *   rarity: 'epic',
 *   order: 10,
 *   criteria: {
 *     type: 'duration-hours',
 *     params: { hours: 24 }
 *   },
 *   createdBy: adminUserId
 * });
 * 
 * @example Soft delete an achievement
 * await Achievement.findOneAndUpdate(
 *   { achievementId: 'old-achievement' },
 *   { isActive: false }
 * );
 * 
 * @example Update translation
 * const achievement = await Achievement.findOne({ achievementId: 'first-fast' });
 * achievement.translations.es = {
 *   name: 'Primer Ayuno',
 *   description: 'Completa tu primer ayuno',
 *   shortDescription: 'Primer ayuno'
 * };
 * achievement.markModified('translations'); // Important for nested objects!
 * await achievement.save();
 */

// ============================================================================
// MODEL EXPORT
// ============================================================================

const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

export default Achievement;
