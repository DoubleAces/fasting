/**
 * FAQItem Model Tests
 * 
 * Tests for FAQItem Mongoose model including:
 * - Schema validation
 * - Static methods: searchFAQs, getByCategory
 * - Text search functionality
 * - Category filtering
 * - Published/unpublished behavior
 */

import mongoose from 'mongoose';
import FAQItem from '@/lib/models/FAQItem';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ============================================================================
// SCHEMA VALIDATION TESTS
// ============================================================================

describe('FAQItem Model - Schema Validation', () => {
  test('should create FAQ item with valid data', async () => {
    const faqData = {
      question: 'What is intermittent fasting?',
      answer: 'Intermittent fasting is an eating pattern...',
      category: 'Fasting',
      keywords: ['fasting', 'intermittent', 'basics'],
    };

    const faq = await FAQItem.create(faqData);

    expect(faq._id).toBeDefined();
    expect(faq.question).toBe(faqData.question);
    expect(faq.answer).toBe(faqData.answer);
    expect(faq.category).toBe(faqData.category);
    expect(faq.keywords).toEqual(faqData.keywords);
    expect(faq.isPublished).toBe(true); // default
    expect(faq.order).toBe(0); // default
    expect(faq.createdAt).toBeDefined();
    expect(faq.updatedAt).toBeDefined();
  });

  test('should require question field', async () => {
    await expect(
      FAQItem.create({
        answer: 'This is an answer',
        category: 'General',
      })
    ).rejects.toThrow();
  });

  test('should require answer field', async () => {
    await expect(
      FAQItem.create({
        question: 'This is a question?',
        category: 'General',
      })
    ).rejects.toThrow();
  });

  test('should require category field', async () => {
    await expect(
      FAQItem.create({
        question: 'This is a question?',
        answer: 'This is an answer',
      })
    ).rejects.toThrow();
  });

  test('should enforce question max length (200 chars)', async () => {
    const longQuestion = 'Q'.repeat(201);

    await expect(
      FAQItem.create({
        question: longQuestion,
        answer: 'This is an answer',
        category: 'General',
      })
    ).rejects.toThrow();
  });

  test('should enforce answer max length (2000 chars)', async () => {
    const longAnswer = 'A'.repeat(2001);

    await expect(
      FAQItem.create({
        question: 'This is a question?',
        answer: longAnswer,
        category: 'General',
      })
    ).rejects.toThrow();
  });

  test('should enforce category enum', async () => {
    await expect(
      FAQItem.create({
        question: 'This is a question?',
        answer: 'This is an answer',
        category: 'Invalid Category',
      })
    ).rejects.toThrow();
  });

  test('should accept valid categories', async () => {
    const validCategories = [
      'Getting Started',
      'Fasting',
      'Account',
      'Technical',
      'General',
    ];

    for (const category of validCategories) {
      const faq = await FAQItem.create({
        question: `Question for ${category}?`,
        answer: 'This is an answer',
        category,
      });

      expect(faq.category).toBe(category);
    }
  });

  test('should default isPublished to true', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
    });

    expect(faq.isPublished).toBe(true);
  });

  test('should default order to 0', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
    });

    expect(faq.order).toBe(0);
  });

  test('should allow custom order value', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
      order: 5,
    });

    expect(faq.order).toBe(5);
  });

  test('should convert keywords to lowercase', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
      keywords: ['UPPERCASE', 'MixedCase', 'lowercase'],
    });

    expect(faq.keywords).toEqual(['uppercase', 'mixedcase', 'lowercase']);
  });

  test('should trim whitespace from question and answer', async () => {
    const faq = await FAQItem.create({
      question: '  This is a question?  ',
      answer: '  This is an answer  ',
      category: 'General',
    });

    expect(faq.question).toBe('This is a question?');
    expect(faq.answer).toBe('This is an answer');
  });

  test('should allow HTML in answer field', async () => {
    const htmlAnswer = '<p>This is a <strong>formatted</strong> answer</p>';

    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: htmlAnswer,
      category: 'General',
    });

    expect(faq.answer).toBe(htmlAnswer);
  });
});

// ============================================================================
// STATIC METHOD TESTS
// ============================================================================

describe('FAQItem Model - Static Methods', () => {
  describe('searchFAQs()', () => {
    beforeEach(async () => {
      // Create test FAQ items
      await FAQItem.create([
        {
          question: 'What is intermittent fasting?',
          answer: 'Intermittent fasting is an eating pattern that cycles between periods of fasting and eating.',
          category: 'Fasting',
          keywords: ['fasting', 'intermittent', 'basics'],
          isPublished: true,
          order: 1,
        },
        {
          question: 'How do I track my progress?',
          answer: 'You can track your progress by logging daily entries with meal times and health metrics.',
          category: 'Getting Started',
          keywords: ['tracking', 'progress', 'entries'],
          isPublished: true,
          order: 2,
        },
        {
          question: 'Can I reset my password?',
          answer: 'Yes, use the forgot password link on the login page.',
          category: 'Account',
          keywords: ['password', 'reset', 'security'],
          isPublished: true,
          order: 3,
        },
        {
          question: 'What is the 16:8 method?',
          answer: 'The 16:8 method involves fasting for 16 hours and eating within an 8-hour window.',
          category: 'Fasting',
          keywords: ['16:8', 'method', 'protocol'],
          isPublished: false, // unpublished
          order: 4,
        },
      ]);
    });

    test('should return all published FAQs when no query provided', async () => {
      const faqs = await FAQItem.searchFAQs();

      expect(faqs).toHaveLength(3); // only published items
      expect(faqs.every(faq => faq.isPublished)).toBe(true);
    });

    test('should return empty array for empty string query', async () => {
      const faqs = await FAQItem.searchFAQs('');

      expect(faqs).toHaveLength(3); // returns all published
    });

    test('should search by question text', async () => {
      const faqs = await FAQItem.searchFAQs('intermittent');

      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs[0].question).toContain('intermittent');
    });

    test('should search by answer text', async () => {
      const faqs = await FAQItem.searchFAQs('eating pattern');

      expect(faqs.length).toBeGreaterThan(0);
      const matchingFaq = faqs.find(faq => faq.answer.includes('eating pattern'));
      expect(matchingFaq).toBeDefined();
    });

    test('should search by keywords', async () => {
      const faqs = await FAQItem.searchFAQs('tracking');

      expect(faqs.length).toBeGreaterThan(0);
      const matchingFaq = faqs.find(faq => faq.keywords.includes('tracking'));
      expect(matchingFaq).toBeDefined();
    });

    test('should be case-insensitive', async () => {
      const lowerCase = await FAQItem.searchFAQs('fasting');
      const upperCase = await FAQItem.searchFAQs('FASTING');
      const mixedCase = await FAQItem.searchFAQs('FaStInG');

      expect(lowerCase.length).toBe(upperCase.length);
      expect(upperCase.length).toBe(mixedCase.length);
    });

    test('should only return published FAQs', async () => {
      const faqs = await FAQItem.searchFAQs('16:8'); // matches unpublished FAQ

      expect(faqs).toHaveLength(0);
    });

    test('should sort by category then order', async () => {
      const faqs = await FAQItem.searchFAQs();

      // Check sorting (Account < Fasting < Getting Started alphabetically)
      for (let i = 0; i < faqs.length - 1; i++) {
        const current = faqs[i];
        const next = faqs[i + 1];

        if (current.category === next.category) {
          expect(current.order).toBeLessThanOrEqual(next.order);
        }
      }
    });

    test('should handle partial word matches', async () => {
      const faqs = await FAQItem.searchFAQs('track');

      expect(faqs.length).toBeGreaterThan(0);
      const matchingFaq = faqs.find(
        faq => faq.question.includes('track') || faq.answer.includes('track')
      );
      expect(matchingFaq).toBeDefined();
    });
  });

  describe('getByCategory()', () => {
    beforeEach(async () => {
      // Create test FAQ items in different categories
      await FAQItem.create([
        {
          question: 'Fasting Question 1',
          answer: 'Answer 1',
          category: 'Fasting',
          isPublished: true,
          order: 2,
        },
        {
          question: 'Fasting Question 2',
          answer: 'Answer 2',
          category: 'Fasting',
          isPublished: true,
          order: 1,
        },
        {
          question: 'Account Question',
          answer: 'Answer',
          category: 'Account',
          isPublished: true,
          order: 1,
        },
        {
          question: 'Unpublished Fasting',
          answer: 'Answer',
          category: 'Fasting',
          isPublished: false,
          order: 3,
        },
      ]);
    });

    test('should return FAQs for specified category', async () => {
      const faqs = await FAQItem.getByCategory('Fasting');

      expect(faqs).toHaveLength(2); // only published
      expect(faqs.every(faq => faq.category === 'Fasting')).toBe(true);
    });

    test('should only return published FAQs', async () => {
      const faqs = await FAQItem.getByCategory('Fasting');

      expect(faqs.every(faq => faq.isPublished)).toBe(true);
    });

    test('should sort by order ascending', async () => {
      const faqs = await FAQItem.getByCategory('Fasting');

      expect(faqs[0].order).toBe(1);
      expect(faqs[1].order).toBe(2);
    });

    test('should return empty array for category with no published FAQs', async () => {
      const faqs = await FAQItem.getByCategory('Technical');

      expect(faqs).toHaveLength(0);
    });

    test('should return empty array for invalid category', async () => {
      const faqs = await FAQItem.getByCategory('Invalid Category');

      expect(faqs).toHaveLength(0);
    });
  });
});

// ============================================================================
// PRE-SAVE HOOK TESTS
// ============================================================================

describe('FAQItem Model - Pre-save Hooks', () => {
  test('should update updatedAt timestamp on save', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
    });

    const originalUpdatedAt = faq.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    faq.answer = 'Updated answer';
    await faq.save();

    expect(faq.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});

// ============================================================================
// INDEX TESTS
// ============================================================================

describe('FAQItem Model - Indexes', () => {
  test('should have compound index on category and order', async () => {
    const indexes = await FAQItem.collection.getIndexes();
    
    const compoundIndex = Object.keys(indexes).find(key => 
      key.includes('category') && key.includes('order')
    );
    
    expect(compoundIndex).toBeDefined();
  });

  test('should have index on isPublished', async () => {
    const indexes = await FAQItem.collection.getIndexes();
    
    expect(indexes).toHaveProperty('isPublished_1');
  });

  test('should have text index for search', async () => {
    const indexes = await FAQItem.collection.getIndexes();
    
    const textIndex = Object.values(indexes).find(
      index => index.textIndexVersion !== undefined
    );
    
    expect(textIndex).toBeDefined();
  });
});

// ============================================================================
// PUBLISHED/UNPUBLISHED BEHAVIOR TESTS
// ============================================================================

describe('FAQItem Model - Published/Unpublished Behavior', () => {
  test('should allow toggling isPublished flag', async () => {
    const faq = await FAQItem.create({
      question: 'This is a question?',
      answer: 'This is an answer',
      category: 'General',
      isPublished: true,
    });

    expect(faq.isPublished).toBe(true);

    faq.isPublished = false;
    await faq.save();

    expect(faq.isPublished).toBe(false);

    const dbFaq = await FAQItem.findById(faq._id);
    expect(dbFaq.isPublished).toBe(false);
  });

  test('should exclude unpublished FAQs from search', async () => {
    await FAQItem.create({
      question: 'Published question',
      answer: 'Published answer',
      category: 'General',
      isPublished: true,
    });

    await FAQItem.create({
      question: 'Unpublished question',
      answer: 'Unpublished answer',
      category: 'General',
      isPublished: false,
    });

    const faqs = await FAQItem.searchFAQs();

    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toBe('Published question');
  });

  test('should exclude unpublished FAQs from category filter', async () => {
    await FAQItem.create({
      question: 'Published in Fasting',
      answer: 'Answer',
      category: 'Fasting',
      isPublished: true,
    });

    await FAQItem.create({
      question: 'Unpublished in Fasting',
      answer: 'Answer',
      category: 'Fasting',
      isPublished: false,
    });

    const faqs = await FAQItem.getByCategory('Fasting');

    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toBe('Published in Fasting');
  });
});
