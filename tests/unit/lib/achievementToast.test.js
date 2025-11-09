/**
 * Unit Tests: Achievement Toast Helper Functions
 * 
 * Tests for formatAchievementToast() and getRarityEmoji() functions
 * Feature: 034-achievement-unlock-toasts
 */

import { formatAchievementToast, getRarityEmoji } from '@/lib/utils/achievementToast';

describe('getRarityEmoji', () => {
  it('returns trophy emoji for Common rarity', () => {
    expect(getRarityEmoji('Common')).toBe('🏆');
  });

  it('returns star emoji for Rare rarity', () => {
    expect(getRarityEmoji('Rare')).toBe('⭐');
  });

  it('returns celebration emoji for Epic rarity', () => {
    expect(getRarityEmoji('Epic')).toBe('🎉');
  });

  it('returns sparkles emoji for Legendary rarity', () => {
    expect(getRarityEmoji('Legendary')).toBe('✨');
  });

  it('returns default trophy emoji for unknown rarity', () => {
    expect(getRarityEmoji('Unknown')).toBe('🏆');
  });

  it('returns default trophy emoji for undefined rarity', () => {
    expect(getRarityEmoji(undefined)).toBe('🏆');
  });

  it('returns default trophy emoji for null rarity', () => {
    expect(getRarityEmoji(null)).toBe('🏆');
  });
});

describe('formatAchievementToast', () => {
  describe('single achievement', () => {
    it('formats single Common achievement correctly', () => {
      const achievements = [{
        name: 'First 12-Hour Fast',
        points: 10,
        rarity: 'Common'
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! First 12-Hour Fast - 10 points (Common)');
    });

    it('formats single Rare achievement with correct emoji', () => {
      const achievements = [{
        name: 'Week Warrior',
        points: 25,
        rarity: 'Rare'
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('⭐ Achievement Unlocked! Week Warrior - 25 points (Rare)');
    });

    it('formats single Epic achievement with correct emoji', () => {
      const achievements = [{
        name: 'Month Champion',
        points: 50,
        rarity: 'Epic'
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🎉 Achievement Unlocked! Month Champion - 50 points (Epic)');
    });

    it('formats single Legendary achievement with correct emoji', () => {
      const achievements = [{
        name: 'Fasting Master',
        points: 100,
        rarity: 'Legendary'
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('✨ Achievement Unlocked! Fasting Master - 100 points (Legendary)');
    });
  });

  describe('empty or invalid input', () => {
    it('returns null for empty array', () => {
      expect(formatAchievementToast([])).toBeNull();
    });

    it('returns null for null input', () => {
      expect(formatAchievementToast(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(formatAchievementToast(undefined)).toBeNull();
    });

    it('returns null for non-array input', () => {
      expect(formatAchievementToast('not an array')).toBeNull();
    });
  });

  describe('malformed data handling', () => {
    it('returns fallback message when all achievements are invalid', () => {
      const achievements = [
        { name: '', points: 10, rarity: 'Common' }, // Empty name
        { points: 20, rarity: 'Rare' }, // Missing name
        { name: 'Valid', rarity: 'Epic' } // Missing points
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! View your achievements page for details.');
    });

    it('filters out invalid achievements and formats valid ones', () => {
      const achievements = [
        { name: 'Valid Achievement', points: 10, rarity: 'Common' },
        { points: 20, rarity: 'Rare' }, // Missing name - should be filtered
        { name: '', points: 15, rarity: 'Epic' } // Empty name - should be filtered
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! Valid Achievement - 10 points (Common)');
    });

    it('handles achievement with missing rarity', () => {
      const achievements = [{
        name: 'Achievement',
        points: 10
        // Missing rarity - should be filtered out
      }];

      const result = formatAchievementToast(achievements);
      expect(result).toBe('🏆 Achievement Unlocked! View your achievements page for details.');
    });
  });
});

describe('formatAchievementToast - Multiple Achievements (US2)', () => {
  describe('T021: Two achievements', () => {
    it('formats two achievements with consolidated format', () => {
      const achievements = [
        { name: 'First 12-Hour Fast', points: 10, rarity: 'Common' },
        { name: 'First Entry Logged', points: 5, rarity: 'Common' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('2 Achievements Unlocked!');
      expect(result).toContain('First 12-Hour Fast (10 pts)');
      expect(result).toContain('First Entry Logged (5 pts)');
      expect(result).toContain('(+15 pts total)');
    });

    it('uses bullet separator between achievement names', () => {
      const achievements = [
        { name: 'Achievement One', points: 10, rarity: 'Rare' },
        { name: 'Achievement Two', points: 20, rarity: 'Epic' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('Achievement One (10 pts) • Achievement Two (20 pts)');
    });

    it('uses emoji from first achievement for multiple achievements', () => {
      const achievements = [
        { name: 'Rare Achievement', points: 25, rarity: 'Rare' },
        { name: 'Common Achievement', points: 10, rarity: 'Common' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toStartWith('⭐'); // Rare emoji from first achievement
    });
  });

  describe('T022: Four or more achievements with truncation', () => {
    it('truncates display to first 3 achievements when 4 unlocked', () => {
      const achievements = [
        { name: 'Achievement 1', points: 10, rarity: 'Common' },
        { name: 'Achievement 2', points: 15, rarity: 'Rare' },
        { name: 'Achievement 3', points: 20, rarity: 'Epic' },
        { name: 'Achievement 4', points: 25, rarity: 'Legendary' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('4 Achievements Unlocked!');
      expect(result).toContain('Achievement 1 (10 pts)');
      expect(result).toContain('Achievement 2 (15 pts)');
      expect(result).toContain('Achievement 3 (20 pts)');
      expect(result).toContain('and 1 more...');
      expect(result).not.toContain('Achievement 4');
      expect(result).toContain('(+70 pts total)'); // Sum of all 4
    });

    it('shows "and X more..." for 5+ achievements', () => {
      const achievements = [
        { name: 'Achievement 1', points: 10, rarity: 'Common' },
        { name: 'Achievement 2', points: 10, rarity: 'Common' },
        { name: 'Achievement 3', points: 10, rarity: 'Common' },
        { name: 'Achievement 4', points: 10, rarity: 'Common' },
        { name: 'Achievement 5', points: 10, rarity: 'Common' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('5 Achievements Unlocked!');
      expect(result).toContain('and 2 more...');
      expect(result).toContain('(+50 pts total)');
    });

    it('calculates total points correctly for all achievements even when truncated', () => {
      const achievements = [
        { name: 'A', points: 100, rarity: 'Legendary' },
        { name: 'B', points: 50, rarity: 'Epic' },
        { name: 'C', points: 25, rarity: 'Rare' },
        { name: 'D', points: 10, rarity: 'Common' },
        { name: 'E', points: 5, rarity: 'Common' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('(+190 pts total)'); // Sum of all 5
    });
  });

  describe('Three achievements (no truncation)', () => {
    it('shows all 3 achievements without truncation', () => {
      const achievements = [
        { name: 'First', points: 10, rarity: 'Common' },
        { name: 'Second', points: 20, rarity: 'Rare' },
        { name: 'Third', points: 30, rarity: 'Epic' }
      ];

      const result = formatAchievementToast(achievements);
      expect(result).toContain('3 Achievements Unlocked!');
      expect(result).toContain('First (10 pts)');
      expect(result).toContain('Second (20 pts)');
      expect(result).toContain('Third (30 pts)');
      expect(result).not.toContain('and');
      expect(result).toContain('(+60 pts total)');
    });
  });
});
