/**
 * Entry Mongoose Model
 * Represents a daily fasting entry with meal times, health metrics, and optional notes
 */

import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    // Date is the unique identifier for each entry (one entry per day)
    date: {
      type: Date,
      required: [true, 'Date is required'],
      unique: true,
      index: true,
    },

    // Meal timing (stored in 24-hour HH:mm format)
    firstMealTime: {
      type: String,
      required: [true, 'First meal time is required'],
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'First meal time must be in HH:mm format (e.g., 12:00 or 09:30)',
      },
    },

    lastMealTime: {
      type: String,
      required: [true, 'Last meal time is required'],
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Last meal time must be in HH:mm format (e.g., 20:00 or 21:30)',
      },
    },

    // Calculated fasting duration in MINUTES (can be null if previous entry missing)
    fastingDuration: {
      type: Number,
      min: 0,
      default: null,
    },

    // Flag indicating user confirmed an extended fast (>24h gap from previous entry)
    extendedFastConfirmed: {
      type: Boolean,
      default: false,
    },

    // Health metrics
    hoursOfSleep: {
      type: Number,
      min: [0, 'Hours of sleep must be positive'],
      max: [24, 'Hours of sleep cannot exceed 24'],
    },

    morningWeight: {
      type: Number,
      min: [0, 'Weight must be positive'],
    },

    // Rating scales (text-based for clarity)
    hungerLevel: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Hunger level must be Low, Medium, or High',
      },
    },

    energyLevel: {
      type: String,
      enum: {
        values: ['Low Energy', 'Medium Energy', 'High Energy'],
        message: 'Energy level must be Low Energy, Medium Energy, or High Energy',
      },
    },

    wellBeing: {
      type: String,
      enum: {
        values: ['Poor', 'Fair', 'Good'],
        message: 'Well-being must be Poor, Fair, or Good',
      },
    },

    // Optional food intake notes
    foodNotes: {
      type: String,
      maxlength: [2000, 'Food notes cannot exceed 2000 characters'],
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    
    // Customize JSON output
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert date to YYYY-MM-DD format for consistency
        if (ret.date) {
          ret.dateString = ret.date.toISOString().split('T')[0];
        }
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
entrySchema.index({ date: -1 }); // Sort by date descending (most recent first)
entrySchema.index({ createdAt: -1 }); // Sort by creation time

// Virtual for formatted fasting duration
entrySchema.virtual('fastingDurationFormatted').get(function () {
  if (this.fastingDuration === null || this.fastingDuration === undefined) {
    return 'N/A';
  }
  
  const hours = Math.floor(this.fastingDuration);
  const minutes = Math.round((this.fastingDuration - hours) * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
});

// Instance method to check if entry is complete
entrySchema.methods.isComplete = function () {
  return !!(
    this.date &&
    this.firstMealTime &&
    this.lastMealTime &&
    this.hoursOfSleep !== undefined &&
    this.morningWeight !== undefined &&
    this.hungerLevel &&
    this.energyLevel &&
    this.wellBeing
  );
};

// Static method to find entries by date range
entrySchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Static method to get most recent entry
entrySchema.statics.getMostRecent = function () {
  return this.findOne().sort({ date: -1 });
};

// Static method to get entry by date string (YYYY-MM-DD)
entrySchema.statics.findByDateString = function (dateString) {
  const date = new Date(dateString);
  return this.findOne({ date });
};

// Pre-save hook to normalize date to start of day (midnight UTC)
entrySchema.pre('save', function (next) {
  if (this.isModified('date')) {
    const date = new Date(this.date);
    date.setUTCHours(0, 0, 0, 0);
    this.date = date;
  }
  next();
});

// Create and export the model
const Entry = mongoose.models.Entry || mongoose.model('Entry', entrySchema);

export default Entry;
