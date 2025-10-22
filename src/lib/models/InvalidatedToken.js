/**
 * InvalidatedToken Model
 * 
 * Tracks JWT tokens that have been invalidated (e.g., when admin privileges are revoked).
 * Used to force logout users by blacklisting their tokens.
 * 
 * Schema:
 * - userId: ID of user whose token was invalidated
 * - invalidatedAt: When the token was invalidated
 * - reason: Why token was invalidated (e.g., "admin_revoked")
 * 
 * Indexes:
 * - userId + invalidatedAt (compound) for fast lookups
 * - invalidatedAt (TTL) for automatic cleanup after 30 days
 * 
 * Flow:
 * 1. Admin revokes user's privileges
 * 2. Create InvalidatedToken entry with userId
 * 3. JWT callback checks if user has invalidated tokens newer than JWT issue time
 * 4. If found, return null to force logout
 */

import mongoose from 'mongoose';

const invalidatedTokenSchema = new mongoose.Schema(
  {
    // User whose token was invalidated
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // When the token was invalidated
    invalidatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Reason for invalidation
    reason: {
      type: String,
      enum: ['admin_revoked', 'admin_granted', 'manual_logout', 'security'],
      default: 'manual_logout',
    },
  },
  {
    timestamps: true,
    collection: 'invalidatedTokens',
  }
);

// Compound index for efficient lookups
invalidatedTokenSchema.index({ userId: 1, invalidatedAt: -1 });

// TTL index: automatically delete entries after 30 days (JWT max age)
invalidatedTokenSchema.index({ invalidatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/**
 * Static Methods
 */

/**
 * Invalidate all tokens for a user
 * 
 * @param {string} userId - User ID
 * @param {string} reason - Reason for invalidation
 * @returns {Promise<Object>} Created invalidation record
 */
invalidatedTokenSchema.statics.invalidateUser = async function (userId, reason = 'manual_logout') {
  return await this.create({
    userId,
    reason,
    invalidatedAt: new Date(),
  });
};

/**
 * Check if user has any invalidated tokens after a given time
 * 
 * @param {string} userId - User ID
 * @param {Date} afterTime - Check for invalidations after this time (JWT iat)
 * @returns {Promise<boolean>} True if token should be invalidated
 */
invalidatedTokenSchema.statics.isTokenInvalidated = async function (userId, afterTime) {
  const invalidation = await this.findOne({
    userId,
    invalidatedAt: { $gte: afterTime },
  });

  return !!invalidation;
};

/**
 * Clean up old invalidations (manual cleanup if needed)
 * TTL index handles this automatically, but this can be used for immediate cleanup
 * 
 * @param {number} daysOld - Delete entries older than this many days
 * @returns {Promise<Object>} Deletion result
 */
invalidatedTokenSchema.statics.cleanup = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await this.deleteMany({
    invalidatedAt: { $lt: cutoffDate },
  });
};

// Export model (handle model already exists in hot reload)
const InvalidatedToken =
  mongoose.models.InvalidatedToken || mongoose.model('InvalidatedToken', invalidatedTokenSchema);

export default InvalidatedToken;
