/**
 * Entry Validation Schema Tests
 * 
 * Tests for validating entry form data using Joi.
 * Ensures data integrity before database operations.
 */

import { validateEntry, entrySchema } from '@/lib/validation/entrySchema';

describe('Entry Validation Schema', () => {
  describe('Valid Entry Data', () => {
    it('should validate complete valid entry', () => {
      const validEntry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 16,
        hoursOfSleep: 8,
        morningWeight: 70.5,
        hungerLevel: 'Low',
        energyLevel: 'High Energy',
        wellBeing: 'Good',
        foodNotes: 'Had a salad for lunch',
      };

      const { error, value } = validateEntry(validEntry);
      expect(error).toBeUndefined();
      expect(value.date).toBeInstanceOf(Date);
      expect(value.firstMealTime).toBe(validEntry.firstMealTime);
      expect(value.lastMealTime).toBe(validEntry.lastMealTime);
    });

    it('should validate minimal required entry', () => {
      const minimalEntry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      };

      const { error, value } = validateEntry(minimalEntry);
      expect(error).toBeUndefined();
      expect(value.date).toBeInstanceOf(Date);
      expect(value.firstMealTime).toBe(minimalEntry.firstMealTime);
      expect(value.lastMealTime).toBe(minimalEntry.lastMealTime);
    });

    it('should validate entry with partial optional fields', () => {
      const partialEntry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        morningWeight: 75.5,
        hungerLevel: 'Medium',
      };

      const { error, value } = validateEntry(partialEntry);
      expect(error).toBeUndefined();
      expect(value.date).toBeInstanceOf(Date);
      expect(value.firstMealTime).toBe(partialEntry.firstMealTime);
      expect(value.morningWeight).toBe(partialEntry.morningWeight);
      expect(value.hungerLevel).toBe(partialEntry.hungerLevel);
    });
  });

  describe('Date Validation', () => {
    it('should require date field', () => {
      const entry = {
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date');
      expect(error.details[0].message).toMatch(/required/i);
    });

    it('should accept valid ISO date string', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject invalid date format', () => {
      const entry = {
        date: 'invalid-date',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date');
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const entry = {
        date: futureDate.toISOString().split('T')[0],
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date');
      expect(error.details[0].message).toMatch(/cannot be in the future/i);
    });
  });

  describe('Time Validation', () => {
    it('should require firstMealTime', () => {
      const entry = {
        date: '2024-03-15',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('firstMealTime');
    });

    it('should require lastMealTime', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('lastMealTime');
    });

    it('should accept valid HH:mm format', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '08:30',
        lastMealTime: '20:45',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should accept single digit hours', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '8:30',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject invalid time format', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '25:00',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('firstMealTime');
    });

    it('should reject time with invalid minutes', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:60',
        lastMealTime: '20:00',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
    });
  });

  describe('Fasting Duration Validation', () => {
    it('should accept valid fasting duration', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 16,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should accept decimal fasting duration', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 16.5,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject negative fasting duration', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: -5,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('fastingDuration');
    });

    it('should reject fasting duration > 168 hours (7 days)', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 169,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('fastingDuration');
    });
  });

  describe('Hours of Sleep Validation', () => {
    it('should accept valid hours of sleep', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: 8,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should accept decimal hours', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: 7.5,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject negative hours', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: -2,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
    });

    it('should reject hours > 24', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: 25,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
    });
  });

  describe('Morning Weight Validation', () => {
    it('should accept valid weight', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        morningWeight: 70.5,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject negative weight', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        morningWeight: -70,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('morningWeight');
    });

    it('should reject weight > 1000', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        morningWeight: 1001,
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
    });
  });

  describe('Enum Field Validation', () => {
    describe('hungerLevel', () => {
      it('should accept valid values', () => {
        const validValues = ['Low', 'Medium', 'High'];
        
        validValues.forEach(value => {
          const entry = {
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            hungerLevel: value,
          };

          const { error } = validateEntry(entry);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid values', () => {
        const entry = {
          date: '2024-03-15',
          firstMealTime: '12:00',
          lastMealTime: '20:00',
          hungerLevel: 'Invalid',
        };

        const { error } = validateEntry(entry);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('hungerLevel');
      });
    });

    describe('energyLevel', () => {
      it('should accept valid values', () => {
        const validValues = ['Low Energy', 'Medium Energy', 'High Energy'];
        
        validValues.forEach(value => {
          const entry = {
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            energyLevel: value,
          };

          const { error } = validateEntry(entry);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid values', () => {
        const entry = {
          date: '2024-03-15',
          firstMealTime: '12:00',
          lastMealTime: '20:00',
          energyLevel: 'Super High',
        };

        const { error } = validateEntry(entry);
        expect(error).toBeDefined();
      });
    });

    describe('wellBeing', () => {
      it('should accept valid values', () => {
        const validValues = ['Poor', 'Fair', 'Good'];
        
        validValues.forEach(value => {
          const entry = {
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            wellBeing: value,
          };

          const { error } = validateEntry(entry);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid values', () => {
        const entry = {
          date: '2024-03-15',
          firstMealTime: '12:00',
          lastMealTime: '20:00',
          wellBeing: 'Excellent',
        };

        const { error } = validateEntry(entry);
        expect(error).toBeDefined();
      });
    });
  });

  describe('Food Notes Validation', () => {
    it('should accept valid notes', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        foodNotes: 'Had a healthy salad for lunch and grilled chicken for dinner.',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should accept empty string', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        foodNotes: '',
      };

      const { error } = validateEntry(entry);
      expect(error).toBeUndefined();
    });

    it('should reject notes > 2000 characters', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        foodNotes: 'a'.repeat(2001),
      };

      const { error } = validateEntry(entry);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('foodNotes');
    });
  });

  describe('Unknown Fields', () => {
    it('should strip unknown fields', () => {
      const entry = {
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        unknownField: 'should be removed',
      };

      const { error, value } = validateEntry(entry);
      expect(error).toBeUndefined();
      expect(value.unknownField).toBeUndefined();
    });
  });
});
