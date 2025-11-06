/**
 * Unit Tests: seed-achievements.js
 * 
 * Tests achievement content structure, translations, and metadata validation
 * WITHOUT database interaction (pure data validation).
 * 
 * Run with: npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
 */

import { achievementsData as achievements } from '../../../scripts/achievements-data.js';

describe('seed-achievements.js Content Validation', () => {
  
  describe('T006: Achievement Count', () => {
    test('Should have 81 achievement definitions in achievements array', () => {
      expect(achievements).toBeDefined();
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBe(81);
    });
  });

  describe('T007: English Translations', () => {
    test('All achievements have complete English translations (name, description, shortDescription)', () => {
      achievements.forEach(achievement => {
        expect(achievement.translations).toBeDefined();
        expect(achievement.translations.en).toBeDefined();
        expect(achievement.translations.en.name).toBeTruthy();
        expect(typeof achievement.translations.en.name).toBe('string');
        expect(achievement.translations.en.name.length).toBeGreaterThan(0);
        
        expect(achievement.translations.en.description).toBeTruthy();
        expect(typeof achievement.translations.en.description).toBe('string');
        expect(achievement.translations.en.description.length).toBeGreaterThan(0);
        
        expect(achievement.translations.en.shortDescription).toBeTruthy();
        expect(typeof achievement.translations.en.shortDescription).toBe('string');
        expect(achievement.translations.en.shortDescription.length).toBeGreaterThan(0);
      });
    });
  });

  describe('T008: Spanish Translations', () => {
    test('All achievements have complete Spanish translations (name, description, shortDescription)', () => {
      achievements.forEach(achievement => {
        expect(achievement.translations).toBeDefined();
        expect(achievement.translations.es).toBeDefined();
        expect(achievement.translations.es.name).toBeTruthy();
        expect(typeof achievement.translations.es.name).toBe('string');
        expect(achievement.translations.es.name.length).toBeGreaterThan(0);
        
        expect(achievement.translations.es.description).toBeTruthy();
        expect(typeof achievement.translations.es.description).toBe('string');
        expect(achievement.translations.es.description.length).toBeGreaterThan(0);
        
        expect(achievement.translations.es.shortDescription).toBeTruthy();
        expect(typeof achievement.translations.es.shortDescription).toBe('string');
        expect(achievement.translations.es.shortDescription.length).toBeGreaterThan(0);
      });
    });
  });

  describe('T009: Rarity Distribution', () => {
    test('Rarity distribution matches spec (~45% common, ~30% rare, ~18% epic, ~7% legendary)', () => {
      const rarityCounts = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      };

      achievements.forEach(achievement => {
        expect(achievement.rarity).toBeDefined();
        expect(['common', 'rare', 'epic', 'legendary']).toContain(achievement.rarity);
        rarityCounts[achievement.rarity]++;
      });

      const total = achievements.length;
      const commonPercent = (rarityCounts.common / total) * 100;
      const rarePercent = (rarityCounts.rare / total) * 100;
      const epicPercent = (rarityCounts.epic / total) * 100;
      const legendaryPercent = (rarityCounts.legendary / total) * 100;

      // Allow ±5% variance from target percentages
      expect(commonPercent).toBeGreaterThanOrEqual(40); // ~45% ±5%
      expect(commonPercent).toBeLessThanOrEqual(50);
      
      expect(rarePercent).toBeGreaterThanOrEqual(25); // ~30% ±5%
      expect(rarePercent).toBeLessThanOrEqual(35);
      
      expect(epicPercent).toBeGreaterThanOrEqual(13); // ~18% ±5%
      expect(epicPercent).toBeLessThanOrEqual(23);
      
      expect(legendaryPercent).toBeGreaterThanOrEqual(2); // ~7% ±5%
      expect(legendaryPercent).toBeLessThanOrEqual(12);
    });
  });

  describe('T010: Point Values by Rarity', () => {
    test('Point values scale correctly by rarity (common 5-25, rare 30-75, epic 80-150, legendary 200-500)', () => {
      achievements.forEach(achievement => {
        expect(achievement.points).toBeDefined();
        expect(typeof achievement.points).toBe('number');
        expect(achievement.points).toBeGreaterThan(0);

        switch (achievement.rarity) {
          case 'common':
            expect(achievement.points).toBeGreaterThanOrEqual(5);
            expect(achievement.points).toBeLessThanOrEqual(25);
            break;
          case 'rare':
            expect(achievement.points).toBeGreaterThanOrEqual(30);
            expect(achievement.points).toBeLessThanOrEqual(75);
            break;
          case 'epic':
            expect(achievement.points).toBeGreaterThanOrEqual(80);
            expect(achievement.points).toBeLessThanOrEqual(150);
            break;
          case 'legendary':
            expect(achievement.points).toBeGreaterThanOrEqual(200);
            expect(achievement.points).toBeLessThanOrEqual(500);
            break;
          default:
            throw new Error(`Invalid rarity: ${achievement.rarity}`);
        }
      });
    });
  });

  describe('T011: Category Distribution', () => {
    test('Category distribution valid (8-15 achievements per category, all 8 categories present)', () => {
      const categoryCounts = {
        'getting-started': 0,
        'duration': 0,
        'streak': 0,
        'goal': 0,
        'weight': 0,
        'consistency': 0,
        'special': 0,
        'knowledge': 0
      };

      achievements.forEach(achievement => {
        expect(achievement.category).toBeDefined();
        expect(Object.keys(categoryCounts)).toContain(achievement.category);
        categoryCounts[achievement.category]++;
      });

      // Verify all 8 categories are present
      Object.keys(categoryCounts).forEach(category => {
        expect(categoryCounts[category]).toBeGreaterThan(0);
        expect(categoryCounts[category]).toBeGreaterThanOrEqual(8);
        expect(categoryCounts[category]).toBeLessThanOrEqual(15);
      });

      // Verify specific category counts from spec
      expect(categoryCounts['getting-started']).toBe(8);
      expect(categoryCounts['duration']).toBe(12);
      expect(categoryCounts['streak']).toBe(10);
      expect(categoryCounts['goal']).toBe(8);
      expect(categoryCounts['weight']).toBe(8);
      expect(categoryCounts['consistency']).toBe(12);
      expect(categoryCounts['special']).toBe(15);
      expect(categoryCounts['knowledge']).toBe(8);
    });
  });

  describe('T012: Criteria Types', () => {
    test('Criteria types are valid (duration-milestone, streak, entry-count, or custom)', () => {
      const validTypes = ['duration-milestone', 'streak', 'entry-count', 'custom'];

      achievements.forEach(achievement => {
        expect(achievement.criteria).toBeDefined();
        expect(achievement.criteria.type).toBeDefined();
        expect(validTypes).toContain(achievement.criteria.type);
        expect(achievement.criteria.params).toBeDefined();
        expect(typeof achievement.criteria.params).toBe('object');
      });
    });
  });

  describe('T013: Icons and Colors', () => {
    test('All achievements have icon (emoji) and iconColor (hex code)', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      achievements.forEach(achievement => {
        // Icon validation
        expect(achievement.icon).toBeDefined();
        expect(typeof achievement.icon).toBe('string');
        expect(achievement.icon.length).toBeGreaterThan(0);

        // IconColor validation (hex code)
        expect(achievement.iconColor).toBeDefined();
        expect(typeof achievement.iconColor).toBe('string');
        expect(achievement.iconColor).toMatch(hexColorRegex);
      });
    });
  });

  describe('T014: Secret Achievements', () => {
    test('Secret achievements marked correctly (isSecret=true for ~5-7 achievements)', () => {
      const secretAchievements = achievements.filter(a => a.isSecret === true);
      
      expect(secretAchievements.length).toBeGreaterThanOrEqual(5);
      expect(secretAchievements.length).toBeLessThanOrEqual(7);

      // Verify secret achievements have valid rarities (any rarity is acceptable)
      secretAchievements.forEach(achievement => {
        expect(['common', 'rare', 'epic', 'legendary']).toContain(achievement.rarity);
      });
    });
  });

  describe('T015: Display Order', () => {
    test('Display order sequential within categories with gaps for insertions', () => {
      const categoryCounts = {};

      achievements.forEach(achievement => {
        if (!categoryCounts[achievement.category]) {
          categoryCounts[achievement.category] = [];
        }
        categoryCounts[achievement.category].push(achievement.order);
      });

      // Check each category has sequential ordering with gaps
      Object.keys(categoryCounts).forEach(category => {
        const orders = categoryCounts[category].sort((a, b) => a - b);
        
        // Verify orders are unique (no duplicates)
        const uniqueOrders = new Set(orders);
        expect(uniqueOrders.size).toBe(orders.length);

        // Verify orders are positive numbers
        orders.forEach(order => {
          expect(typeof order).toBe('number');
          expect(order).toBeGreaterThanOrEqual(0);
        });

        // Verify gaps exist (not every sequential number)
        // Most orders should follow pattern like 5, 10, 15, 20...
        const hasGaps = orders.some((order, i) => {
          if (i === 0) return false;
          return (order - orders[i - 1]) > 1;
        });
        expect(hasGaps).toBe(true);
      });
    });
  });

});
