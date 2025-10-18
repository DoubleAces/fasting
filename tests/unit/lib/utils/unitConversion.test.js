/**
 * Unit Conversion Utilities Tests
 * 
 * Tests for converting between metric (kg) and imperial (lbs) weight units.
 * Uses standard conversion factor: 1 kg = 2.20462 lbs
 */

import {
  kgToLbs,
  lbsToKg,
  convertWeight,
  isValidWeight,
  formatWeight,
} from '@/lib/utils/unitConversion';

describe('Unit Conversion Utilities', () => {
  describe('kgToLbs', () => {
    it('should convert kilograms to pounds', () => {
      expect(kgToLbs(1)).toBeCloseTo(2.2, 1);
      expect(kgToLbs(10)).toBeCloseTo(22, 1);
      expect(kgToLbs(70)).toBeCloseTo(154.3, 1);
    });

    it('should round to 1 decimal place by default', () => {
      expect(kgToLbs(70)).toBe(154.3);
      expect(kgToLbs(80.5)).toBe(177.5);
    });

    it('should handle decimal kilograms', () => {
      expect(kgToLbs(75.5)).toBe(166.4);
      expect(kgToLbs(60.2)).toBe(132.7);
    });

    it('should handle zero', () => {
      expect(kgToLbs(0)).toBe(0);
    });

    it('should handle very small weights', () => {
      expect(kgToLbs(0.5)).toBe(1.1);
      expect(kgToLbs(0.1)).toBe(0.2);
    });

    it('should handle very large weights', () => {
      expect(kgToLbs(200)).toBe(440.9);
      expect(kgToLbs(500)).toBe(1102.3);
    });

    it('should throw error for negative weights', () => {
      expect(() => kgToLbs(-10)).toThrow('Weight cannot be negative');
    });

    it('should throw error for null', () => {
      expect(() => kgToLbs(null)).toThrow('Weight must be a valid number');
    });

    it('should throw error for undefined', () => {
      expect(() => kgToLbs(undefined)).toThrow('Weight must be a valid number');
    });

    it('should throw error for NaN', () => {
      expect(() => kgToLbs(NaN)).toThrow('Weight must be a valid number');
    });

    it('should throw error for string', () => {
      expect(() => kgToLbs('70')).toThrow('Weight must be a valid number');
    });
  });

  describe('lbsToKg', () => {
    it('should convert pounds to kilograms', () => {
      expect(lbsToKg(2.20462)).toBeCloseTo(1, 5);
      expect(lbsToKg(22.0462)).toBeCloseTo(10, 4);
      expect(lbsToKg(154.3234)).toBeCloseTo(70, 4);
    });

    it('should round to 1 decimal place by default', () => {
      expect(lbsToKg(154.3)).toBe(70);
      expect(lbsToKg(177.5)).toBe(80.5);
    });

    it('should handle decimal pounds', () => {
      expect(lbsToKg(166.4)).toBe(75.5);
      expect(lbsToKg(132.7)).toBe(60.2);
    });

    it('should handle zero', () => {
      expect(lbsToKg(0)).toBe(0);
    });

    it('should handle very small weights', () => {
      expect(lbsToKg(1.1)).toBe(0.5);
      expect(lbsToKg(0.2)).toBe(0.1);
    });

    it('should handle very large weights', () => {
      expect(lbsToKg(440.9)).toBe(200);
      expect(lbsToKg(1102.3)).toBe(500);
    });

    it('should throw error for negative weights', () => {
      expect(() => lbsToKg(-10)).toThrow('Weight cannot be negative');
    });

    it('should throw error for null', () => {
      expect(() => lbsToKg(null)).toThrow('Weight must be a valid number');
    });

    it('should throw error for undefined', () => {
      expect(() => lbsToKg(undefined)).toThrow('Weight must be a valid number');
    });

    it('should throw error for NaN', () => {
      expect(() => lbsToKg(NaN)).toThrow('Weight must be a valid number');
    });
  });

  describe('convertWeight', () => {
    it('should convert from metric to imperial', () => {
      const result = convertWeight(70, 'metric', 'imperial');
      expect(result).toBe(154.3);
    });

    it('should convert from imperial to metric', () => {
      const result = convertWeight(154.3, 'imperial', 'metric');
      expect(result).toBe(70);
    });

    it('should return same value when units are the same (metric)', () => {
      const result = convertWeight(70, 'metric', 'metric');
      expect(result).toBe(70);
    });

    it('should return same value when units are the same (imperial)', () => {
      const result = convertWeight(154.3, 'imperial', 'imperial');
      expect(result).toBe(154.3);
    });

    it('should handle decimal weights', () => {
      expect(convertWeight(75.5, 'metric', 'imperial')).toBe(166.4);
      expect(convertWeight(166.4, 'imperial', 'metric')).toBe(75.5);
    });

    it('should handle zero', () => {
      expect(convertWeight(0, 'metric', 'imperial')).toBe(0);
      expect(convertWeight(0, 'imperial', 'metric')).toBe(0);
    });

    it('should throw error for invalid from unit', () => {
      expect(() => convertWeight(70, 'invalid', 'imperial')).toThrow(
        'Invalid unit system'
      );
    });

    it('should throw error for invalid to unit', () => {
      expect(() => convertWeight(70, 'metric', 'invalid')).toThrow(
        'Invalid unit system'
      );
    });

    it('should throw error for negative weights', () => {
      expect(() => convertWeight(-70, 'metric', 'imperial')).toThrow(
        'Weight cannot be negative'
      );
    });

    it('should throw error for null weight', () => {
      expect(() => convertWeight(null, 'metric', 'imperial')).toThrow(
        'Weight must be a valid number'
      );
    });
  });

  describe('isValidWeight', () => {
    it('should return true for valid weights', () => {
      expect(isValidWeight(70)).toBe(true);
      expect(isValidWeight(0.5)).toBe(true);
      expect(isValidWeight(200)).toBe(true);
    });

    it('should return true for zero', () => {
      expect(isValidWeight(0)).toBe(true);
    });

    it('should return false for negative weights', () => {
      expect(isValidWeight(-10)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidWeight(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidWeight(undefined)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidWeight(NaN)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isValidWeight('70')).toBe(false);
    });

    it('should return false for objects', () => {
      expect(isValidWeight({})).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isValidWeight([])).toBe(false);
    });

    it('should return false for extremely large weights (>1000 kg/2204 lbs)', () => {
      expect(isValidWeight(1000)).toBe(true); // Valid (1000 kg)
      expect(isValidWeight(1001)).toBe(true); // Valid (1001 lbs < 2204)
      expect(isValidWeight(2204)).toBe(true); // Valid (2204 lbs = ~1000 kg)
      expect(isValidWeight(2205)).toBe(false); // Invalid (>1000 kg in lbs)
    });
  });

  describe('formatWeight', () => {
    it('should format weight with 1 decimal place', () => {
      expect(formatWeight(70.123)).toBe('70.1');
      expect(formatWeight(154.356)).toBe('154.4');
    });

    it('should format weight with unit (metric)', () => {
      expect(formatWeight(70, 'metric')).toBe('70 kg');
      expect(formatWeight(75.5, 'metric')).toBe('75.5 kg');
    });

    it('should format weight with unit (imperial)', () => {
      expect(formatWeight(154.3, 'imperial')).toBe('154.3 lbs');
      expect(formatWeight(177.5, 'imperial')).toBe('177.5 lbs');
    });

    it('should handle zero', () => {
      expect(formatWeight(0)).toBe('0');
      expect(formatWeight(0, 'metric')).toBe('0 kg');
      expect(formatWeight(0, 'imperial')).toBe('0 lbs');
    });

    it('should round to 1 decimal place', () => {
      expect(formatWeight(70.999)).toBe('71');
      expect(formatWeight(70.123)).toBe('70.1');
    });

    it('should remove trailing .0', () => {
      expect(formatWeight(70.0)).toBe('70');
      expect(formatWeight(70.0, 'metric')).toBe('70 kg');
    });

    it('should handle very small weights', () => {
      expect(formatWeight(0.5, 'metric')).toBe('0.5 kg');
      expect(formatWeight(0.1, 'imperial')).toBe('0.1 lbs');
    });

    it('should handle very large weights', () => {
      expect(formatWeight(500, 'metric')).toBe('500 kg');
      expect(formatWeight(1102.3, 'imperial')).toBe('1102.3 lbs');
    });

    it('should throw error for invalid unit', () => {
      expect(() => formatWeight(70, 'invalid')).toThrow('Invalid unit system');
    });

    it('should throw error for negative weights', () => {
      expect(() => formatWeight(-70)).toThrow('Weight cannot be negative');
    });

    it('should throw error for null', () => {
      expect(() => formatWeight(null)).toThrow('Weight must be a valid number');
    });
  });

  describe('Round-trip Conversions', () => {
    it('should maintain value through kg -> lbs -> kg', () => {
      const original = 70;
      const lbs = kgToLbs(original);
      const back = lbsToKg(lbs);
      expect(back).toBeCloseTo(original, 1);
    });

    it('should maintain value through lbs -> kg -> lbs', () => {
      const original = 154.3;
      const kg = lbsToKg(original);
      const back = kgToLbs(kg);
      expect(back).toBeCloseTo(original, 1);
    });

    it('should handle multiple round-trip conversions', () => {
      let weight = 75.5;
      weight = kgToLbs(weight); // to lbs
      weight = lbsToKg(weight); // back to kg
      weight = kgToLbs(weight); // to lbs again
      weight = lbsToKg(weight); // back to kg again
      expect(weight).toBeCloseTo(75.5, 1);
    });
  });
});
