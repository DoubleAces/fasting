/**
 * Settings Model
 * 
 * Stores user preferences and configuration for the fasting tracker.
 * Singleton pattern per user (unique userId constraint).
 * 
 * Schema Fields:
 * - userId: User identifier (default: 'default' for single-user app)
 * - measurementSystem: 'metric' (kg) or 'imperial' (lbs)
 * - timeFormat: '12h' (AM/PM) or '24h' (military time)
 * 
 * Features:
 * - Enum validation for measurementSystem and timeFormat
 * - Default values for all fields
 * - Unique constraint on userId
 * - Static method to get or create default settings
 * - Static method to find settings by userId
 * - Automatic timestamps (createdAt, updatedAt)
 */

import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    /**
     * User identifier
     * Default: 'default' (for single-user application)
     * Future-proof: can support multiple users
     */
    userId: {
      type: String,
      default: 'default',
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Measurement system preference
     * - metric: Weight in kilograms (kg)
     * - imperial: Weight in pounds (lbs)
     */
    measurementSystem: {
      type: String,
      enum: {
        values: ['metric', 'imperial'],
        message: '{VALUE} is not a valid enum value for path `{PATH}`.',
      },
      required: [true, 'Measurement system is required'],
      default: 'metric',
    },

    /**
     * Time format preference
     * - 12h: 12-hour format with AM/PM (e.g., 02:30 PM)
     * - 24h: 24-hour military format (e.g., 14:30)
     */
    timeFormat: {
      type: String,
      enum: {
        values: ['12h', '24h'],
        message: '{VALUE} is not a valid enum value for path `{PATH}`.',
      },
      required: [true, 'Time format is required'],
      default: '24h',
    },
  },
  {
    // Automatic timestamps
    timestamps: true,
    
    // Collection name
    collection: 'settings',
  }
);

// Indexes
settingsSchema.index({ userId: 1 }, { unique: true });

/**
 * Static method: Get or create default settings
 * 
 * Returns the default settings document (userId: 'default').
 * Creates it with default values if it doesn't exist.
 * 
 * @returns {Promise<Settings>} Default settings document
 * 
 * @example
 * const settings = await Settings.getOrCreateDefault();
 * console.log(settings.measurementSystem); // 'metric'
 * console.log(settings.timeFormat); // '24h'
 */
settingsSchema.statics.getOrCreateDefault = async function () {
  let settings = await this.findOne({ userId: 'default' });

  if (!settings) {
    settings = await this.create({
      userId: 'default',
      measurementSystem: 'metric',
      timeFormat: '24h',
    });
  }

  return settings;
};

/**
 * Static method: Find settings by userId
 * 
 * @param {string} userId - User identifier
 * @returns {Promise<Settings|null>} Settings document or null if not found
 * 
 * @example
 * const settings = await Settings.findByUserId('user123');
 * if (settings) {
 *   console.log(settings.measurementSystem);
 * }
 */
settingsSchema.statics.findByUserId = async function (userId) {
  return this.findOne({ userId });
};

// Export model (handle multiple imports)
const Settings =
  mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
