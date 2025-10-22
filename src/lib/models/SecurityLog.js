/**
 * SecurityLog Model
 * 
 * Stores security-related events for audit and monitoring.
 * Only stores denied access attempts for security analysis.
 */

import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    // Type of security event
    action: {
      type: String,
      required: true,
      enum: ['ADMIN_ACCESS_DENIED'],
      index: true,
    },

    // User information (if available)
    userId: {
      type: String,
      default: 'anonymous',
      index: true,
    },

    email: {
      type: String,
      default: 'unknown',
      index: true,
    },

    // Request details
    ip: {
      type: String,
      default: 'unknown',
      index: true,
    },

    url: {
      type: String,
      required: true,
      index: true,
    },

    // Reason for denial
    reason: {
      type: String,
      required: true,
    },

    // Additional metadata
    userAgent: {
      type: String,
      default: 'unknown',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for common queries (filter by date range and action)
securityLogSchema.index({ action: 1, createdAt: -1 });

// Index for finding attempts by specific users
securityLogSchema.index({ userId: 1, createdAt: -1 });

// Index for detecting multiple attempts from same IP
securityLogSchema.index({ ip: 1, createdAt: -1 });

// TTL index - automatically delete logs older than 90 days (optional)
// Uncomment if you want automatic cleanup:
// securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const SecurityLog = mongoose.models.SecurityLog || mongoose.model('SecurityLog', securityLogSchema);

export default SecurityLog;
