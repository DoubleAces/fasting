import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/admin/achievements/translations/import/route';
import { getServerSession } from 'next-auth';
import csvService from '@/lib/services/csvService';
import csvValidator from '@/lib/utils/csvValidator';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/services/csvService');
jest.mock('@/lib/utils/csvValidator');
jest.mock('@/lib/db');

describe('POST /api/admin/achievements/translations/import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const { req } = createMocks({ method: 'POST' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 when user is not admin', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'user@test.com', isAdmin: false }
      });

      const { req } = createMocks({ method: 'POST' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });
  });

  describe('File Upload', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 400 when no file is provided', async () => {
      const formData = new FormData();
      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 when file is not a CSV', async () => {
      const formData = new FormData();
      const file = new File(['content'], 'file.txt', { type: 'text/plain' });
      formData.append('file', file);

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File must be a CSV file');
    });

    it('should accept CSV file', async () => {
      const csvContent = 'achievementId,language,name,description\nfirst-fast,en,First Fast,Complete your first fast';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: {} });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 1,
        processedCount: 1,
        updatedCount: 1,
        errorCount: 0,
        errors: [],
        achievementsAffected: ['first-fast']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe('CSV Validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 400 when file size exceeds 5MB', async () => {
      const csvContent = 'achievementId,language,name,description\n';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({
        success: false,
        errors: ['File size exceeds 5MB limit'],
        stats: { fileSize: 6 * 1024 * 1024 }
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CSV validation failed');
      expect(data.validationErrors).toContain('File size exceeds 5MB limit');
    });

    it('should return 400 when row count exceeds 500', async () => {
      const csvContent = 'achievementId,language,name,description\n';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({
        success: false,
        errors: ['Row count exceeds 500 limit'],
        stats: { totalRows: 501 }
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CSV validation failed');
      expect(data.validationErrors).toContain('Row count exceeds 500 limit');
    });

    it('should return 400 when required columns are missing', async () => {
      const csvContent = 'achievementId,name\nfirst-fast,First Fast';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({
        success: false,
        errors: ['Missing required column: language', 'Missing required column: description'],
        stats: {}
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.validationErrors).toContain('Missing required column: language');
      expect(data.validationErrors).toContain('Missing required column: description');
    });
  });

  describe('CSV Import', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 200 when all rows import successfully', async () => {
      const csvContent = 'achievementId,language,name,description\nfirst-fast,es,Primer Ayuno,Completa tu primer ayuno';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: { totalRows: 1 } });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 1,
        processedCount: 1,
        updatedCount: 1,
        errorCount: 0,
        errors: [],
        achievementsAffected: ['first-fast']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data', 'x-forwarded-for': '192.168.1.1' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.updatedCount).toBe(1);
      expect(data.errorCount).toBe(0);
      expect(data.message).toContain('Successfully imported 1 translation');
    });

    it('should return 207 when some rows have errors', async () => {
      const csvContent = `achievementId,language,name,description
first-fast,es,Primer Ayuno,Completa tu primer ayuno
invalid-id,es,Test,Test description
week-warrior,fr,Guerrier de la Semaine,Jeûnez pendant 7 jours`;
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: { totalRows: 3 } });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 3,
        processedCount: 3,
        updatedCount: 2,
        errorCount: 1,
        errors: [{ row: 2, error: 'Achievement not found: invalid-id' }],
        achievementsAffected: ['first-fast', 'week-warrior']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(207); // Multi-Status
      expect(data.success).toBe(true);
      expect(data.updatedCount).toBe(2);
      expect(data.errorCount).toBe(1);
      expect(data.errors).toHaveLength(1);
      expect(data.message).toContain('Imported 2 translations with 1 error');
    });

    it('should call csvService.importTranslations with correct parameters', async () => {
      const csvContent = 'achievementId,language,name,description\nfirst-fast,es,Primer Ayuno,Completa tu primer ayuno';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: {} });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 1,
        processedCount: 1,
        updatedCount: 1,
        errorCount: 0,
        errors: [],
        achievementsAffected: ['first-fast']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0'
        }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      await POST(req);

      expect(csvService.importTranslations).toHaveBeenCalledWith(
        csvContent,
        'admin123',
        '192.168.1.1',
        'Mozilla/5.0'
      );
    });

    it('should include import summary in response', async () => {
      const csvContent = 'achievementId,language,name,description\nfirst-fast,es,Primer Ayuno,Completa tu primer ayuno';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: {} });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 1,
        processedCount: 1,
        updatedCount: 1,
        errorCount: 0,
        errors: [],
        achievementsAffected: ['first-fast']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(data).toHaveProperty('totalRows', 1);
      expect(data).toHaveProperty('processedCount', 1);
      expect(data).toHaveProperty('updatedCount', 1);
      expect(data).toHaveProperty('errorCount', 0);
      expect(data).toHaveProperty('achievementsAffected');
      expect(data.achievementsAffected).toContain('first-fast');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 500 when csvService.importTranslations throws error', async () => {
      const csvContent = 'achievementId,language,name,description\nfirst-fast,es,Primer Ayuno,Test';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: {} });
      csvService.importTranslations.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Connection failed'));

      const csvContent = 'achievementId,language,name,description\n';
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Language Validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should accept valid language codes (en, es, fr, de, ar)', async () => {
      const csvContent = `achievementId,language,name,description
first-fast,en,First Fast,Test
first-fast,es,Primer Ayuno,Test
first-fast,fr,Premier Jeûne,Test
first-fast,de,Erstes Fasten,Test
first-fast,ar,أول صيام,Test`;
      const file = new File([csvContent], 'translations.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      csvValidator.validate.mockReturnValue({ success: true, errors: [], stats: {} });
      csvService.importTranslations.mockResolvedValue({
        success: true,
        totalRows: 5,
        processedCount: 5,
        updatedCount: 5,
        errorCount: 0,
        errors: [],
        achievementsAffected: ['first-fast']
      });

      const { req } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' }
      });
      req.formData = jest.fn().mockResolvedValue(formData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.errorCount).toBe(0);
    });
  });
});
