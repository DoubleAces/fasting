import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // 90 days in seconds (90 * 24 * 60 * 60)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'view-list',
      'view-analytics',
      'create-achievement',
      'update-achievement',
      'delete-achievement',
      'activate-achievement',
      'deactivate-achievement',
      'bulk-activate',
      'bulk-deactivate',
      'csv-export',
      'csv-import'
    ],
    required: true,
    index: true
  },
  resource: {
    type: String,
    enum: ['achievement', 'translation', 'analytics'],
    required: true
  },
  resourceId: {
    type: String,
    // achievementId for single operations, 'bulk' for bulk operations
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    // For updates: { before: {...}, after: {...} }
    // For bulk: { achievementIds: [...], count: N }
    // For CSV: { rowsProcessed: N, errors: [...] }
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
});

// Compound index for efficient queries by admin and action
adminAuditLogSchema.index({ userId: 1, action: 1 });

// Index for retention policy queries
adminAuditLogSchema.index({ timestamp: 1 });

export default mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);
