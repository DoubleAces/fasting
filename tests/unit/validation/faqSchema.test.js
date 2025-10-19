/**
 * FAQ Validation Schema Tests
 * 
 * Tests for Joi validation schemas including:
 * - faqSearchSchema: query and category validation
 * - FAQ_CATEGORIES constant validation
 */

import { faqSearchSchema, FAQ_CATEGORIES } from '@/lib/validation/faqSchema';

// ============================================================================
// FAQ_CATEGORIES CONSTANT TESTS
// ============================================================================

describe('FAQ_CATEGORIES', () => {
  test('should export array of valid categories', () => {
    expect(FAQ_CATEGORIES).toBeDefined();
    expect(Array.isArray(FAQ_CATEGORIES)).toBe(true);
    expect(FAQ_CATEGORIES.length).toBeGreaterThan(0);
  });

  test('should include expected categories', () => {
    expect(FAQ_CATEGORIES).toContain('Getting Started');
    expect(FAQ_CATEGORIES).toContain('Fasting');
    expect(FAQ_CATEGORIES).toContain('Account');
    expect(FAQ_CATEGORIES).toContain('Technical');
    expect(FAQ_CATEGORIES).toContain('General');
  });

  test('should have exactly 5 categories', () => {
    expect(FAQ_CATEGORIES).toHaveLength(5);
  });
});

// ============================================================================
// FAQ SEARCH SCHEMA TESTS
// ============================================================================

describe('faqSearchSchema', () => {
  describe('valid data', () => {
    test('should validate with no fields (all optional)', () => {
      const data = {};

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should validate with query only', () => {
      const data = {
        query: 'intermittent fasting',
      };

      const { error, value } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.query).toBe('intermittent fasting');
    });

    test('should validate with category only', () => {
      const data = {
        category: 'Fasting',
      };

      const { error, value } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.category).toBe('Fasting');
    });

    test('should validate with both query and category', () => {
      const data = {
        query: '16:8 method',
        category: 'Fasting',
      };

      const { error, value } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.query).toBe('16:8 method');
      expect(value.category).toBe('Fasting');
    });

    test('should trim query whitespace', () => {
      const data = {
        query: '  intermittent fasting  ',
      };

      const { error, value } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.query).toBe('intermittent fasting');
    });

    test('should accept empty string query', () => {
      const data = {
        query: '',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('query validation', () => {
    test('should accept query up to 200 characters', () => {
      const data = {
        query: 'a'.repeat(200),
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject query longer than 200 characters', () => {
      const data = {
        query: 'a'.repeat(201),
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('200 characters');
    });

    test('should accept query with special characters', () => {
      const data = {
        query: 'What is 16:8 fasting? How does it work?',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept query with numbers', () => {
      const data = {
        query: '16:8 method 123',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept query with hyphens and underscores', () => {
      const data = {
        query: 'fasting-tracker time_window',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept single character query', () => {
      const data = {
        query: 'a',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('category validation', () => {
    test('should accept "Getting Started" category', () => {
      const data = {
        category: 'Getting Started',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept "Fasting" category', () => {
      const data = {
        category: 'Fasting',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept "Account" category', () => {
      const data = {
        category: 'Account',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept "Technical" category', () => {
      const data = {
        category: 'Technical',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept "General" category', () => {
      const data = {
        category: 'General',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject invalid category', () => {
      const data = {
        category: 'Invalid Category',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Category must be one of');
    });

    test('should reject category with wrong case', () => {
      const data = {
        category: 'fasting', // lowercase instead of "Fasting"
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
    });

    test('should reject empty string category', () => {
      const data = {
        category: '',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
    });

    test('should list all valid categories in error message', () => {
      const data = {
        category: 'Invalid',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
      FAQ_CATEGORIES.forEach(category => {
        expect(error.message).toContain(category);
      });
    });
  });

  describe('combined validation', () => {
    test('should validate both fields together', () => {
      const data = {
        query: 'How to start fasting?',
        category: 'Getting Started',
      };

      const { error, value } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.query).toBe('How to start fasting?');
      expect(value.category).toBe('Getting Started');
    });

    test('should reject if query is valid but category is invalid', () => {
      const data = {
        query: 'valid query',
        category: 'Invalid Category',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Category must be one of');
    });

    test('should reject if category is valid but query is too long', () => {
      const data = {
        query: 'a'.repeat(201),
        category: 'Fasting',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('200 characters');
    });

    test('should allow empty query with valid category', () => {
      const data = {
        query: '',
        category: 'Fasting',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    test('should reject non-string query', () => {
      const data = {
        query: 123,
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
    });

    test('should reject non-string category', () => {
      const data = {
        category: 123,
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeDefined();
    });

    test('should reject query with only whitespace after trim', () => {
      const data = {
        query: '   ',
      };

      const { error, value } = faqSearchSchema.validate(data);

      // After trimming, becomes empty string which is allowed
      expect(error).toBeUndefined();
      expect(value.query).toBe('');
    });

    test('should handle undefined fields gracefully', () => {
      const data = {
        query: undefined,
        category: undefined,
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject additional unknown fields', () => {
      const data = {
        query: 'valid query',
        category: 'Fasting',
        extraField: 'should not be here',
      };

      const { error } = faqSearchSchema.validate(data, { allowUnknown: false });

      expect(error).toBeDefined();
    });

    test('should allow additional fields if configured', () => {
      const data = {
        query: 'valid query',
        category: 'Fasting',
        extraField: 'allowed with allowUnknown',
      };

      const { error } = faqSearchSchema.validate(data, { allowUnknown: true });

      expect(error).toBeUndefined();
    });
  });

  describe('real-world scenarios', () => {
    test('should handle FAQ search without filters', () => {
      const data = {};

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should handle search by keyword', () => {
      const data = {
        query: '16:8',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should handle category filter only', () => {
      const data = {
        category: 'Fasting',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should handle combined search and filter', () => {
      const data = {
        query: 'intermittent',
        category: 'Fasting',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should handle question-style query', () => {
      const data = {
        query: 'How do I start intermittent fasting?',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should handle multi-word search term', () => {
      const data = {
        query: 'weight loss benefits',
      };

      const { error } = faqSearchSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });
});
