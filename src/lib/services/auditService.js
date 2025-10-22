/**
 * Audit Service
 * 
 * Provides high-level audit logging functionality for admin actions.
 * Wraps the AuditLog model with convenient methods for common operations.
 * 
 * Feature: 006-admin-user-management (FR-042, FR-043)
 * 
 * Purpose:
 * - Create audit logs for admin privilege changes
 * - Create audit logs for user deletions with cascade counts
 * - Create audit logs for blocked self-modification/deletion attempts
 * - Query audit logs by action, performer, target, or date range
 * 
 * Usage:
 * ```javascript
 * import * as auditService from '@/lib/services/auditService';
 * 
 * // Log admin toggle
 * await auditService.logToggleAdmin(adminId, userId, false, true, request);
 * 
 * // Log user deletion
 * await auditService.logDeleteUser(adminId, userId, deletionCounts, request);
 * 
 * // Log blocked attempt
 * await auditService.logBlockedSelfModification(adminId, request);
 * ```
 */

import AuditLog from '../models/AuditLog.js';

/**
 * Log admin privilege toggle action
 * 
 * Creates audit log when admin status is granted or revoked (FR-042).
 * Records who made the change, which user was affected, and the state transition.
 * 
 * @param {string} performedBy - User ID of admin who performed the action
 * @param {string} targetUser - User ID of user whose admin status was changed
 * @param {boolean} oldValue - Previous admin status (true/false)
 * @param {boolean} newValue - New admin status (true/false)
 * @param {Object} request - Optional HTTP request object for IP/UA context
 * @returns {Promise<Object>} Created audit log entry
 * 
 * @example
 * // Grant admin privileges
 * await logToggleAdmin('admin123', 'user456', false, true, req);
 * // Result: "admin123 granted admin privileges to user456"
 * 
 * // Revoke admin privileges
 * await logToggleAdmin('admin123', 'user789', true, false, req);
 * // Result: "admin123 revoked admin privileges from user789"
 */
export async function logToggleAdmin(performedBy, targetUser, oldValue, newValue, request = null) {
  try {
    const auditLog = await AuditLog.logToggleAdmin(
      performedBy,
      targetUser,
      oldValue,
      newValue,
      request
    );
    
    console.log(
      `✅ Audit log created: ${performedBy} ${newValue ? 'granted' : 'revoked'} admin to ${targetUser}`
    );
    
    return auditLog.toSafeObject();
  } catch (error) {
    console.error('❌ Failed to create toggle admin audit log:', error.message);
    throw new Error(`Audit logging failed: ${error.message}`);
  }
}

/**
 * Log user deletion action with cascade counts
 * 
 * Creates audit log when user is deleted with all related data (FR-043).
 * Records who performed deletion, which user was deleted, and counts of deleted records.
 * 
 * @param {string} performedBy - User ID of admin who performed the deletion
 * @param {string} targetUser - User ID of deleted user
 * @param {Object} deletionCounts - Counts of cascade deleted records
 * @param {number} deletionCounts.fastingEntries - Count of deleted fasting entries
 * @param {number} deletionCounts.userSettings - Count of deleted settings (0 or 1)
 * @param {number} deletionCounts.passwordResetTokens - Count of deleted tokens
 * @param {number} deletionCounts.securityLogs - Count of deleted security logs
 * @param {Object} request - Optional HTTP request object for IP/UA context
 * @returns {Promise<Object>} Created audit log entry
 * 
 * @example
 * await logDeleteUser('admin123', 'user456', {
 *   fastingEntries: 47,
 *   userSettings: 1,
 *   passwordResetTokens: 2,
 *   securityLogs: 15
 * }, req);
 * // Result: "admin123 deleted user456 (47 entries, 1 settings, 2 tokens, 15 logs)"
 */
export async function logDeleteUser(performedBy, targetUser, deletionCounts, request = null) {
  try {
    const auditLog = await AuditLog.logDeleteUser(
      performedBy,
      targetUser,
      deletionCounts,
      request
    );
    
    const total = Object.values(deletionCounts).reduce((sum, count) => sum + count, 0);
    console.log(
      `✅ Audit log created: ${performedBy} deleted ${targetUser} (${total} related records)`
    );
    
    return auditLog.toSafeObject();
  } catch (error) {
    console.error('❌ Failed to create delete user audit log:', error.message);
    throw new Error(`Audit logging failed: ${error.message}`);
  }
}

/**
 * Log blocked self-modification attempt
 * 
 * Creates audit log when admin tries to modify their own admin status (FR-027).
 * This is a security event that should be tracked for investigation.
 * 
 * @param {string} userId - User ID of admin who attempted self-modification
 * @param {Object} request - Optional HTTP request object for IP/UA context
 * @returns {Promise<Object>} Created audit log entry
 * 
 * @example
 * await logBlockedSelfModification('admin123', req);
 * // Result: "admin123 attempted to modify their own admin status (BLOCKED)"
 */
export async function logBlockedSelfModification(userId, request = null) {
  try {
    const auditLog = await AuditLog.logBlockedSelfModification(userId, request);
    
    console.warn(
      `⚠️  Blocked self-modification attempt by ${userId}`
    );
    
    return auditLog.toSafeObject();
  } catch (error) {
    console.error('❌ Failed to log blocked self-modification:', error.message);
    throw new Error(`Audit logging failed: ${error.message}`);
  }
}

/**
 * Log blocked self-deletion attempt
 * 
 * Creates audit log when admin tries to delete their own account (FR-035).
 * This is a security event that should be tracked for investigation.
 * 
 * @param {string} userId - User ID of admin who attempted self-deletion
 * @param {Object} request - Optional HTTP request object for IP/UA context
 * @returns {Promise<Object>} Created audit log entry
 * 
 * @example
 * await logBlockedSelfDeletion('admin123', req);
 * // Result: "admin123 attempted to delete their own account (BLOCKED)"
 */
export async function logBlockedSelfDeletion(userId, request = null) {
  try {
    const auditLog = await AuditLog.logBlockedSelfDeletion(userId, request);
    
    console.warn(
      `⚠️  Blocked self-deletion attempt by ${userId}`
    );
    
    return auditLog.toSafeObject();
  } catch (error) {
    console.error('❌ Failed to log blocked self-deletion:', error.message);
    throw new Error(`Audit logging failed: ${error.message}`);
  }
}

/**
 * Get audit logs for a specific admin user
 * 
 * Retrieves all actions performed by a specific admin, newest first.
 * Useful for admin activity monitoring and accountability.
 * 
 * @param {string} adminId - User ID of admin
 * @param {number} limit - Maximum number of logs to return (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 * 
 * @example
 * const logs = await getLogsByAdmin('admin123', 50);
 * // Returns up to 50 most recent actions by admin123
 */
export async function getLogsByAdmin(adminId, limit = 100) {
  try {
    const logs = await AuditLog.find({ performedBy: adminId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      targetUser: log.targetUser.toString(),
      oldValue: log.oldValue,
      newValue: log.newValue,
      details: log.details,
      blocked: log.blocked,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch logs by admin:', error.message);
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }
}

/**
 * Get audit logs for a specific target user
 * 
 * Retrieves all actions affecting a specific user, newest first.
 * Useful for investigating changes to a user's account.
 * 
 * @param {string} userId - User ID of target user
 * @param {number} limit - Maximum number of logs to return (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 * 
 * @example
 * const logs = await getLogsByTargetUser('user456', 20);
 * // Returns up to 20 most recent actions affecting user456
 */
export async function getLogsByTargetUser(userId, limit = 100) {
  try {
    const logs = await AuditLog.find({ targetUser: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      performedBy: log.performedBy.toString(),
      oldValue: log.oldValue,
      newValue: log.newValue,
      details: log.details,
      blocked: log.blocked,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch logs by target user:', error.message);
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }
}

/**
 * Get audit logs by action type
 * 
 * Retrieves all logs for a specific action type, newest first.
 * Useful for tracking specific types of administrative actions.
 * 
 * @param {string} action - Action type (TOGGLE_ADMIN, DELETE_USER, etc.)
 * @param {number} limit - Maximum number of logs to return (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 * 
 * @example
 * const deletions = await getLogsByAction('DELETE_USER', 50);
 * // Returns up to 50 most recent user deletions
 */
export async function getLogsByAction(action, limit = 100) {
  try {
    const logs = await AuditLog.find({ action })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      performedBy: log.performedBy.toString(),
      targetUser: log.targetUser.toString(),
      oldValue: log.oldValue,
      newValue: log.newValue,
      details: log.details,
      blocked: log.blocked,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch logs by action:', error.message);
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }
}

/**
 * Get recent audit logs
 * 
 * Retrieves most recent audit logs across all actions and users.
 * Useful for admin dashboard or activity monitoring.
 * 
 * @param {number} limit - Maximum number of logs to return (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 * 
 * @example
 * const recentLogs = await getRecentLogs(20);
 * // Returns 20 most recent admin actions
 */
export async function getRecentLogs(limit = 100) {
  try {
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('performedBy', 'name email')
      .populate('targetUser', 'name email')
      .lean();
    
    return logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      performedBy: {
        id: log.performedBy._id.toString(),
        name: log.performedBy.name,
        email: log.performedBy.email,
      },
      targetUser: {
        id: log.targetUser._id.toString(),
        name: log.targetUser.name,
        email: log.targetUser.email,
      },
      oldValue: log.oldValue,
      newValue: log.newValue,
      details: log.details,
      blocked: log.blocked,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch recent logs:', error.message);
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }
}
