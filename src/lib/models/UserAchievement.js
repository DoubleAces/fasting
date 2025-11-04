/**
 * UserAchievement Model
 * 
 * Tracks user progress and unlocked achievements with compound unique constraints.
 * Links users to achievements they've unlocked with progress tracking and notification status.
 * 
 * Schema Fields:
 * - userId: ObjectId reference to User document
 * - achievementId: String reference to Achievement.achievementId (not ObjectId for soft delete support)
 * - unlockedAt: Date when achievement was unlocked
 * - progress: Number for incremental achievement tracking (0-100 or count)
 * - notificationSeen: Boolean indicating if user has seen unlock notification
 * - createdAt/updatedAt: Automatic timestamps
 * 
 * Features:
 * - Compound unique index on (userId + achievementId) prevents duplicate unlocks
 * - Descending index on (userId + unlockedAt) for recent achievements queries
 * - String-based achievementId reference (weak reference) supports Achievement soft deletes
 * - Progress field enables incremental achievement tracking
 * - Automatic timestamp tracking
 * 
 * Usage:
 * ```
 * import UserAchievement from '@/lib/models/UserAchievement';
 * 
 * // Unlock achievement for user
 * const userAch = await UserAchievement.create({
 *   userId: user._id,
 *   achievementId: 'first-fast',
 *   unlockedAt: new Date(),
 * });
 * 
 * // Query user's achievements (most recent first)
 * const achievements = await UserAchievement.find({ userId: user._id })
 *   .sort({ unlockedAt: -1 });
 * 
 * // Update progress for incremental achievement
 * const streakAch = await UserAchievement.findOne({
 *   userId: user._id,
 *   achievementId: 'thirty-day-streak',
 * });
 * streakAch.progress = 15; // 15 days out of 30
 * await streakAch.save();
 * 
 * // Manual join with Achievement details
 * const userAch = await UserAchievement.findOne({ userId: user._id });
 * const achievement = await Achievement.findOne({ achievementId: userAch.achievementId });
 * ```
 */

import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema(
  {
    // ============================================================================
    // USER REFERENCE
    // ============================================================================

    /**
     * User who unlocked this achievement
     * - ObjectId reference to User document
     * - Required field
     * - Indexed via compound indexes below
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // ============================================================================
    // ACHIEVEMENT REFERENCE
    // ============================================================================

    /**
     * Achievement identifier (string reference, not ObjectId)
     * - String reference to Achievement.achievementId field
     * - NOT an ObjectId reference (weak reference pattern)
     * - Allows Achievement soft deletes without orphaning UserAchievement records
     * - Required field
     * - Indexed via compound indexes below
     * 
     * Design Note: Using string reference instead of ObjectId allows:
     * 1. Achievement soft deletes (isActive: false) without breaking references
     * 2. Manual joins when needed: Achievement.findOne({ achievementId: string })
     * 3. Preserved user achievement history even if Achievement is deleted
     */
    achievementId: {
      type: String,
      required: [true, 'Achievement ID is required'],
      lowercase: true,
      trim: true,
    },

    // ============================================================================
    // UNLOCK TRACKING
    // ============================================================================

    /**
     * Timestamp when achievement was unlocked
     * - Required field
     * - Indexed via compound index (userId + unlockedAt desc) for recent queries
     * - Used for displaying achievements in chronological order
     */
    unlockedAt: {
      type: Date,
      required: [true, 'Unlock date is required'],
      default: Date.now,
    },

    /**
     * Progress value for incremental achievements
     * - Number representing completion progress
     * - Can be percentage (0-100) or count (e.g., 15 out of 30 days)
     * - Default: 0 (just started or fully complete at unlock)
     * - Minimum: 0 (non-negative)
     * 
     * Examples:
     * - Streak achievement: progress = 15 (15 days achieved out of 30)
     * - Entry count: progress = 7 (7 entries logged)
     * - Percentage: progress = 75 (75% complete)
     */
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress must be non-negative'],
    },

    /**
     * Notification seen status
     * - true: User has seen the unlock notification
     * - false: Notification not yet shown to user
     * - Default: false (notification pending)
     * - Used for badge/notification UI logic
     */
    notificationSeen: {
      type: Boolean,
      default: false,
    },

    // Note: createdAt and updatedAt are automatically created by timestamps: true option
  },
  {
    // Automatic timestamps
    timestamps: true,

    // Collection name
    collection: 'UserAchievements',
  }
);

// ============================================================================
// INDEXES
// ============================================================================

/**
 * Compound unique index on (userId + achievementId)
 * - Prevents duplicate unlocks (user cannot unlock same achievement twice)
 * - Enforces one-to-one relationship between user and specific achievement
 * - Critical for data integrity
 */
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

/**
 * Compound index on (userId + unlockedAt descending)
 * - Optimizes queries for user's recent achievements
 * - Common query pattern: "Show me user's achievements, most recent first"
 * - Enables efficient pagination and chronological display
 */
userAchievementSchema.index({ userId: 1, unlockedAt: -1 });

/**
 * Index on userId for user-specific queries
 * - Enables fast lookup of all achievements for a user
 * - Used for achievement dashboard, profile pages
 */
userAchievementSchema.index({ userId: 1 });

/**
 * Index on achievementId for achievement-specific queries
 * - Enables fast lookup of all users who unlocked a specific achievement
 * - Used for analytics and leaderboards
 */
userAchievementSchema.index({ achievementId: 1 });

// ============================================================================
// QUERY EXAMPLES (JSDoc)
// ============================================================================

/**
 * Common Query Patterns
 * 
 * @example Get all achievements for a user (most recent first)
 * const userAchievements = await UserAchievement.find({ userId })
 *   .sort({ unlockedAt: -1 });
 * 
 * @example Get user's recent achievements (last 5)
 * const recentAchievements = await UserAchievement.find({ userId })
 *   .sort({ unlockedAt: -1 })
 *   .limit(5);
 * 
 * @example Check if user has unlocked specific achievement
 * const hasUnlocked = await UserAchievement.exists({
 *   userId,
 *   achievementId: 'first-fast'
 * });
 * 
 * @example Unlock achievement for user
 * const unlock = await UserAchievement.create({
 *   userId: user._id,
 *   achievementId: 'sweet-sixteen',
 *   unlockedAt: new Date(),
 *   progress: 100
 * });
 * 
 * @example Unlock achievement with duplicate prevention (race condition safe)
 * try {
 *   await UserAchievement.create({
 *     userId,
 *     achievementId: 'first-fast',
 *     unlockedAt: new Date()
 *   });
 *   console.log('Achievement unlocked!');
 * } catch (error) {
 *   if (error.code === 11000) {
 *     console.log('Already unlocked');
 *   } else {
 *     throw error;
 *   }
 * }
 * 
 * @example Update progress for incremental achievement
 * const userAch = await UserAchievement.findOne({
 *   userId,
 *   achievementId: 'week-warrior'
 * });
 * userAch.progress += 10; // Increment by 10%
 * await userAch.save();
 * 
 * @example Mark notification as seen
 * await UserAchievement.findOneAndUpdate(
 *   { userId, achievementId: 'first-fast' },
 *   { notificationSeen: true }
 * );
 * 
 * @example Get achievements with details (manual join pattern)
 * // Step 1: Get user's unlocks
 * const unlocks = await UserAchievement.find({ userId });
 * 
 * // Step 2: Extract achievementIds
 * const achievementIds = unlocks.map(u => u.achievementId);
 * 
 * // Step 3: Fetch achievement details
 * const achievements = await Achievement.find({
 *   achievementId: { $in: achievementIds }
 * });
 * 
 * // Step 4: Merge data
 * const enriched = unlocks.map(unlock => {
 *   const achievement = achievements.find(a => a.achievementId === unlock.achievementId);
 *   return {
 *     ...unlock.toObject(),
 *     achievement: achievement ? achievement.toObject() : null
 *   };
 * });
 * 
 * @example Count total unlocked achievements for user
 * const count = await UserAchievement.countDocuments({ userId });
 * 
 * @example Get all users who unlocked specific achievement (analytics)
 * const users = await UserAchievement.find({ achievementId: 'first-fast' })
 *   .distinct('userId');
 */

// ============================================================================
// MODEL EXPORT
// ============================================================================

const UserAchievement = mongoose.models.UserAchievement || mongoose.model('UserAchievement', userAchievementSchema);

export default UserAchievement;
