/**
 * User Service
 * 
 * Provides high-level operations for user management, specifically for admin panel.
 * Handles user queries with pagination, filtering, and sorting capabilities.
 * 
 * Key Features:
 * - Paginated user lists (10-100 per page)
 * - Multi-field filtering (name, email, admin status)
 * - Multi-field sorting (name, email, registrationDate, lastLogin, isAdmin)
 * - Performance optimized with MongoDB aggregation pipeline
 * - Uses $facet for single-query pagination + data fetch
 * 
 * Performance Targets:
 * - <2 seconds for 1000 users (FR-009)
 * - Leverages indexes: name_1, registrationDate_1, lastLogin_1, isAdmin_1_registrationDate_-1
 * 
 * Used by: GET /api/admin/users endpoint
 */

import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Settings from '@/lib/models/Settings';
import InvalidatedToken from '@/lib/models/InvalidatedToken';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import mongoose from 'mongoose';

/**
 * Get paginated list of users with filtering and sorting
 * 
 * Uses MongoDB aggregation pipeline with $facet operator to:
 * 1. Count total matching documents
 * 2. Fetch paginated data
 * All in a single database query for optimal performance.
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based, default: 1)
 * @param {number} options.limit - Items per page (10-100, default: 25)
 * @param {string} [options.nameFilter] - Case-insensitive partial name match
 * @param {string} [options.emailFilter] - Case-insensitive partial email match
 * @param {string} [options.adminFilter] - 'all' | 'admin' | 'non-admin' (default: 'all')
 * @param {string} [options.sortBy] - Field to sort by: 'name' | 'email' | 'registrationDate' | 'lastLogin' | 'isAdmin' (default: 'registrationDate')
 * @param {string} [options.sortOrder] - Sort direction: 'asc' | 'desc' (default: 'desc')
 * 
 * @returns {Promise<Object>} Paginated result object
 * @returns {Array} result.users - Array of user documents
 * @returns {number} result.totalUsers - Total matching users (all pages)
 * @returns {number} result.totalPages - Total number of pages
 * @returns {number} result.currentPage - Current page number
 * @returns {number} result.pageSize - Items per page
 * @returns {boolean} result.hasNextPage - Whether there's a next page
 * @returns {boolean} result.hasPrevPage - Whether there's a previous page
 * 
 * @throws {Error} If database connection fails
 * @throws {Error} If invalid parameters provided
 * 
 * @example
 * const result = await getPaginatedUsers({
 *   page: 1,
 *   limit: 25,
 *   nameFilter: 'john',
 *   adminFilter: 'admin',
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * // Returns:
 * // {
 * //   users: [...], // 25 user objects
 * //   totalUsers: 150,
 * //   totalPages: 6,
 * //   currentPage: 1,
 * //   pageSize: 25,
 * //   hasNextPage: true,
 * //   hasPrevPage: false
 * // }
 */
export async function getPaginatedUsers({
  page = 1,
  limit = 25,
  nameFilter = '',
  emailFilter = '',
  adminFilter = 'all',
  sortBy = 'registrationDate',
  sortOrder = 'desc',
} = {}) {
  try {
    // Connect to database
    await connectDB();

    // ========================================================================
    // PARAMETER VALIDATION
    // ========================================================================

    // Validate and normalize page number (minimum 1)
    const pageNumber = Math.max(1, parseInt(page) || 1);

    // Validate and normalize limit (10-100 range)
    const pageSize = Math.min(100, Math.max(10, parseInt(limit) || 25));

    // Validate sortBy field (whitelist allowed fields)
    const validSortFields = ['name', 'email', 'registrationDate', 'lastLogin', 'isAdmin'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'registrationDate';

    // Validate and normalize sort order
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * pageSize;

    // ========================================================================
    // BUILD FILTER QUERY
    // ========================================================================

    const filterQuery = {
      isActive: true, // Only show active users (soft delete filter)
    };

    // Name filter: Case-insensitive partial match using regex
    if (nameFilter && nameFilter.trim()) {
      filterQuery.name = {
        $regex: nameFilter.trim(),
        $options: 'i', // Case-insensitive
      };
    }

    // Email filter: Case-insensitive partial match using regex
    if (emailFilter && emailFilter.trim()) {
      filterQuery.email = {
        $regex: emailFilter.trim(),
        $options: 'i', // Case-insensitive
      };
    }

    // Admin status filter
    if (adminFilter === 'admin') {
      filterQuery.isAdmin = true;
    } else if (adminFilter === 'non-admin') {
      filterQuery.isAdmin = { $ne: true }; // false or null
    }
    // If 'all', don't add isAdmin filter

    // ========================================================================
    // BUILD AGGREGATION PIPELINE
    // ========================================================================

    // Use $facet to run count and data queries in parallel (single DB roundtrip)
    const pipeline = [
      // Stage 1: Match documents based on filter query
      {
        $match: filterQuery,
      },

      // Stage 2: Facet - Run multiple pipelines in parallel
      {
        $facet: {
          // Facet 1: Count total matching documents
          metadata: [
            {
              $count: 'total',
            },
          ],

          // Facet 2: Get paginated data
          data: [
            // Sort by specified field and direction
            {
              $sort: { [sortField]: sortDirection },
            },
            // Skip to correct page
            {
              $skip: skip,
            },
            // Limit to page size
            {
              $limit: pageSize,
            },
            // Project only needed fields (exclude sensitive data)
            {
              $project: {
                _id: 1,
                email: 1,
                name: 1,
                picture: 1,
                emailVerified: 1,
                registrationDate: 1,
                lastLogin: 1,
                isActive: 1,
                isAdmin: 1,
                authMethod: 1,
                // Exclude: password (already excluded by select: false), rememberMe
              },
            },
          ],
        },
      },
    ];

    // ========================================================================
    // EXECUTE QUERY
    // ========================================================================

    const [result] = await User.aggregate(pipeline);

    // Extract results from facet
    const users = result.data || [];
    const totalUsers = result.metadata[0]?.total || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // ========================================================================
    // RETURN RESULT
    // ========================================================================

    return {
      users,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
      pageSize,
      hasNextPage,
      hasPrevPage,
    };
  } catch (error) {
    console.error('❌ Error in getPaginatedUsers:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

/**
 * Get total count of active users
 * 
 * Utility function for dashboard statistics.
 * 
 * @returns {Promise<number>} Total number of active users
 * 
 * @example
 * const count = await getTotalUserCount();
 * console.log(`Total users: ${count}`);
 */
export async function getTotalUserCount() {
  try {
    await connectDB();
    const count = await User.countDocuments({ isActive: true });
    return count;
  } catch (error) {
    console.error('❌ Error in getTotalUserCount:', error);
    throw new Error(`Failed to count users: ${error.message}`);
  }
}

/**
 * Get total count of admin users
 * 
 * Utility function for dashboard statistics.
 * 
 * @returns {Promise<number>} Total number of active admin users
 * 
 * @example
 * const count = await getAdminUserCount();
 * console.log(`Total admins: ${count}`);
 */
export async function getAdminUserCount() {
  try {
    await connectDB();
    const count = await User.countDocuments({ isActive: true, isAdmin: true });
    return count;
  } catch (error) {
    console.error('❌ Error in getAdminUserCount:', error);
    throw new Error(`Failed to count admin users: ${error.message}`);
  }
}

/**
 * Toggle admin status for a user
 * 
 * Grants or revokes admin privileges for a target user.
 * Includes self-protection: admins cannot modify their own status.
 * Creates audit log entry for every toggle attempt.
 * 
 * @param {string} targetUserId - ID of user to toggle admin status
 * @param {string} performingAdminId - ID of admin performing the action
 * 
 * @returns {Promise<Object>} Result object
 * @returns {boolean} result.success - Whether operation succeeded
 * @returns {Object} result.user - Updated user object
 * @returns {boolean} result.user.isAdmin - New admin status
 * @returns {string} result.message - Success/error message
 * 
 * @throws {Error} If self-modification attempted (403)
 * @throws {Error} If user not found (404)
 * @throws {Error} If database operation fails
 * 
 * @example
 * const result = await toggleAdminStatus(
 *   'user-123',
 *   'admin-456'
 * );
 * // Returns: { success: true, user: {...}, message: 'Admin status updated' }
 */
export async function toggleAdminStatus(targetUserId, performingAdminId) {
  try {
    await connectDB();

    // ========================================================================
    // SELF-PROTECTION CHECK
    // ========================================================================

    // Prevent admins from modifying their own admin status
    if (targetUserId === performingAdminId) {
      const error = new Error('Cannot modify your own admin status');
      error.statusCode = 403;
      error.code = 'SELF_MODIFICATION_BLOCKED';

      // Log blocked self-modification attempt
      const { logBlockedSelfModification } = await import('@/lib/services/auditService');
      await logBlockedSelfModification(performingAdminId, targetUserId);

      throw error;
    }

    // ========================================================================
    // FIND TARGET USER
    // ========================================================================

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // ========================================================================
    // TOGGLE ADMIN STATUS
    // ========================================================================

    // Toggle the admin flag
    const newAdminStatus = !targetUser.isAdmin;
    targetUser.isAdmin = newAdminStatus;
    await targetUser.save();

    // ========================================================================
    // CREATE AUDIT LOG
    // ========================================================================

    const { logToggleAdmin } = await import('@/lib/services/auditService');
    await logToggleAdmin(
      performingAdminId,
      targetUserId,
      targetUser.email,
      newAdminStatus
    );

    // ========================================================================
    // RETURN RESULT
    // ========================================================================

    console.log(`✅ Admin status toggled: ${targetUser.email} -> isAdmin=${newAdminStatus}`);

    return {
      success: true,
      user: {
        _id: targetUser._id.toString(),
        email: targetUser.email,
        name: targetUser.name,
        isAdmin: targetUser.isAdmin,
      },
      message: `User ${newAdminStatus ? 'granted' : 'revoked'} admin privileges`,
    };
  } catch (error) {
    console.error('❌ Error in toggleAdminStatus:', error);

    // Re-throw with existing status code if available
    if (error.statusCode) {
      throw error;
    }

    // Generic error
    throw new Error(`Failed to toggle admin status: ${error.message}`);
  }
}

/**
 * Delete user with cascade deletion of all related data
 * 
 * Permanently deletes a user and ALL related data using MongoDB transactions
 * to ensure atomic operation (all-or-nothing). If any deletion fails, the
 * entire transaction is rolled back.
 * 
 * CRITICAL: Self-deletion protection - admins cannot delete their own account.
 * 
 * Cascade Deletion (in order):
 * 1. FastingEntries (fasting records)
 * 2. Settings (user preferences)
 * 3. InvalidatedTokens (session invalidations)
 * 4. PasswordResetTokens (password reset requests)
 * 5. User document (main user record)
 * 6. Create AuditLog entry (successful deletion)
 * 
 * Transaction Guarantees:
 * - Atomicity: All deletions succeed or none do
 * - Consistency: Database remains in valid state
 * - Rollback: Failed deletions restore original state
 * 
 * Note: SecurityLog entries are NOT deleted (kept for audit trail).
 * 
 * @param {string} targetUserId - ID of user to delete
 * @param {string} performingAdminId - ID of admin performing deletion
 * 
 * @returns {Promise<Object>} Deletion summary
 * @returns {boolean} result.success - Always true on successful deletion
 * @returns {Object} result.deletedCounts - Count of deleted documents per collection
 * @returns {number} result.deletedCounts.entries - Fasting entries deleted
 * @returns {number} result.deletedCounts.settings - Settings documents deleted
 * @returns {number} result.deletedCounts.invalidatedTokens - Invalidated tokens deleted
 * @returns {number} result.deletedCounts.passwordResetTokens - Password reset tokens deleted
 * @returns {Object} result.user - Deleted user info
 * @returns {string} result.user._id - User ID
 * @returns {string} result.user.email - User email
 * @returns {string} result.user.name - User name
 * @returns {string} result.message - Success message
 * 
 * @throws {Error} 403 - Self-deletion attempt (statusCode: 403)
 * @throws {Error} 404 - User not found (statusCode: 404)
 * @throws {Error} 500 - Transaction failed, changes rolled back
 * 
 * @example
 * // Delete user with full cascade
 * const result = await deleteUserWithCascade('user123', 'admin456');
 * console.log(result.deletedCounts); // { entries: 42, settings: 1, ... }
 */
export async function deleteUserWithCascade(targetUserId, performingAdminId) {
  await connectDB();

  // ========================================================================
  // SELF-DELETION PROTECTION
  // ========================================================================

  if (targetUserId === performingAdminId) {
    const error = new Error('Admins cannot delete their own account');
    error.statusCode = 403;
    
    // Log blocked self-deletion attempt
    const { logBlockedSelfDeletion } = await import('@/lib/services/auditService');
    await logBlockedSelfDeletion(performingAdminId);
    
    throw error;
  }

  // ========================================================================
  // FIND TARGET USER
  // ========================================================================

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Store user info before deletion (for audit log)
  const deletedUserInfo = {
    _id: targetUser._id.toString(),
    email: targetUser.email,
    name: targetUser.name,
    isAdmin: targetUser.isAdmin,
  };

  // ========================================================================
  // CASCADE DELETION WITH TRANSACTION
  // ========================================================================

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  
  // Track deletion counts for summary
  const deletedCounts = {
    entries: 0,
    settings: 0,
    invalidatedTokens: 0,
    passwordResetTokens: 0,
  };

  try {
    // Start transaction
    await session.startTransaction();

    // 1. Delete all fasting entries for this user
    const entriesResult = await Entry.deleteMany(
      { userId: targetUserId },
      { session }
    );
    deletedCounts.entries = entriesResult.deletedCount;

    // 2. Delete user settings
    const settingsResult = await Settings.deleteMany(
      { userId: targetUserId },
      { session }
    );
    deletedCounts.settings = settingsResult.deletedCount;

    // 3. Delete invalidated tokens
    const invalidatedTokensResult = await InvalidatedToken.deleteMany(
      { userId: targetUserId },
      { session }
    );
    deletedCounts.invalidatedTokens = invalidatedTokensResult.deletedCount;

    // 4. Delete password reset tokens
    const passwordResetResult = await PasswordResetToken.deleteMany(
      { userId: targetUserId },
      { session }
    );
    deletedCounts.passwordResetTokens = passwordResetResult.deletedCount;

    // 5. Delete the user document (last, after all related data)
    await User.findByIdAndDelete(targetUserId, { session });

    // Commit transaction - all deletions succeeded
    await session.commitTransaction();

    // ========================================================================
    // AUDIT LOG (After successful deletion)
    // ========================================================================

    const { logDeleteUser } = await import('@/lib/services/auditService');
    await logDeleteUser(
      performingAdminId,
      targetUserId,
      deletedCounts,
      null // No HTTP request object available in service layer
    );

    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================

    return {
      success: true,
      deletedCounts,
      user: deletedUserInfo,
      message: `User ${deletedUserInfo.name || deletedUserInfo.email} deleted successfully`,
    };
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    console.error('❌ Error in deleteUserWithCascade (transaction rolled back):', error);

    // Re-throw with context
    throw new Error(`Failed to delete user (transaction rolled back): ${error.message}`);
  } finally {
    // Always end the session
    await session.endSession();
  }
}
