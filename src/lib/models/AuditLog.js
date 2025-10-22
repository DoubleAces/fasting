/**
 * AuditLog Model
 * 
 * Records administrative actions for compliance, security, and investigation.
 * Created for Feature 006: Admin User Management.
 * 
 * Purpose:
 * - Track all admin privilege changes (FR-042)
 * - Track all user deletions with cascade data counts (FR-043)
 * - Record blocked self-modification and self-deletion attempts (FR-027, FR-035)
 * - Maintain audit trail for compliance and security investigations
 * 
 * Lifecycle:
 * - Created when admin actions occur (toggle, delete, blocked attempts)
 * - NOT deleted when user is deleted (preserves audit trail)
 * - Queryable by action type, performer, target, or date range
 * 
 * Schema Fields:
 * - action: Type of administrative action (TOGGLE_ADMIN, DELETE_USER, etc.)
 * - performedBy: User ID of admin who performed action
 * - targetUser: User ID of user affected by action
 * - oldValue: Previous state (for toggles: { isAdmin: false })
 * - newValue: New state (for toggles: { isAdmin: true })
 * - details: Additional context (for deletes: counts of cascade deleted records)
 * - blocked: Whether action was prevented by validation (self-modification protection)
 * - timestamp: When action occurred
 * - ipAddress: Optional IP address for security context
 * - userAgent: Optional user agent for security context
 * 
 * Indexes:
 * - Single: action, performedBy, targetUser, timestamp
 * - Compound: { performedBy: 1, timestamp: -1 }, { targetUser: 1, timestamp: -1 }, { action: 1, timestamp: -1 }
 * 
 * Security:
 * - Audit logs are immutable after creation
 * - No update or delete methods provided
 * - Only admins can query audit logs
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    /**
     * Action type
     * - TOGGLE_ADMIN: Admin privilege granted or revoked
     * - DELETE_USER: User account deleted with cascade
     * - SELF_MODIFICATION_ATTEMPT: Admin tried to modify their own status (blocked)
     * - SELF_DELETION_ATTEMPT: Admin tried to delete their own account (blocked)
     */
    action: {
      type: String,
      enum: {
        values: [
          'TOGGLE_ADMIN',
          'DELETE_USER',
          'SELF_MODIFICATION_ATTEMPT',
          'SELF_DELETION_ATTEMPT',
        ],
        message: 'Action must be one of: TOGGLE_ADMIN, DELETE_USER, SELF_MODIFICATION_ATTEMPT, SELF_DELETION_ATTEMPT',
      },
      required: [true, 'Action type is required'],
      index: true,
    },

    /**
     * User who performed the action
     * - References User collection
     * - Required for all actions
     * - Indexed for querying actions by admin
     */
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'PerformedBy user ID is required'],
      index: true,
    },

    /**
     * User affected by the action
     * - References User collection
     * - Required for all actions
     * - Indexed for querying actions by target user
     * - Note: User may be deleted, but audit log remains
     */
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Target user ID is required'],
      index: true,
    },

    /**
     * Previous state (for TOGGLE_ADMIN)
     * - Example: { isAdmin: false }
     * - Null for DELETE_USER and blocked attempts
     */
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * New state (for TOGGLE_ADMIN)
     * - Example: { isAdmin: true }
     * - Null for DELETE_USER and blocked attempts
     */
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * Additional details
     * - For DELETE_USER: Counts of cascade deleted records
     *   Example: { fastingEntries: 47, userSettings: 1, passwordResetTokens: 2, securityLogs: 15 }
     * - For blocked attempts: Error message
     *   Example: { error: 'Cannot modify own admin status' }
     */
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * Whether action was blocked
     * - true: Action was prevented (self-modification, self-deletion)
     * - false: Action was successfully performed
     */
    blocked: {
      type: Boolean,
      default: false,
    },

    /**
     * Timestamp of action
     * - Automatically set to current time
     * - Indexed for time-based queries
     * - Immutable after creation
     */
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      immutable: true,
    },

    /**
     * IP address of admin (optional)
     * - For security context and investigation
     */
    ipAddress: {
      type: String,
      default: null,
    },

    /**
     * User agent of admin (optional)
     * - For security context and device tracking
     */
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    // Disable timestamps (using custom timestamp field)
    timestamps: false,

    // Collection name
    collection: 'AuditLogs',
  }
);

// ============================================================================
// COMPOUND INDEXES
// ============================================================================

// Index for querying actions by admin (most recent first)
auditLogSchema.index({ performedBy: 1, timestamp: -1 });

// Index for querying actions affecting a user (most recent first)
auditLogSchema.index({ targetUser: 1, timestamp: -1 });

// Index for querying by action type (most recent first)
auditLogSchema.index({ action: 1, timestamp: -1 });

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Convert audit log to safe object (exclude internal fields)
 * @returns {Object} Safe audit log object
 */
auditLogSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    action: this.action,
    performedBy: this.performedBy.toString(),
    targetUser: this.targetUser.toString(),
    oldValue: this.oldValue,
    newValue: this.newValue,
    details: this.details,
    blocked: this.blocked,
    timestamp: this.timestamp.toISOString(),
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
  };
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Create audit log for admin toggle action
 * 
 * @param {string} performedBy - Admin user ID
 * @param {string} targetUser - Target user ID
 * @param {boolean} oldValue - Previous admin status
 * @param {boolean} newValue - New admin status
 * @param {Object} request - Optional request object for IP/UA
 * @returns {Promise<AuditLog>} Created audit log
 */
auditLogSchema.statics.logToggleAdmin = async function (
  performedBy,
  targetUser,
  oldValue,
  newValue,
  request = null
) {
  return this.create({
    action: 'TOGGLE_ADMIN',
    performedBy,
    targetUser,
    oldValue: { isAdmin: oldValue },
    newValue: { isAdmin: newValue },
    blocked: false,
    ipAddress: request?.ip || request?.headers?.['x-forwarded-for'] || null,
    userAgent: request?.headers?.['user-agent'] || null,
  });
};

/**
 * Create audit log for user deletion action
 * 
 * @param {string} performedBy - Admin user ID
 * @param {string} targetUser - Deleted user ID
 * @param {Object} deletionCounts - Cascade deletion counts
 * @param {Object} request - Optional request object for IP/UA
 * @returns {Promise<AuditLog>} Created audit log
 */
auditLogSchema.statics.logDeleteUser = async function (
  performedBy,
  targetUser,
  deletionCounts,
  request = null
) {
  return this.create({
    action: 'DELETE_USER',
    performedBy,
    targetUser,
    details: deletionCounts,
    blocked: false,
    ipAddress: request?.ip || request?.headers?.['x-forwarded-for'] || null,
    userAgent: request?.headers?.['user-agent'] || null,
  });
};

/**
 * Create audit log for blocked self-modification attempt
 * 
 * @param {string} userId - Admin user ID (both performer and target)
 * @param {Object} request - Optional request object for IP/UA
 * @returns {Promise<AuditLog>} Created audit log
 */
auditLogSchema.statics.logBlockedSelfModification = async function (
  userId,
  request = null
) {
  return this.create({
    action: 'SELF_MODIFICATION_ATTEMPT',
    performedBy: userId,
    targetUser: userId,
    details: { error: 'Cannot modify own admin status' },
    blocked: true,
    ipAddress: request?.ip || request?.headers?.['x-forwarded-for'] || null,
    userAgent: request?.headers?.['user-agent'] || null,
  });
};

/**
 * Create audit log for blocked self-deletion attempt
 * 
 * @param {string} userId - Admin user ID (both performer and target)
 * @param {Object} request - Optional request object for IP/UA
 * @returns {Promise<AuditLog>} Created audit log
 */
auditLogSchema.statics.logBlockedSelfDeletion = async function (
  userId,
  request = null
) {
  return this.create({
    action: 'SELF_DELETION_ATTEMPT',
    performedBy: userId,
    targetUser: userId,
    details: { error: 'Cannot delete own account' },
    blocked: true,
    ipAddress: request?.ip || request?.headers?.['x-forwarded-for'] || null,
    userAgent: request?.headers?.['user-agent'] || null,
  });
};

// ============================================================================
// PRE-SAVE HOOKS
// ============================================================================

/**
 * Pre-save hook: Prevent updates to audit logs
 * Audit logs are immutable after creation
 */
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be updated'));
  }
  next();
});

// ============================================================================
// MODEL EXPORT
// ============================================================================

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
