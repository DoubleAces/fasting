import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/admin/achievements/translations/export/route';
import { getServerSession } from 'next-auth';
import csvService from '@/lib/services/csvService';
import auditLogService from '@/lib/services/auditLogService';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/services/csvService');
jest.mock('@/lib/services/auditLogService');
jest.mock('@/lib/db');

describe('GET /api/admin/achievements/translations/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
    auditLogService.log.mockResolvedValue(true);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 when user is not admin', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'user@test.com', isAdmin: false }
      });

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should proceed when user is admin', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\nfirst-fast,en,First Fast');

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      expect(response.status).toBe(200);
    });
  });

  describe('CSV Export', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return CSV content with correct headers', async () => {
      const csvContent = 'achievementId,language,name,description,iconUrl,category,tier,isActive\nfirst-fast,en,First Fast,Complete your first fast,/icons/first.svg,Milestones,bronze,true';
      csvService.exportTranslations.mockResolvedValue(csvContent);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/csv');
      expect(response.headers.get('content-disposition')).toContain('attachment');
      expect(response.headers.get('content-disposition')).toContain('.csv');
      
      const body = await response.text();
      expect(body).toBe(csvContent);
    });

    it('should call csvService.exportTranslations', async () => {
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\n');

      const { req } = createMocks({ method: 'GET' });
      await GET(req);

      expect(csvService.exportTranslations).toHaveBeenCalled();
    });

    it('should include timestamp in filename', async () => {
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\n');

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      const contentDisposition = response.headers.get('content-disposition');
      expect(contentDisposition).toMatch(/achievement-translations-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv/);
    });

    it('should set Cache-Control to no-cache', async () => {
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\n');

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      expect(response.headers.get('cache-control')).toBe('no-cache');
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should log csv-export action to audit log', async () => {
      const csvContent = 'achievementId,language,name\nfirst-fast,en,First Fast\nweek-warrior,en,Week Warrior';
      csvService.exportTranslations.mockResolvedValue(csvContent);

      const { req } = createMocks({
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0'
        }
      });

      await GET(req);

      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'admin123',
        action: 'csv-export',
        resource: 'achievement',
        changes: { rowCount: 2 }, // 3 lines total - 1 header = 2 data rows
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should handle missing IP and user agent in audit log', async () => {
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\n');

      const { req } = createMocks({ method: 'GET' });
      await GET(req);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: 'unknown',
          userAgent: 'unknown'
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should include rate limit headers in response', async () => {
      csvService.exportTranslations.mockResolvedValue('achievementId,language,name\n');

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      // Rate limit headers should be present
      expect(response.headers.has('x-ratelimit-limit') || response.headers.has('X-RateLimit-Limit')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 500 when csvService.exportTranslations throws error', async () => {
      csvService.exportTranslations.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 when connectDB fails', async () => {
      connectDB.mockRejectedValue(new Error('Connection failed'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('CSV Format Validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should export all required columns', async () => {
      const csvContent = 'achievementId,language,name,description,iconUrl,category,tier,isActive\nfirst-fast,en,First Fast,Complete your first fast,/icons/first.svg,Milestones,bronze,true';
      csvService.exportTranslations.mockResolvedValue(csvContent);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const body = await response.text();

      const headers = body.split('\n')[0].split(',');
      expect(headers).toContain('achievementId');
      expect(headers).toContain('language');
      expect(headers).toContain('name');
      expect(headers).toContain('description');
      expect(headers).toContain('iconUrl');
      expect(headers).toContain('category');
      expect(headers).toContain('tier');
      expect(headers).toContain('isActive');
    });

    it('should export data for all 5 languages per achievement', async () => {
      const csvContent = `achievementId,language,name,description,iconUrl,category,tier,isActive
first-fast,en,First Fast,Complete your first fast,/icons/first.svg,Milestones,bronze,true
first-fast,es,Primer Ayuno,Completa tu primer ayuno,/icons/first.svg,Milestones,bronze,true
first-fast,fr,Premier Jeûne,Complétez votre premier jeûne,/icons/first.svg,Milestones,bronze,true
first-fast,de,Erstes Fasten,Vollenden Sie Ihr erstes Fasten,/icons/first.svg,Milestones,bronze,true
first-fast,ar,أول صيام,أكمل صيامك الأول,/icons/first.svg,Milestones,bronze,true`;
      csvService.exportTranslations.mockResolvedValue(csvContent);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const body = await response.text();

      const lines = body.split('\n');
      expect(lines.length).toBe(6); // 1 header + 5 language rows

      const languages = lines.slice(1).map(line => line.split(',')[1]);
      expect(languages).toEqual(['en', 'es', 'fr', 'de', 'ar']);
    });
  });
});
