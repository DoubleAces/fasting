import mongoose from 'mongoose';
import auditLogService from '../../../../src/lib/services/auditLogService';
import AdminAuditLog from '../../../../src/lib/models/AdminAuditLog';

describe('AuditLogService', () => {
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
    await AdminAuditLog.deleteMany({});
  });

  describe('log()', () => {
    it('should create audit log with all action types', async () => {
      const actions = [
        'view-list',
        'view-analytics',
        'create-achievement',
        'update-achievement',
        'delete-achievement',
        'activate-achievement',
        'deactivate-achievement',
        'bulk-activate',
        'bulk-deactivate',
        'csv-export',
        'csv-import'
      ];

      for (const action of actions) {
        const log = await auditLogService.log({
          userId: testUserId,
          action,
          resource: 'achievement',
          resourceId: 'test-achievement',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent'
        });

        expect(log).toBeDefined();
        expect(log.action).toBe(action);
      }

      const count = await AdminAuditLog.countDocuments();
      expect(count).toBe(actions.length);
    });

    it('should log create action', async () => {
      const log = await auditLogService.log({
        userId: testUserId,
        action: 'create-achievement',
        resource: 'achievement',
        resourceId: 'new-achievement',
        changes: {
          achievementId: 'new-achievement',
          tier: 'bronze',
          points: 10
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('create-achievement');
      expect(log.resourceId).toBe('new-achievement');
      expect(log.changes.tier).toBe('bronze');
    });

    it('should log update action with before/after', async () => {
      const log = await auditLogService.log({
        userId: testUserId,
        action: 'update-achievement',
        resource: 'achievement',
        resourceId: 'test-achievement',
        changes: {
          before: { tier: 'bronze', points: 10 },
          after: { tier: 'silver', points: 25 }
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log).toBeDefined();
      expect(log.changes.before.tier).toBe('bronze');
      expect(log.changes.after.tier).toBe('silver');
    });

    it('should log bulk operations', async () => {
      const log = await auditLogService.log({
        userId: testUserId,
        action: 'bulk-activate',
        resource: 'achievement',
        resourceId: 'bulk',
        changes: {
          achievementIds: ['first-fast', 'sweet-sixteen'],
          count: 2
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log).toBeDefined();
      expect(log.changes.count).toBe(2);
      expect(log.changes.achievementIds).toHaveLength(2);
    });

    it('should log CSV import with errors', async () => {
      const log = await auditLogService.log({
        userId: testUserId,
        action: 'csv-import',
        resource: 'translation',
        changes: {
          rowsProcessed: 45,
          errors: ['Row 12: Invalid format', 'Row 23: Missing field']
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log).toBeDefined();
      expect(log.changes.rowsProcessed).toBe(45);
      expect(log.changes.errors).toHaveLength(2);
    });

    it('should capture IP address and user agent', async () => {
      const log = await auditLogService.log({
        userId: testUserId,
        action: 'view-list',
        resource: 'achievement',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });

      expect(log.ipAddress).toBe('203.0.113.45');
      expect(log.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    });

    it('should not throw on logging failure', async () => {
      // Pass invalid data but expect no throw
      const log = await auditLogService.log({
        userId: 'invalid-id', // Invalid ObjectId
        action: 'create-achievement',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Test'
      });

      // Should return null on failure but not throw
      expect(log).toBeNull();
    });
  });

  describe('query()', () => {
    beforeEach(async () => {
      // Create test logs
      await auditLogService.log({
        userId: testUserId,
        action: 'create-achievement',
        resource: 'achievement',
        resourceId: 'ach-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Test'
      });

      await auditLogService.log({
        userId: testUserId,
        action: 'update-achievement',
        resource: 'achievement',
        resourceId: 'ach-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Test'
      });

      await auditLogService.log({
        userId: new mongoose.Types.ObjectId(),
        action: 'delete-achievement',
        resource: 'achievement',
        resourceId: 'ach-2',
        ipAddress: '192.168.1.2',
        userAgent: 'Test'
      });
    });

    it('should query all logs', async () => {
      const logs = await auditLogService.query({});
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by userId', async () => {
      const logs = await auditLogService.query({ userId: testUserId });
      expect(logs).toHaveLength(2);
      logs.forEach(log => {
        expect(log.userId.toString()).toBe(testUserId.toString());
      });
    });

    it('should filter by action', async () => {
      const logs = await auditLogService.query({ action: 'create-achievement' });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      logs.forEach(log => {
        expect(log.action).toBe('create-achievement');
      });
    });

    it('should filter by resource', async () => {
      const logs = await auditLogService.query({ resource: 'achievement' });
      expect(logs.length).toBeGreaterThanOrEqual(3);
      logs.forEach(log => {
        expect(log.resource).toBe('achievement');
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 3600000); // 1 hour ago
      const endDate = new Date();

      const logs = await auditLogService.query({ startDate, endDate });
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect limit', async () => {
      const logs = await auditLogService.query({ limit: 2 });
      expect(logs).toHaveLength(2);
    });

    it('should sort by timestamp descending', async () => {
      const logs = await auditLogService.query({});
      
      for (let i = 0; i < logs.length - 1; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i + 1].timestamp.getTime()
        );
      }
    });
  });

  describe('getStatistics()', () => {
    beforeEach(async () => {
      const now = new Date();
      
      // Create multiple logs with different actions
      for (let i = 0; i < 5; i++) {
        await AdminAuditLog.create({
          userId: testUserId,
          action: 'create-achievement',
          resource: 'achievement',
          ipAddress: '192.168.1.1',
          userAgent: 'Test',
          timestamp: now
        });
      }

      for (let i = 0; i < 3; i++) {
        await AdminAuditLog.create({
          userId: testUserId,
          action: 'update-achievement',
          resource: 'achievement',
          ipAddress: '192.168.1.1',
          userAgent: 'Test',
          timestamp: now
        });
      }

      await AdminAuditLog.create({
        userId: testUserId,
        action: 'delete-achievement',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Test',
        timestamp: now
      });
    });

    it('should calculate total logs', async () => {
      const startDate = new Date(Date.now() - 3600000);
      const endDate = new Date();

      const stats = await auditLogService.getStatistics(null, startDate, endDate);
      
      expect(stats.total).toBeGreaterThanOrEqual(9);
    });

    it('should group by action', async () => {
      const startDate = new Date(Date.now() - 3600000);
      const endDate = new Date();

      const stats = await auditLogService.getStatistics(null, startDate, endDate);
      
      expect(stats.byAction['create-achievement']).toBeGreaterThanOrEqual(5);
      expect(stats.byAction['update-achievement']).toBeGreaterThanOrEqual(3);
      expect(stats.byAction['delete-achievement']).toBeGreaterThanOrEqual(1);
    });

    it('should filter by userId', async () => {
      const startDate = new Date(Date.now() - 3600000);
      const endDate = new Date();
      const otherUserId = new mongoose.Types.ObjectId();

      // Create log for different user
      await AdminAuditLog.create({
        userId: otherUserId,
        action: 'view-list',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Test',
        timestamp: new Date()
      });

      const stats = await auditLogService.getStatistics(testUserId.toString(), startDate, endDate);
      
      expect(stats.total).toBe(9); // Should not include other user's log
    });
  });
});
