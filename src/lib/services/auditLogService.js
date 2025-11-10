import AdminAuditLog from '../models/AdminAuditLog.js';

/**
 * Service for managing admin audit logs
 * Logs all administrative actions with full context for compliance and debugging
 */
class AuditLogService {
  /**
   * Log an administrative action
   * 
   * @param {Object} params - Audit log parameters
   * @param {string} params.userId - MongoDB ObjectId of the admin user
   * @param {string} params.action - Action type (create-achievement, update-achievement, etc.)
   * @param {string} params.resource - Resource type (achievement, translation, analytics)
   * @param {string} [params.resourceId] - ID of the affected resource
   * @param {Object} [params.changes] - Changes made (before/after for updates, summary for bulk)
   * @param {string} params.ipAddress - IP address of the request
   * @param {string} params.userAgent - User agent string from request headers
   * @returns {Promise<Object>} Created audit log document
   */
  async log({ userId, action, resource, resourceId, changes, ipAddress, userAgent }) {
    try {
      const logEntry = await AdminAuditLog.create({
        userId,
        action,
        resource,
        resourceId,
        changes,
        ipAddress,
        userAgent,
        timestamp: new Date()
      });

      return logEntry;
    } catch (error) {
      // Log but don't throw - audit logging should not break operations
      console.error('Failed to create audit log:', error);
      return null;
    }
  }

  /**
   * Query audit logs with filters
   * 
   * @param {Object} filters - Query filters
   * @param {string} [filters.userId] - Filter by admin user
   * @param {string} [filters.action] - Filter by action type
   * @param {string} [filters.resource] - Filter by resource type
   * @param {Date} [filters.startDate] - Filter logs after this date
   * @param {Date} [filters.endDate] - Filter logs before this date
   * @param {number} [filters.limit=100] - Maximum number of results
   * @returns {Promise<Array>} Array of audit log documents
   */
  async query({ userId, action, resource, startDate, endDate, limit = 100 }) {
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    try {
      const logs = await AdminAuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email')
        .lean();

      return logs;
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   * 
   * @param {string} userId - Optional: Filter by admin user
   * @param {Date} startDate - Start date for statistics
   * @param {Date} endDate - End date for statistics
   * @returns {Promise<Object>} Statistics summary
   */
  async getStatistics(userId, startDate, endDate) {
    const matchStage = { timestamp: { $gte: startDate, $lte: endDate } };
    if (userId) matchStage.userId = userId;

    try {
      const stats = await AdminAuditLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const total = stats.reduce((sum, item) => sum + item.count, 0);

      return {
        total,
        byAction: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Failed to get audit log statistics:', error);
      throw error;
    }
  }
}

export default new AuditLogService();
