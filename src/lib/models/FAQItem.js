/**
 * FAQItem Model
 * 
 * Stores frequently asked questions with answers, categories, and search metadata.
 * Used for the public FAQ page with search and filtering functionality.
 * 
 * Schema Fields:
 * - question: Question text (max 200 characters)
 * - answer: Answer text with HTML support (max 2000 characters)
 * - category: Question category for organization
 * - order: Display order within category
 * - keywords: Searchable keywords array
 * - isPublished: Visibility flag
 * - createdAt, updatedAt: Automatic timestamps
 * 
 * Features:
 * - Category-based organization
 * - Full-text search across question, answer, keywords
 * - Custom ordering within categories
 * - Published/unpublished toggle
 * - Static methods: searchFAQs, getByCategory
 * - Text indexes for search performance
 * 
 * Categories:
 * - Getting Started
 * - Fasting
 * - Account
 * - Technical
 * - General
 */

import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema(
  {
    /**
     * Question text
     * - Clear, concise question
     * - Maximum 200 characters
     * - Trimmed of whitespace
     */
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [200, 'Question cannot exceed 200 characters'],
    },

    /**
     * Answer text
     * - Can include HTML formatting for rich content
     * - Maximum 2000 characters
     * - Trimmed of whitespace
     */
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [2000, 'Answer cannot exceed 2000 characters'],
    },

    /**
     * Category for organization
     * - Groups related questions together
     * - Indexed for filtering
     */
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Getting Started',
          'Fasting',
          'Account',
          'Technical',
          'General',
        ],
        message: 'Category must be one of: Getting Started, Fasting, Account, Technical, General',
      },
      index: true,
    },

    /**
     * Display order within category
     * - Lower numbers appear first
     * - Allows manual ordering of FAQ items
     * - Default: 0 (displayed first)
     */
    order: {
      type: Number,
      default: 0,
      index: true,
    },

    /**
     * Searchable keywords
     * - Array of lowercase keywords
     * - Used for search filtering
     * - Trimmed and lowercase for consistency
     */
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    /**
     * Published status
     * - true: Visible on FAQ page
     * - false: Hidden (draft or archived)
     * - Indexed for filtering published items
     */
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * Created at timestamp (automatic)
     * - Set on document creation
     * - Immutable after creation
     */
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    /**
     * Updated at timestamp (automatic)
     * - Updated on any modification
     */
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatic timestamps
    timestamps: true,

    // Collection name
    collection: 'faqItems',
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// Compound index for filtering and sorting
faqItemSchema.index({ category: 1, order: 1 });

// Index for filtering published items
faqItemSchema.index({ isPublished: 1 });

// Text index for search functionality
// Searches across question, answer, and keywords fields
faqItemSchema.index(
  {
    question: 'text',
    answer: 'text',
    keywords: 'text',
  },
  {
    weights: {
      question: 3, // Higher weight for question matches
      keywords: 2, // Medium weight for keyword matches
      answer: 1, // Lower weight for answer matches
    },
    name: 'faq_text_index',
  }
);

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Search FAQ items
 * 
 * Searches published FAQs by query string across question, answer, and keywords.
 * Returns all published FAQs if no query provided.
 * Results sorted by category and order.
 * 
 * @param {string} query - Search query (optional)
 * @returns {Promise<FAQItem[]>} Array of matching FAQ items
 * 
 * @example
 * // Get all published FAQs
 * const allFAQs = await FAQItem.searchFAQs();
 * 
 * // Search for specific topic
 * const fastingFAQs = await FAQItem.searchFAQs('intermittent fasting');
 * 
 * // Search is case-insensitive and matches partial words
 * const trackingFAQs = await FAQItem.searchFAQs('track');
 */
faqItemSchema.statics.searchFAQs = function (query) {
  // If no query, return all published FAQs
  if (!query || query.trim() === '') {
    return this.find({ isPublished: true }).sort({ category: 1, order: 1 });
  }

  // Use regex for flexible matching (case-insensitive)
  const searchRegex = new RegExp(query, 'i');

  return this.find({
    isPublished: true,
    $or: [
      { question: searchRegex },
      { answer: searchRegex },
      { keywords: searchRegex },
    ],
  }).sort({ category: 1, order: 1 });
};

/**
 * Get FAQ items by category
 * 
 * Retrieves all published FAQs in a specific category,
 * sorted by display order.
 * 
 * @param {string} category - Category name
 * @returns {Promise<FAQItem[]>} Array of FAQ items in category
 * 
 * @example
 * const gettingStartedFAQs = await FAQItem.getByCategory('Getting Started');
 * const fastingFAQs = await FAQItem.getByCategory('Fasting');
 */
faqItemSchema.statics.getByCategory = function (category) {
  return this.find({
    category,
    isPublished: true,
  }).sort({ order: 1 });
};

/**
 * Get all FAQ items grouped by category
 * 
 * Retrieves all published FAQs organized by category with simplified structure
 * for frontend display. Each category contains an array of question/answer pairs.
 * 
 * @returns {Promise<Array>} Array of category objects with questions
 * 
 * @example
 * const groupedFAQs = await FAQItem.getAllGrouped();
 * // Returns: [
 * //   { category: 'Getting Started', questions: [{ question: '...', answer: '...' }, ...] },
 * //   { category: 'Account & Security', questions: [...] }
 * // ]
 */
faqItemSchema.statics.getAllGrouped = async function () {
  const faqs = await this.find({ isPublished: true }).sort({ category: 1, order: 1 });
  
  // Group FAQs by category
  const grouped = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push({
      question: faq.question,
      answer: faq.answer,
    });
    return acc;
  }, {});

  // Convert to array format
  return Object.entries(grouped).map(([category, questions]) => ({
    category,
    questions,
  }));
};

// ============================================================================
// PRE-SAVE HOOKS
// ============================================================================

/**
 * Pre-save hook: Update timestamp
 */
faqItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ============================================================================
// MODEL EXPORT
// ============================================================================

const FAQItem =
  mongoose.models.FAQItem || mongoose.model('FAQItem', faqItemSchema, 'faqitems');

export default FAQItem;
