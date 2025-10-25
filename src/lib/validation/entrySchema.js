/**
 * Entry Validation Schema
 * 
 * Joi schema for validating entry form data before database operations.
 * Ensures data integrity and provides clear error messages for users.
 * 
 * @module entrySchema
 */

import Joi from 'joi';

/**
 * Time format regex pattern (HH:mm or H:mm)
 * Matches: 00:00 to 23:59, also accepts single digit hours (0:00 to 9:59)
 */
const TIME_PATTERN = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * Entry validation schema
 * 
 * Required fields:
 * - date: ISO date string (YYYY-MM-DD), cannot be in future
 * - firstMealTime: Time in HH:mm format (24-hour)
 * - lastMealTime: Time in HH:mm format (24-hour)
 * 
 * Optional fields:
 * - fastingDuration: Number (0-168 hours = 7 days)
 * - hoursOfSleep: Number (0-24 hours)
 * - morningWeight: Number (positive, max 1000 kg or ~2204 lbs)
 * - hungerLevel: Enum ('Low', 'Medium', 'High')
 * - energyLevel: Enum ('Low', 'Medium', 'High Energy')
 * - wellBeing: Enum ('Poor', 'Fair', 'Good')
 * - foodNotes: String (max 2000 characters)
 */
export const entrySchema = Joi.object({
  /**
   * Entry date (required)
   * Must be ISO date string (YYYY-MM-DD)
   * Cannot be more than 1 day in the future (allows for timezone differences)
   */
  date: Joi.date()
    .iso()
    .custom((value, helpers) => {
      // Validate that date is not too far in the future
      // Allow up to 1 day ahead to account for timezone differences
      const inputDate = new Date(value);
      const now = new Date();
      
      // Get the date portion in UTC
      const inputYear = inputDate.getUTCFullYear();
      const inputMonth = inputDate.getUTCMonth();
      const inputDay = inputDate.getUTCDate();
      
      const nowYear = now.getUTCFullYear();
      const nowMonth = now.getUTCMonth();
      const nowDay = now.getUTCDate();
      
      // Create date-only comparison (YYYY-MM-DD)
      const inputDateOnly = new Date(Date.UTC(inputYear, inputMonth, inputDay));
      const nowDateOnly = new Date(Date.UTC(nowYear, nowMonth, nowDay));
      
      // Calculate difference in days
      const diffDays = (inputDateOnly - nowDateOnly) / (1000 * 60 * 60 * 24);
      
      // Allow entries for up to 1 day in the future (accounts for timezone differences)
      // This allows users in UTC+12 to create entries when server is still on previous day
      if (diffDays > 1) {
        return helpers.error('date.max');
      }
      
      return value;
    })
    .required()
    .messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
      'date.max': 'Date cannot be in the future',
      'any.required': 'Date is required',
    }),

  /**
   * First meal time (required)
   * Must be in HH:mm format (24-hour)
   */
  firstMealTime: Joi.string()
    .pattern(TIME_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'First meal time must be in HH:mm format (e.g., 08:30 or 14:00)',
      'any.required': 'First meal time is required',
    }),

  /**
   * Last meal time (required)
   * Must be in HH:mm format (24-hour)
   */
  lastMealTime: Joi.string()
    .pattern(TIME_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'Last meal time must be in HH:mm format (e.g., 08:30 or 14:00)',
      'any.required': 'Last meal time is required',
    }),

  /**
   * Fasting duration in hours (optional)
   * Range: 0 to 168 hours (7 days)
   */
  fastingDuration: Joi.number()
    .min(0)
    .max(168)
    .optional()
    .messages({
      'number.base': 'Fasting duration must be a number',
      'number.min': 'Fasting duration cannot be negative',
      'number.max': 'Fasting duration cannot exceed 168 hours (7 days)',
    }),

  /**
   * Hours of sleep (optional)
   * Range: 0 to 24 hours
   */
  hoursOfSleep: Joi.number()
    .min(0)
    .max(24)
    .optional()
    .messages({
      'number.base': 'Hours of sleep must be a number',
      'number.min': 'Hours of sleep cannot be negative',
      'number.max': 'Hours of sleep cannot exceed 24 hours',
    }),

  /**
   * Morning weight (optional)
   * Must be positive, max 1000 (kg or lbs depending on user settings)
   */
  morningWeight: Joi.number()
    .positive()
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Morning weight must be a number',
      'number.positive': 'Morning weight must be a positive number',
      'number.max': 'Morning weight cannot exceed 1000',
    }),

  /**
   * Hunger level (optional)
   * Enum: 'Low', 'Medium', 'High'
   */
  hungerLevel: Joi.string()
    .valid('Low', 'Medium', 'High')
    .optional()
    .messages({
      'any.only': 'Hunger level must be one of: Low, Medium, High',
    }),

  /**
   * Energy level (optional)
   * Enum: 'Low Energy', 'Medium Energy', 'High Energy'
   */
  energyLevel: Joi.string()
    .valid('Low Energy', 'Medium Energy', 'High Energy')
    .optional()
    .messages({
      'any.only': 'Energy level must be one of: Low Energy, Medium Energy, High Energy',
    }),

  /**
   * Well-being (optional)
   * Enum: 'Poor', 'Fair', 'Good'
   */
  wellBeing: Joi.string()
    .valid('Poor', 'Fair', 'Good')
    .optional()
    .messages({
      'any.only': 'Well-being must be one of: Poor, Fair, Good',
    }),

  /**
   * Food notes (optional)
   * Max length: 2000 characters
   */
  foodNotes: Joi.string()
    .max(2000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Food notes cannot exceed 2000 characters',
    }),

  /**
   * Extended fast confirmation (optional)
   * Boolean flag indicating user confirmed fasting across multi-day gap
   */
  extendedFastConfirmed: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Extended fast confirmation must be true or false',
    }),

  /**
   * Extended fast denied (optional)
   * Boolean flag indicating user clicked "No, I ate but didn't log"
   */
  extendedFastDenied: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Extended fast denied must be true or false',
    }),

  /**
   * Extended fast to next denied (optional)
   * Boolean flag indicating user clicked "No" for extended fast to next entry
   */
  extendedFastToNextDenied: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Extended fast to next denied must be true or false',
    }),
}).options({
  stripUnknown: true, // Remove unknown fields
  abortEarly: false,  // Return all errors, not just the first one
});

/**
 * Validate entry data
 * 
 * @param {Object} data - Entry data to validate
 * @returns {Object} Validation result with error and value
 * @returns {Object.error} Joi validation error (if validation fails)
 * @returns {Object.value} Validated and sanitized data
 * 
 * @example
 * const { error, value } = validateEntry({
 *   date: '2024-03-15',
 *   firstMealTime: '12:00',
 *   lastMealTime: '20:00',
 *   hungerLevel: 'Low'
 * });
 * 
 * if (error) {
 *   console.error('Validation errors:', error.details);
 * } else {
 *   // Use validated data
 *   await Entry.create(value);
 * }
 */
export function validateEntry(data) {
  return entrySchema.validate(data);
}
