import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import auditLogService from './auditLogService.js';

/**
 * Service for admin achievement management operations
 * Provides CRUD operations with audit logging
 */
class AchievementAdminService {
  /**
   * List achievements with pagination, search, filters, and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.search] - Search term for name/description
   * @param {string} [options.status] - Filter by status (active/inactive/all)
   * @param {string} [options.category] - Filter by category
   * @param {string} [options.tier] - Filter by tier
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order (asc/desc)
   * @returns {Promise<Object>} Paginated results with achievements and metadata
   */
  async list(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      tier,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Build query
    const query = {};

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    // 'all' or undefined = no filter

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tier filter
    if (tier) {
      query.tier = tier;
    }

    // Search filter (case-insensitive regex on name and description)
    if (search) {
      query.$or = [
        { 'translations.en.name': { $regex: search, $options: 'i' } },
        { 'translations.en.description': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    let sort = {};
    if (sortBy === 'name') {
      sort['translations.en.name'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'points') {
      sort['rarity.score'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    try {
      // Execute query with pagination
      const [achievements, total] = await Promise.all([
        Achievement.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Achievement.countDocuments(query)
      ]);

      // Get unlock counts for all achievements (aggregate UserAchievements)
      const achievementIds = achievements.map(a => a.achievementId);
      const unlockCounts = await UserAchievement.aggregate([
        { $match: { achievementId: { $in: achievementIds } } },
        { $group: { _id: '$achievementId', count: { $sum: 1 } } }
      ]);

      // Map unlock counts to achievements
      const unlockMap = {};
      unlockCounts.forEach(item => {
        unlockMap[item._id] = item.count;
      });

      // Add unlock count to each achievement
      const achievementsWithStats = achievements.map(achievement => ({
        ...achievement,
        unlockCount: unlockMap[achievement.achievementId] || 0
      }));

      return {
        achievements: achievementsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Failed to list achievements:', error);
      throw error;
    }
  }

  /**
   * Get single achievement by achievementId
   * 
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<Object>} Achievement document
   * @throws {Error} If achievement not found
   */
  async getById(achievementId) {
    if (!achievementId) {
      throw new Error('achievementId is required');
    }

    const achievement = await Achievement.findOne({ achievementId });
    
    if (!achievement) {
      throw new Error(`Achievement with ID '${achievementId}' not found`);
    }

    return achievement;
  }

  /**
   * Create new achievement
   * 
   * @param {Object} data - Achievement data
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Created achievement
   */
  async create(data, userId, ipAddress, userAgent) {
    const {
      achievementId,
      translations,
      category,
      tier,
      criteria,
      rarity,
      order,
      isActive,
      isSecret,
      type
    } = data;

    // Validate required fields
    if (!achievementId) {
      throw new Error('achievementId is required');
    }
    if (!/^[a-z0-9-]+$/.test(achievementId)) {
      throw new Error('achievementId must contain only lowercase letters, numbers, and hyphens');
    }
    if (!translations?.en?.name) {
      throw new Error('English name is required');
    }
    if (!translations?.en?.description) {
      throw new Error('English description is required');
    }
    if (!category) {
      throw new Error('category is required');
    }
    if (!tier) {
      throw new Error('tier is required');
    }
    if (!criteria?.type) {
      throw new Error('criteria type is required');
    }
    if (!rarity?.score) {
      throw new Error('rarity score (points) is required');
    }

    // Check for duplicate achievementId
    const existing = await Achievement.findOne({ achievementId });
    if (existing) {
      throw new Error(`Achievement with ID '${achievementId}' already exists`);
    }

    // Map form data to Achievement model format
    const achievementData = {
      achievementId,
      translations,
      category,
      tier,
      criteria: {
        type: criteria.type,
        params: {
          value: criteria.value,
          description: criteria.description
        }
      },
      rarity,
      points: rarity.score, // Duplicate for compatibility with existing API
      order: order || 999,
      isActive: isActive !== undefined ? isActive : true,
      isSecret: isSecret !== undefined ? isSecret : false,
      type: type || 'automatic'
    };

    // Extract icon from English translation if present
    if (translations.en.iconUrl) {
      achievementData.icon = translations.en.iconUrl;
    }

    const achievement = await Achievement.create(achievementData);

    // Log creation action
    if (userId) {
      await auditLogService.log({
        userId,
        action: 'create-achievement',
        resource: 'achievement',
        resourceId: achievement.achievementId,
        changes: {
          created: {
            name: translations.en.name,
            category,
            tier,
            points: rarity.score
          }
        },
        ipAddress,
        userAgent
      });
    }

    return achievement;
  }

  /**
   * Update existing achievement
   * 
   * @param {string} achievementId - Achievement ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Updated achievement
   */
  async update(achievementId, updates, userId, ipAddress, userAgent) {
    if (!achievementId) {
      throw new Error('achievementId is required');
    }

    // Get existing achievement
    const existingAchievement = await Achievement.findOne({ achievementId });
    if (!existingAchievement) {
      throw new Error(`Achievement with ID '${achievementId}' not found`);
    }

    // Capture before state for audit log
    const beforeState = {
      name: existingAchievement.translations?.en?.name,
      category: existingAchievement.category,
      tier: existingAchievement.tier,
      points: existingAchievement.rarity?.score || existingAchievement.points,
      isActive: existingAchievement.isActive,
      isSecret: existingAchievement.isSecret
    };

    // Map updates to Achievement model format
    const updateData = { ...updates };
    
    // Handle criteria format if provided
    if (updates.criteria) {
      updateData.criteria = {
        type: updates.criteria.type,
        params: {
          value: updates.criteria.value,
          description: updates.criteria.description
        }
      };
    }

    // Sync points field if rarity.score is updated
    if (updates.rarity?.score) {
      updateData.points = updates.rarity.score;
    }

    // Extract icon from English translation if present
    if (updates.translations?.en?.iconUrl) {
      updateData.icon = updates.translations.en.iconUrl;
    }

    // Update the achievement
    const updatedAchievement = await Achievement.findOneAndUpdate(
      { achievementId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Capture after state for audit log
    const afterState = {
      name: updatedAchievement.translations?.en?.name,
      category: updatedAchievement.category,
      tier: updatedAchievement.tier,
      points: updatedAchievement.rarity?.score || updatedAchievement.points,
      isActive: updatedAchievement.isActive,
      isSecret: updatedAchievement.isSecret
    };

    // Log update action with before/after
    if (userId) {
      await auditLogService.log({
        userId,
        action: 'update-achievement',
        resource: 'achievement',
        resourceId: achievementId,
        changes: {
          before: beforeState,
          after: afterState
        },
        ipAddress,
        userAgent
      });
    }

    return updatedAchievement;
  }

  /**
   * Toggle achievement active status
   * 
   * @param {string} achievementId - Achievement ID
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Updated achievement
   */
  async toggleActive(achievementId, userId, ipAddress, userAgent) {
    if (!achievementId) {
      throw new Error('achievementId is required');
    }

    // Get existing achievement
    const achievement = await Achievement.findOne({ achievementId });
    if (!achievement) {
      throw new Error(`Achievement with ID '${achievementId}' not found`);
    }

    // Toggle the active status
    const newStatus = !achievement.isActive;
    achievement.isActive = newStatus;
    await achievement.save();

    // Log toggle action
    if (userId) {
      await auditLogService.log({
        userId,
        action: newStatus ? 'activate-achievement' : 'deactivate-achievement',
        resource: 'achievement',
        resourceId: achievementId,
        changes: {
          isActive: {
            before: !newStatus,
            after: newStatus
          }
        },
        ipAddress,
        userAgent
      });
    }

    return achievement;
  }

  /**
   * Bulk activate achievements
   * 
   * @param {Array<string>} achievementIds - Array of achievement IDs
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Operation summary
   */
  async bulkActivate(achievementIds, userId, ipAddress, userAgent) {
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      throw new Error('achievementIds array is required and must not be empty');
    }

    // Update all achievements
    const result = await Achievement.updateMany(
      { achievementId: { $in: achievementIds } },
      { $set: { isActive: true } }
    );

    // Log bulk action
    if (userId) {
      await auditLogService.log({
        userId,
        action: 'bulk-activate',
        resource: 'achievement',
        changes: {
          achievementIds,
          count: result.modifiedCount
        },
        ipAddress,
        userAgent
      });
    }

    return {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      achievementIds
    };
  }

  /**
   * Bulk deactivate achievements
   * 
   * @param {Array<string>} achievementIds - Array of achievement IDs
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Operation summary
   */
  async bulkDeactivate(achievementIds, userId, ipAddress, userAgent) {
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      throw new Error('achievementIds array is required and must not be empty');
    }

    // Update all achievements
    const result = await Achievement.updateMany(
      { achievementId: { $in: achievementIds } },
      { $set: { isActive: false } }
    );

    // Log bulk action
    if (userId) {
      await auditLogService.log({
        userId,
        action: 'bulk-deactivate',
        resource: 'achievement',
        changes: {
          achievementIds,
          count: result.modifiedCount
        },
        ipAddress,
        userAgent
      });
    }

    return {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      achievementIds
    };
  }

  /**
   * Delete achievement with cascade to UserAchievements
   * 
   * @param {string} achievementId - Achievement ID
   * @param {string} userId - Admin user ID (for audit log)
   * @param {string} ipAddress - Request IP
   * @param {string} userAgent - Request user agent
   * @returns {Promise<Object>} Deletion summary with usersAffected count
   */
  async delete(achievementId, userId, ipAddress, userAgent) {
    // TODO: Implement in T135
    throw new Error('Not implemented');
  }
}

export default new AchievementAdminService();
