import mongoose from 'mongoose';
import achievementAdminService from '../../../../src/lib/services/achievementAdminService';
import Achievement from '../../../../src/lib/models/Achievement';
import UserAchievement from '../../../../src/lib/models/UserAchievement';
import AdminAuditLog from '../../../../src/lib/models/AdminAuditLog';

describe('AchievementAdminService', () => {
  let testUserId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fasting-test');
    }
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    await AdminAuditLog.deleteMany({});
  });

  describe('list()', () => {
    it('should be tested in T018', () => {
      expect(achievementAdminService.list).toBeDefined();
    });
  });

  describe('getById()', () => {
    it('should be tested in T058', () => {
      expect(achievementAdminService.getById).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should be tested in T036', () => {
      expect(achievementAdminService.create).toBeDefined();
    });
  });

  describe('update()', () => {
    it('should be tested in T058', () => {
      expect(achievementAdminService.update).toBeDefined();
    });
  });

  describe('toggleActive()', () => {
    it('should be tested in T075', () => {
      expect(achievementAdminService.toggleActive).toBeDefined();
    });
  });

  describe('bulkActivate()', () => {
    it('should be tested in T075', () => {
      expect(achievementAdminService.bulkActivate).toBeDefined();
    });
  });

  describe('bulkDeactivate()', () => {
    it('should be tested in T075', () => {
      expect(achievementAdminService.bulkDeactivate).toBeDefined();
    });
  });

  describe('delete()', () => {
    it('should be tested in T134', () => {
      expect(achievementAdminService.delete).toBeDefined();
    });
  });
});
