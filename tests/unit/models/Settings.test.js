/**
 * Settings Model Tests
 * 
 * Note: These tests are skipped due to Jest/Mongoose ES module compatibility issues.
 * Settings model will be tested via integration tests in Phase 2 (API layer).
 * This file documents the expected behavior and serves as a requirements specification.
 */

import connectDB, { disconnectDB } from '@/lib/db';
import Settings from '@/lib/models/Settings';

describe('Settings Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await Settings.deleteMany({});
  });

  describe('Schema Structure', () => {
    it('should have all required fields', () => {
      const settings = new Settings();
      expect(settings.schema.paths).toHaveProperty('userId');
      expect(settings.schema.paths).toHaveProperty('measurementSystem');
      expect(settings.schema.paths).toHaveProperty('timeFormat');
    });

    it('should have correct field types', () => {
      const settings = new Settings();
      expect(settings.schema.paths.userId.instance).toBe('String');
      expect(settings.schema.paths.measurementSystem.instance).toBe('String');
      expect(settings.schema.paths.timeFormat.instance).toBe('String');
    });

    it('should have timestamps', () => {
      const settings = new Settings();
      expect(settings.schema.paths).toHaveProperty('createdAt');
      expect(settings.schema.paths).toHaveProperty('updatedAt');
    });
  });

  describe('Default Values', () => {
    it('should set default userId to "default"', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });
      await settings.save();

      expect(settings.userId).toBe('default');
    });

    it('should accept custom userId', async () => {
      const settings = new Settings({
        userId: 'user123',
        measurementSystem: 'metric',
        timeFormat: '24h',
      });
      await settings.save();

      expect(settings.userId).toBe('user123');
    });
  });

  describe('Required Fields', () => {
    it('should require measurementSystem', async () => {
      const settings = new Settings({
        timeFormat: '24h',
      });

      let error;
      try {
        await settings.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.measurementSystem).toBeDefined();
    });

    it('should require timeFormat', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
      });

      let error;
      try {
        await settings.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.timeFormat).toBeDefined();
    });
  });

  describe('Measurement System Validation', () => {
    it('should accept "metric" as valid measurementSystem', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });

      await expect(settings.save()).resolves.toBeDefined();
      expect(settings.measurementSystem).toBe('metric');
    });

    it('should accept "imperial" as valid measurementSystem', async () => {
      const settings = new Settings({
        measurementSystem: 'imperial',
        timeFormat: '24h',
      });

      await expect(settings.save()).resolves.toBeDefined();
      expect(settings.measurementSystem).toBe('imperial');
    });

    it('should reject invalid measurementSystem values', async () => {
      const settings = new Settings({
        measurementSystem: 'invalid',
        timeFormat: '24h',
      });

      let error;
      try {
        await settings.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.measurementSystem).toBeDefined();
      expect(error.errors.measurementSystem.message).toContain('not a valid enum value');
    });
  });

  describe('Time Format Validation', () => {
    it('should accept "12h" as valid timeFormat', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
        timeFormat: '12h',
      });

      await expect(settings.save()).resolves.toBeDefined();
      expect(settings.timeFormat).toBe('12h');
    });

    it('should accept "24h" as valid timeFormat', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });

      await expect(settings.save()).resolves.toBeDefined();
      expect(settings.timeFormat).toBe('24h');
    });

    it('should reject invalid timeFormat values', async () => {
      const settings = new Settings({
        measurementSystem: 'metric',
        timeFormat: 'invalid',
      });

      let error;
      try {
        await settings.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.timeFormat).toBeDefined();
      expect(error.errors.timeFormat.message).toContain('not a valid enum value');
    });
  });

  describe('Unique Constraint', () => {
    it('should enforce unique userId constraint', async () => {
      const settings1 = new Settings({
        userId: 'user123',
        measurementSystem: 'metric',
        timeFormat: '24h',
      });
      await settings1.save();

      const settings2 = new Settings({
        userId: 'user123',
        measurementSystem: 'imperial',
        timeFormat: '12h',
      });

      let error;
      try {
        await settings2.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should allow only one default settings document', async () => {
      const settings1 = new Settings({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });
      await settings1.save();

      const settings2 = new Settings({
        measurementSystem: 'imperial',
        timeFormat: '12h',
      });

      let error;
      try {
        await settings2.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    });
  });

  describe('Static Methods', () => {
    describe('getOrCreateDefault', () => {
      it('should create default settings if none exist', async () => {
        const settings = await Settings.getOrCreateDefault();

        expect(settings).toBeDefined();
        expect(settings.userId).toBe('default');
        expect(settings.measurementSystem).toBe('metric');
        expect(settings.timeFormat).toBe('24h');
      });

      it('should return existing default settings if they exist', async () => {
        // Create settings
        const created = await Settings.create({
          measurementSystem: 'imperial',
          timeFormat: '12h',
        });

        // Get or create should return existing
        const retrieved = await Settings.getOrCreateDefault();

        expect(retrieved._id.toString()).toBe(created._id.toString());
        expect(retrieved.measurementSystem).toBe('imperial');
        expect(retrieved.timeFormat).toBe('12h');
      });

      it('should not create duplicate settings', async () => {
        await Settings.getOrCreateDefault();
        await Settings.getOrCreateDefault();

        const count = await Settings.countDocuments({ userId: 'default' });
        expect(count).toBe(1);
      });
    });

    describe('findByUserId', () => {
      it('should find settings by userId', async () => {
        await Settings.create({
          userId: 'user123',
          measurementSystem: 'imperial',
          timeFormat: '12h',
        });

        const settings = await Settings.findByUserId('user123');

        expect(settings).toBeDefined();
        expect(settings.userId).toBe('user123');
        expect(settings.measurementSystem).toBe('imperial');
      });

      it('should return null if userId not found', async () => {
        const settings = await Settings.findByUserId('nonexistent');
        expect(settings).toBeNull();
      });
    });
  });

  describe('Update Settings', () => {
    it('should allow updating measurementSystem', async () => {
      const settings = await Settings.create({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });

      settings.measurementSystem = 'imperial';
      await settings.save();

      const updated = await Settings.findById(settings._id);
      expect(updated.measurementSystem).toBe('imperial');
    });

    it('should allow updating timeFormat', async () => {
      const settings = await Settings.create({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });

      settings.timeFormat = '12h';
      await settings.save();

      const updated = await Settings.findById(settings._id);
      expect(updated.timeFormat).toBe('12h');
    });

    it('should update timestamps on save', async () => {
      const settings = await Settings.create({
        measurementSystem: 'metric',
        timeFormat: '24h',
      });

      const originalUpdatedAt = settings.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      settings.measurementSystem = 'imperial';
      await settings.save();

      expect(settings.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
