/**
 * Settings Validation Schema
 * 
 * Joi schema for validating settings form data.
 * Ensures valid user preferences before database operations.
 * 
 * @module settingsSchema
 */

import Joi from 'joi';

/**
 * Settings validation schema
 * 
 * Required fields:
 * - measurementSystem: Enum ('metric' or 'imperial')
 * - timeFormat: Enum ('12h' or '24h')
 * 
 * Optional fields:
 * - userId: String (user identifier, defaults to 'default')
 */
export const settingsSchema = Joi.object({
  /**
   * User identifier (optional)
   * Defaults to 'default' for single-user application
   * Cannot be empty string
   */
  userId: Joi.string()
    .min(1)
    .optional()
    .messages({
      'string.base': 'User ID must be a string',
      'string.min': 'User ID cannot be empty',
      'string.empty': 'User ID cannot be empty',
    }),

  /**
   * Measurement system preference (required)
   * Enum: 'metric' (kg) or 'imperial' (lbs)
   */
  measurementSystem: Joi.string()
    .valid('metric', 'imperial')
    .required()
    .messages({
      'string.base': 'Measurement system must be a string',
      'any.only': 'Measurement system must be one of: metric, imperial',
      'any.required': 'Measurement system is required',
    }),

  /**
   * Time format preference (required)
   * Enum: '12h' (AM/PM) or '24h' (military time)
   */
  timeFormat: Joi.string()
    .valid('12h', '24h')
    .required()
    .messages({
      'string.base': 'Time format must be a string',
      'any.only': 'Time format must be one of: 12h, 24h',
      'any.required': 'Time format is required',
    }),
}).options({
  stripUnknown: true, // Remove unknown fields
  abortEarly: false,  // Return all errors, not just the first one
});

/**
 * Validate settings data
 * 
 * @param {Object} data - Settings data to validate
 * @returns {Object} Validation result with error and value
 * @returns {Object.error} Joi validation error (if validation fails)
 * @returns {Object.value} Validated and sanitized data
 * 
 * @example
 * const { error, value } = validateSettings({
 *   measurementSystem: 'metric',
 *   timeFormat: '24h'
 * });
 * 
 * if (error) {
 *   console.error('Validation errors:', error.details);
 * } else {
 *   // Use validated data
 *   await Settings.create(value);
 * }
 */
export function validateSettings(data) {
  return settingsSchema.validate(data);
}
