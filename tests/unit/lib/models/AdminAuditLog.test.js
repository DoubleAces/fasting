import mongoose from 'mongoose';
import AdminAuditLog from '../../../../src/lib/models/AdminAuditLog';

describe('AdminAuditLog Model', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fasting-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await AdminAuditLog.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create audit log with required fields', async () => {
      const validLog = {
        userId: new mongoose.Types.ObjectId(),
        action: 'create-achievement',
        resource: 'achievement',
        resourceId: 'test-achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      const log = await AdminAuditLog.create(validLog);
      
      expect(log._id).toBeDefined();
      expect(log.timestamp).toBeInstanceOf(Date);
      expect(log.userId.toString()).toBe(validLog.userId.toString());
      expect(log.action).toBe(validLog.action);
      expect(log.resource).toBe(validLog.resource);
      expect(log.resourceId).toBe(validLog.resourceId);
      expect(log.ipAddress).toBe(validLog.ipAddress);
      expect(log.userAgent).toBe(validLog.userAgent);
    });

    it('should require userId', async () => {
      const invalidLog = {
        action: 'create-achievement',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await expect(AdminAuditLog.create(invalidLog)).rejects.toThrow();
    });

    it('should require action', async () => {
      const invalidLog = {
        userId: new mongoose.Types.ObjectId(),
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await expect(AdminAuditLog.create(invalidLog)).rejects.toThrow();
    });

    it('should require resource', async () => {
      const invalidLog = {
        userId: new mongoose.Types.ObjectId(),
        action: 'create-achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await expect(AdminAuditLog.create(invalidLog)).rejects.toThrow();
    });

    it('should validate action enum', async () => {
      const invalidLog = {
        userId: new mongoose.Types.ObjectId(),
        action: 'invalid-action',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await expect(AdminAuditLog.create(invalidLog)).rejects.toThrow();
    });

    it('should validate resource enum', async () => {
      const invalidLog = {
        userId: new mongoose.Types.ObjectId(),
        action: 'create-achievement',
        resource: 'invalid-resource',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await expect(AdminAuditLog.create(invalidLog)).rejects.toThrow();
    });
  });

  describe('TTL Index', () => {
    it('should have TTL index on timestamp field', () => {
      const indexes = AdminAuditLog.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].timestamp && idx[1].expires
      );
      
      expect(ttlIndex).toBeDefined();
      expect(ttlIndex[1].expires).toBe(7776000); // 90 days in seconds
    });
  });

  describe('Compound Indexes', () => {
    it('should have compound index on userId and action', () => {
      const indexes = AdminAuditLog.schema.indexes();
      const compoundIndex = indexes.find(idx => 
        idx[0].userId === 1 && idx[0].action === 1
      );
      
      expect(compoundIndex).toBeDefined();
    });

    it('should have index on timestamp', () => {
      const indexes = AdminAuditLog.schema.indexes();
      const timestampIndex = indexes.find(idx => 
        idx[0].timestamp === 1 && !idx[1].expires
      );
      
      expect(timestampIndex).toBeDefined();
    });
  });

  describe('Changes Field', () => {
    it('should store update changes with before/after', async () => {
      const log = await AdminAuditLog.create({
        userId: new mongoose.Types.ObjectId(),
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

      expect(log.changes).toEqual({
        before: { tier: 'bronze', points: 10 },
        after: { tier: 'silver', points: 25 }
      });
    });

    it('should store bulk operation data', async () => {
      const log = await AdminAuditLog.create({
        userId: new mongoose.Types.ObjectId(),
        action: 'bulk-activate',
        resource: 'achievement',
        resourceId: 'bulk',
        changes: {
          achievementIds: ['first-fast', 'sweet-sixteen', 'century-club'],
          count: 3
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log.changes.achievementIds).toHaveLength(3);
      expect(log.changes.count).toBe(3);
    });

    it('should store CSV import summary', async () => {
      const log = await AdminAuditLog.create({
        userId: new mongoose.Types.ObjectId(),
        action: 'csv-import',
        resource: 'translation',
        changes: {
          rowsProcessed: 50,
          errors: ['Row 12: Invalid language code', 'Row 34: Achievement not found']
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(log.changes.rowsProcessed).toBe(50);
      expect(log.changes.errors).toHaveLength(2);
    });
  });

  describe('Timestamps', () => {
    it('should auto-generate timestamp on creation', async () => {
      const beforeCreate = new Date();
      
      const log = await AdminAuditLog.create({
        userId: new mongoose.Types.ObjectId(),
        action: 'view-list',
        resource: 'achievement',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      const afterCreate = new Date();

      expect(log.timestamp).toBeInstanceOf(Date);
      expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(log.timestamp.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });
});
