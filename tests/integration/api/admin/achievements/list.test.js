import mongoose from 'mongoose';
import { GET } from '../../../../../src/app/api/admin/achievements/route';
import Achievement from '../../../../../src/lib/models/Achievement';
import UserAchievement from '../../../../../src/lib/models/UserAchievement';
import AdminAuditLog from '../../../../../src/lib/models/AdminAuditLog';

describe('GET /api/admin/achievements - List', () => {
  let testAdminId;
  let testUserId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fasting-test');
    }
    testAdminId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test achievements
    await Achievement.create([
      {
        achievementId: 'first-fast',
        category: 'getting-started',
        type: 'automatic',
        tier: 'bronze',
        isActive: true,
        createdBy: testAdminId,
        rarity: { score: 10 },
        criteria: { type: 'duration-milestone', value: 1 },
        translations: {
          en: { name: 'First Fast', description: 'Complete your first fast', iconUrl: '⏱️' }
        }
      },
      {
        achievementId: 'sweet-sixteen',
        category: 'duration',
        type: 'automatic',
        tier: 'silver',
        isActive: true,
        createdBy: testAdminId,
        rarity: { score: 25 },
        criteria: { type: 'duration-milestone', value: 16 },
        translations: {
          en: { name: 'Sweet Sixteen', description: '16-hour fast', iconUrl: '🎯' }
        }
      },
      {
        achievementId: 'draft-achievement',
        category: 'streak',
        type: 'automatic',
        tier: 'bronze',
        isActive: false,
        createdBy: testAdminId,
        rarity: { score: 15 },
        criteria: { type: 'streak', value: 7 },
        translations: {
          en: { name: 'Draft Achievement', description: 'Test draft', iconUrl: '📝' }
        }
      }
    ]);

    // Create some user achievements for unlock counts
    await UserAchievement.create([
      { userId: testUserId, achievementId: 'first-fast', unlockedAt: new Date() },
      { userId: new mongoose.Types.ObjectId(), achievementId: 'first-fast', unlockedAt: new Date() }
    ]);
  });

  afterEach(async () => {
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    await AdminAuditLog.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    it('should require admin authentication', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = null;

      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testUserId, isAdmin: false } };

      const response = await GET(req);
      expect(response.status).toBe(403);
    });
  });

  describe('Pagination', () => {
    it('should return paginated results with default page size 20', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.achievements).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should respect custom page and limit parameters', async () => {
      const req = new Request('http://localhost/api/admin/achievements?page=2&limit=2', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.achievements.length).toBeLessThanOrEqual(2);
    });

    it('should calculate total pages correctly', async () => {
      const req = new Request('http://localhost/api/admin/achievements?limit=2', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.pagination.totalPages).toBe(Math.ceil(data.pagination.total / 2));
    });
  });

  describe('Search Functionality', () => {
    it('should search by achievement name', async () => {
      const req = new Request('http://localhost/api/admin/achievements?search=First', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.length).toBeGreaterThanOrEqual(1);
      expect(data.achievements[0].translations.en.name).toContain('First');
    });

    it('should search by description', async () => {
      const req = new Request('http://localhost/api/admin/achievements?search=16-hour', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.length).toBeGreaterThanOrEqual(1);
      expect(data.achievements[0].achievementId).toBe('sweet-sixteen');
    });

    it('should return empty array for no matches', async () => {
      const req = new Request('http://localhost/api/admin/achievements?search=nonexistent', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Filters', () => {
    it('should filter by status (active)', async () => {
      const req = new Request('http://localhost/api/admin/achievements?status=active', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.every(a => a.isActive === true)).toBe(true);
    });

    it('should filter by status (inactive)', async () => {
      const req = new Request('http://localhost/api/admin/achievements?status=inactive', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.every(a => a.isActive === false)).toBe(true);
      expect(data.achievements.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by category', async () => {
      const req = new Request('http://localhost/api/admin/achievements?category=duration', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.every(a => a.category === 'duration')).toBe(true);
    });

    it('should filter by tier', async () => {
      const req = new Request('http://localhost/api/admin/achievements?tier=silver', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.every(a => a.tier === 'silver')).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const req = new Request('http://localhost/api/admin/achievements?status=active&tier=bronze', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data.achievements.every(a => a.isActive && a.tier === 'bronze')).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('should sort by name ascending', async () => {
      const req = new Request('http://localhost/api/admin/achievements?sortBy=name&sortOrder=asc', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      const names = data.achievements.map(a => a.translations.en.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should sort by createdAt descending (default)', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      const dates = data.achievements.map(a => new Date(a.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('Unlock Statistics', () => {
    it('should include unlock count for each achievement', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      const firstFast = data.achievements.find(a => a.achievementId === 'first-fast');
      expect(firstFast.unlockCount).toBe(2);
    });

    it('should show zero unlock count for unearned achievements', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      const draftAch = data.achievements.find(a => a.achievementId === 'draft-achievement');
      expect(draftAch.unlockCount).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting after 100 requests', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await GET(req);
      }

      // 101st request should be rate limited
      const response = await GET(req);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toBe('Too Many Requests');
    });
  });

  describe('Audit Logging', () => {
    it('should log view-list action', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([
        ['x-forwarded-for', '192.168.1.1'],
        ['user-agent', 'Test Browser']
      ]);
      req.headers.get = (key) => {
        if (key === 'x-forwarded-for') return '192.168.1.1';
        if (key === 'user-agent') return 'Test Browser';
        return null;
      };

      await GET(req);

      const logs = await AdminAuditLog.find({ action: 'view-list' });
      expect(logs.length).toBeGreaterThanOrEqual(1);

      const latestLog = logs[logs.length - 1];
      expect(latestLog.userId.toString()).toBe(testAdminId.toString());
      expect(latestLog.resource).toBe('achievement');
      expect(latestLog.ipAddress).toBe('192.168.1.1');
      expect(latestLog.userAgent).toBe('Test Browser');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      const req = new Request('http://localhost/api/admin/achievements', {
        method: 'GET'
      });
      req.session = { user: { id: testAdminId, isAdmin: true } };
      req.headers = new Map([['x-forwarded-for', '192.168.1.1']]);
      req.headers.get = (key) => req.headers.get(key) || 'Test Agent';

      const response = await GET(req);
      const data = await response.json();

      expect(data).toHaveProperty('achievements');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');

      if (data.achievements.length > 0) {
        const achievement = data.achievements[0];
        expect(achievement).toHaveProperty('achievementId');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('tier');
        expect(achievement).toHaveProperty('isActive');
        expect(achievement).toHaveProperty('unlockCount');
        expect(achievement).toHaveProperty('translations');
      }
    });
  });
});
