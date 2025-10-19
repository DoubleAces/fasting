/**
 * FAQ Validation Schemas
 * 
 * Joi validation schemas for FAQ-related queries and filters.
 * Used for search functionality on the FAQ page.
 * 
 * Schemas:
 * - faqSearchSchema: Validate FAQ search queries with optional category filter
 * 
 * Features:
 * - Optional search query (string, trimmed)
 * - Optional category filter (enum validation)
 * - Safe string sanitization
 * - Custom error messages
 */

import Joi from 'joi';

// ============================================================================
// FAQ CATEGORIES
// ============================================================================

/**
 * Valid FAQ categories
 * Must match the categories defined in FAQItem model
 */
const FAQ_CATEGORIES = [
  'Getting Started',
  'Fasting',
  'Account',
  'Technical',
  'General',
];

// ============================================================================
// FAQ SEARCH SCHEMA
// ============================================================================

/**
 * FAQ search query validation schema
 * 
 * Fields:
 * - query: Optional string (search term)
 * - category: Optional string (must be one of predefined categories)
 * 
 * Both fields are optional to support:
 * - No filters (return all FAQs)
 * - Search only (query without category)
 * - Category only (filter by category)
 * - Search + Category (combined filtering)
 * 
 * @example
 * // Search all FAQs
 * const result1 = faqSearchSchema.validate({});
 * 
 * // Search by query
 * const result2 = faqSearchSchema.validate({
 *   query: 'intermittent fasting'
 * });
 * 
 * // Filter by category
 * const result3 = faqSearchSchema.validate({
 *   category: 'Fasting'
 * });
 * 
 * // Search with category filter
 * const result4 = faqSearchSchema.validate({
 *   query: '16:8',
 *   category: 'Fasting'
 * });
 */
export const faqSearchSchema = Joi.object({
  query: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Search query cannot exceed 200 characters',
    }),

  category: Joi.string()
    .valid(...FAQ_CATEGORIES)
    .optional()
    .messages({
      'any.only': `Category must be one of: ${FAQ_CATEGORIES.join(', ')}`,
    }),
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  faqSearchSchema,
  FAQ_CATEGORIES,
};
