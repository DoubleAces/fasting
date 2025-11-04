/**
 * Achievement Model Unit Tests
 * Tests for Achievement schema validation, constraints, and defaults
 * 
 * TDD Approach: These tests are written FIRST before implementing the Achievement model
 * They should FAIL initially (red phase), then PASS after implementation (green phase)
 */

import mongoose from 'mongoose';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import { testUsers } from '../../../tests/fixtures/users.js';

// Import Achievement model (will be created)
let Achievement;
let User;

describe('Achievement Model - Unit Tests', () => {
  // Setup: Connect to test database before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Import models after database connection
    Achievement = (await import('@/lib/models/Achievement')).default;
    User = (await import('@/lib/models/User')).default;
  });

  // Cleanup: Clean database before each test
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  // Teardown: Disconnect from database after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  /**
   * T008: Achievement schema validation with valid data
   */
  describe('T008 - Schema validation with valid data', () => {
    it('should create an achievement with all required fields', async () => {
      // Create admin user for createdBy reference
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t008@test.com',
      });

      const validAchievement = {
        achievementId: 'first-fast',
        translations: {
          en: {
            name: 'First Fast',
            description: 'Complete your first fasting entry',
            shortDescription: 'Complete first fast',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'entry-count',
          params: { count: 1 },
        },
        createdBy: admin._id,
      };

      const achievement = await Achievement.create(validAchievement);

      expect(achievement).toBeDefined();
      expect(achievement.achievementId).toBe('first-fast');
      expect(achievement.translations.en.name).toBe('First Fast');
      expect(achievement.category).toBe('getting-started');
      expect(achievement.points).toBe(10);
      expect(achievement.rarity).toBe('common');
      expect(achievement.order).toBe(1);
      expect(achievement.criteria.type).toBe('entry-count');
      expect(achievement.criteria.params.count).toBe(1);
      expect(achievement.createdBy.toString()).toBe(admin._id.toString());
    });

    it('should create achievement with optional fields', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t008-optional@test.com',
      });

      const achievementWithOptionals = {
        achievementId: 'sweet-sixteen',
        translations: {
          en: {
            name: 'Sweet Sixteen',
            description: 'Complete a 16-hour fast',
            shortDescription: '16-hour fast',
          },
          es: {
            name: 'Dulce Dieciséis',
            description: 'Completa un ayuno de 16 horas',
            shortDescription: 'Ayuno de 16 horas',
          },
        },
        badgeImage: {
          locked: 'https://example.com/locked.png',
          unlocked: 'https://example.com/unlocked.png',
        },
        icon: '🎯',
        iconColor: '#4F46E5',
        category: 'duration',
        points: 25,
        rarity: 'rare',
        order: 10,
        criteria: {
          type: 'duration',
          params: { duration: 960 }, // 16 hours in minutes
        },
        isActive: true,
        isSecret: true,
        releaseDate: new Date('2025-01-01'),
        createdBy: admin._id,
      };

      const achievement = await Achievement.create(achievementWithOptionals);

      expect(achievement.badgeImage.locked).toBe('https://example.com/locked.png');
      expect(achievement.badgeImage.unlocked).toBe('https://example.com/unlocked.png');
      expect(achievement.icon).toBe('🎯');
      expect(achievement.iconColor).toBe('#4F46E5');
      expect(achievement.translations.es.name).toBe('Dulce Dieciséis');
      expect(achievement.isSecret).toBe(true);
      expect(achievement.releaseDate).toEqual(new Date('2025-01-01'));
    });
  });

  /**
   * T009: Achievement achievementId uniqueness constraint
   */
  describe('T009 - achievementId uniqueness constraint', () => {
    it('should enforce unique achievementId constraint', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t009@test.com',
      });

      const achievement1 = {
        achievementId: 'duplicate-test',
        translations: {
          en: {
            name: 'Duplicate Test',
            description: 'Testing duplicate achievementId',
            shortDescription: 'Duplicate test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      // Create first achievement
      await Achievement.create(achievement1);

      // Attempt to create duplicate achievementId
      const achievement2 = { ...achievement1 };
      
      await expect(Achievement.create(achievement2)).rejects.toThrow();
    });
  });

  /**
   * T010: Achievement category enum validation
   */
  describe('T010 - Category enum validation', () => {
    it('should accept valid category values', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t010@test.com',
      });

      const validCategories = [
        'getting-started',
        'duration',
        'streak',
        'goal',
        'weight',
        'consistency',
        'special',
        'knowledge',
      ];

      for (const category of validCategories) {
        const achievement = await Achievement.create({
          achievementId: `category-test-${category}`,
          translations: {
            en: {
              name: `Category Test ${category}`,
              description: `Testing ${category} category`,
              shortDescription: `Test ${category}`,
            },
          },
          category,
          points: 10,
          rarity: 'common',
          order: 1,
          criteria: { type: 'manual', params: {} },
          createdBy: admin._id,
        });

        expect(achievement.category).toBe(category);
      }
    });

    it('should reject invalid category value', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t010-invalid@test.com',
      });

      const invalidAchievement = {
        achievementId: 'invalid-category',
        translations: {
          en: {
            name: 'Invalid Category',
            description: 'Testing invalid category',
            shortDescription: 'Invalid test',
          },
        },
        category: 'invalid-category',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(invalidAchievement)).rejects.toThrow();
    });
  });

  /**
   * T011: Achievement rarity enum validation
   */
  describe('T011 - Rarity enum validation', () => {
    it('should accept valid rarity values', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t011@test.com',
      });

      const validRarities = ['common', 'rare', 'epic', 'legendary'];

      for (const rarity of validRarities) {
        const achievement = await Achievement.create({
          achievementId: `rarity-test-${rarity}`,
          translations: {
            en: {
              name: `Rarity Test ${rarity}`,
              description: `Testing ${rarity} rarity`,
              shortDescription: `Test ${rarity}`,
            },
          },
          category: 'special',
          points: 10,
          rarity,
          order: 1,
          criteria: { type: 'manual', params: {} },
          createdBy: admin._id,
        });

        expect(achievement.rarity).toBe(rarity);
      }
    });

    it('should reject invalid rarity value', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t011-invalid@test.com',
      });

      const invalidAchievement = {
        achievementId: 'invalid-rarity',
        translations: {
          en: {
            name: 'Invalid Rarity',
            description: 'Testing invalid rarity',
            shortDescription: 'Invalid test',
          },
        },
        category: 'special',
        points: 10,
        rarity: 'mythical', // Invalid
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(invalidAchievement)).rejects.toThrow();
    });
  });

  /**
   * T012: Achievement required fields validation
   */
  describe('T012 - Required fields validation', () => {
    it('should require achievementId', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-achievementid@test.com',
      });

      const missingAchievementId = {
        // achievementId missing
        translations: {
          en: {
            name: 'Missing ID',
            description: 'Testing missing achievementId',
            shortDescription: 'Missing ID',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingAchievementId)).rejects.toThrow();
    });

    it('should require translations', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-translations@test.com',
      });

      const missingTranslations = {
        achievementId: 'missing-translations',
        // translations missing
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingTranslations)).rejects.toThrow();
    });

    it('should require category', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-category@test.com',
      });

      const missingCategory = {
        achievementId: 'missing-category',
        translations: {
          en: {
            name: 'Missing Category',
            description: 'Testing missing category',
            shortDescription: 'Missing category',
          },
        },
        // category missing
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingCategory)).rejects.toThrow();
    });

    it('should require points', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-points@test.com',
      });

      const missingPoints = {
        achievementId: 'missing-points',
        translations: {
          en: {
            name: 'Missing Points',
            description: 'Testing missing points',
            shortDescription: 'Missing points',
          },
        },
        category: 'getting-started',
        // points missing
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingPoints)).rejects.toThrow();
    });

    it('should require rarity', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-rarity@test.com',
      });

      const missingRarity = {
        achievementId: 'missing-rarity',
        translations: {
          en: {
            name: 'Missing Rarity',
            description: 'Testing missing rarity',
            shortDescription: 'Missing rarity',
          },
        },
        category: 'getting-started',
        points: 10,
        // rarity missing
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingRarity)).rejects.toThrow();
    });

    it('should require order', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-order@test.com',
      });

      const missingOrder = {
        achievementId: 'missing-order',
        translations: {
          en: {
            name: 'Missing Order',
            description: 'Testing missing order',
            shortDescription: 'Missing order',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        // order missing
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingOrder)).rejects.toThrow();
    });

    it('should require criteria', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t012-criteria@test.com',
      });

      const missingCriteria = {
        achievementId: 'missing-criteria',
        translations: {
          en: {
            name: 'Missing Criteria',
            description: 'Testing missing criteria',
            shortDescription: 'Missing criteria',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        // criteria missing
        createdBy: admin._id,
      };

      await expect(Achievement.create(missingCriteria)).rejects.toThrow();
    });

    it('should require createdBy', async () => {
      const missingCreatedBy = {
        achievementId: 'missing-createdby',
        translations: {
          en: {
            name: 'Missing CreatedBy',
            description: 'Testing missing createdBy',
            shortDescription: 'Missing createdBy',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        // createdBy missing
      };

      await expect(Achievement.create(missingCreatedBy)).rejects.toThrow();
    });
  });

  /**
   * T013: Achievement translations nested object structure
   */
  describe('T013 - Translations nested object structure', () => {
    it('should store nested translations object correctly', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t013@test.com',
      });

      const multilingualAchievement = {
        achievementId: 'multilingual-test',
        translations: {
          en: {
            name: 'Multilingual Test',
            description: 'Testing multilingual translations',
            shortDescription: 'Multilingual',
          },
          es: {
            name: 'Prueba Multilingüe',
            description: 'Probando traducciones multilingües',
            shortDescription: 'Multilingüe',
          },
          fr: {
            name: 'Test Multilingue',
            description: 'Test de traductions multilingues',
            shortDescription: 'Multilingue',
          },
          de: {
            name: 'Mehrsprachiger Test',
            description: 'Testen mehrsprachiger Übersetzungen',
            shortDescription: 'Mehrsprachig',
          },
          pt: {
            name: 'Teste Multilíngue',
            description: 'Testando traduções multilíngues',
            shortDescription: 'Multilíngue',
          },
        },
        category: 'knowledge',
        points: 50,
        rarity: 'epic',
        order: 100,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      const achievement = await Achievement.create(multilingualAchievement);

      // Verify all translations are stored
      expect(achievement.translations.en.name).toBe('Multilingual Test');
      expect(achievement.translations.es.name).toBe('Prueba Multilingüe');
      expect(achievement.translations.fr.name).toBe('Test Multilingue');
      expect(achievement.translations.de.name).toBe('Mehrsprachiger Test');
      expect(achievement.translations.pt.name).toBe('Teste Multilíngue');

      // Verify nested structure
      expect(achievement.translations.en.description).toBe('Testing multilingual translations');
      expect(achievement.translations.en.shortDescription).toBe('Multilingual');
    });

    it('should allow English-only translations', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t013-english@test.com',
      });

      const englishOnlyAchievement = {
        achievementId: 'english-only',
        translations: {
          en: {
            name: 'English Only',
            description: 'Only English translation provided',
            shortDescription: 'English only',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      const achievement = await Achievement.create(englishOnlyAchievement);

      expect(achievement.translations.en).toBeDefined();
      expect(achievement.translations.es).toBeUndefined();
    });
  });

  /**
   * T014: Achievement criteria flexible object (Schema.Types.Mixed)
   */
  describe('T014 - Criteria flexible object validation', () => {
    it('should store various criteria types with different params', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t014@test.com',
      });

      const criteriaTypes = [
        {
          achievementId: 'manual-criteria',
          criteria: { type: 'manual', params: {} },
        },
        {
          achievementId: 'entry-count-criteria',
          criteria: { type: 'entry-count', params: { count: 7 } },
        },
        {
          achievementId: 'streak-criteria',
          criteria: { type: 'streak', params: { count: 30 } },
        },
        {
          achievementId: 'duration-criteria',
          criteria: { type: 'duration', params: { duration: 1440 } },
        },
        {
          achievementId: 'complex-criteria',
          criteria: {
            type: 'complex',
            params: {
              minCount: 10,
              minDuration: 960,
              weight: { min: 70, max: 80 },
              dates: [new Date('2025-01-01'), new Date('2025-12-31')],
            },
          },
        },
      ];

      for (const criteriaTest of criteriaTypes) {
        const achievement = await Achievement.create({
          ...criteriaTest,
          translations: {
            en: {
              name: `Criteria Test ${criteriaTest.achievementId}`,
              description: `Testing ${criteriaTest.criteria.type} criteria`,
              shortDescription: `${criteriaTest.criteria.type}`,
            },
          },
          category: 'getting-started',
          points: 10,
          rarity: 'common',
          order: 1,
          createdBy: admin._id,
        });

        expect(achievement.criteria.type).toBe(criteriaTest.criteria.type);
        expect(achievement.criteria.params).toEqual(criteriaTest.criteria.params);
      }
    });
  });

  /**
   * T015: Achievement default values
   */
  describe('T015 - Default values validation', () => {
    it('should set isActive default to true', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t015-isactive@test.com',
      });

      const achievement = await Achievement.create({
        achievementId: 'default-isactive',
        translations: {
          en: {
            name: 'Default isActive',
            description: 'Testing isActive default',
            shortDescription: 'isActive default',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
        // isActive not provided
      });

      expect(achievement.isActive).toBe(true);
    });

    it('should set isSecret default to false', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t015-issecret@test.com',
      });

      const achievement = await Achievement.create({
        achievementId: 'default-issecret',
        translations: {
          en: {
            name: 'Default isSecret',
            description: 'Testing isSecret default',
            shortDescription: 'isSecret default',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
        // isSecret not provided
      });

      expect(achievement.isSecret).toBe(false);
    });

    it('should allow overriding defaults', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t015-override@test.com',
      });

      const achievement = await Achievement.create({
        achievementId: 'override-defaults',
        translations: {
          en: {
            name: 'Override Defaults',
            description: 'Testing default overrides',
            shortDescription: 'Override defaults',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
        isActive: false,
        isSecret: true,
      });

      expect(achievement.isActive).toBe(false);
      expect(achievement.isSecret).toBe(true);
    });
  });

  /**
   * T016: Achievement timestamps
   */
  describe('T016 - Timestamps validation', () => {
    it('should automatically set createdAt and updatedAt on creation', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t016@test.com',
      });

      const beforeCreate = new Date();

      const achievement = await Achievement.create({
        achievementId: 'timestamp-test',
        translations: {
          en: {
            name: 'Timestamp Test',
            description: 'Testing automatic timestamps',
            shortDescription: 'Timestamp test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      const afterCreate = new Date();

      expect(achievement.createdAt).toBeDefined();
      expect(achievement.updatedAt).toBeDefined();
      expect(achievement.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(achievement.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(achievement.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(achievement.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on modification', async () => {
      const admin = await User.create({
        ...testUsers.adminUser,
        email: 'admin-t016-update@test.com',
      });

      const achievement = await Achievement.create({
        achievementId: 'timestamp-update-test',
        translations: {
          en: {
            name: 'Timestamp Update Test',
            description: 'Testing updatedAt timestamp',
            shortDescription: 'Update test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      const originalUpdatedAt = achievement.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update achievement
      achievement.points = 20;
      await achievement.save();

      expect(achievement.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
