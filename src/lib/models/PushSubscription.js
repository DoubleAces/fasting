import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One subscription per user
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: Number,
      default: null,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    preferences: {
      fastingWindowReminder: {
        type: Boolean,
        default: true,
      },
      dailyStreak: {
        type: Boolean,
        default: true,
      },
      weeklyReport: {
        type: Boolean,
        default: true,
      },
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastNotificationAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for notification queries
pushSubscriptionSchema.index({ 'preferences.fastingWindowReminder': 1 });
pushSubscriptionSchema.index({ 'preferences.dailyStreak': 1 });
pushSubscriptionSchema.index({ 'preferences.weeklyReport': 1 });

const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
