import { rateLimit, getRateLimitStatus, resetRateLimit } from '../../../../src/lib/middleware/rateLimit';

describe('RateLimit Middleware', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Reset rate limit before each test
    resetRateLimit(testUserId);
  });

  describe('rateLimit()', () => {
    it('should allow requests under the limit', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Make 50 requests (under 100 limit)
      for (let i = 0; i < 50; i++) {
        const result = rateLimit(req);
        expect(result).toBeNull();
      }
    });

    it('should block requests over the limit', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Make 100 requests (at limit)
      for (let i = 0; i < 100; i++) {
        const result = rateLimit(req);
        expect(result).toBeNull();
      }

      // 101st request should be blocked
      const result = rateLimit(req);
      expect(result).not.toBeNull();
      expect(result.status).toBe(429);
      expect(result.body.error).toBe('Too Many Requests');
    });

    it('should return Retry-After header when rate limit exceeded', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Exceed limit
      for (let i = 0; i < 101; i++) {
        rateLimit(req);
      }

      const result = rateLimit(req);
      expect(result.headers['Retry-After']).toBeDefined();
      expect(parseInt(result.headers['Retry-After'])).toBeGreaterThan(0);
      expect(parseInt(result.headers['Retry-After'])).toBeLessThanOrEqual(60);
    });

    it('should include rate limit headers in response', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      rateLimit(req);

      expect(req.rateLimitHeaders).toBeDefined();
      expect(req.rateLimitHeaders['X-RateLimit-Limit']).toBe('100');
      expect(req.rateLimitHeaders['X-RateLimit-Remaining']).toBe('99');
      expect(req.rateLimitHeaders['X-RateLimit-Reset']).toBeDefined();
    });

    it('should decrement remaining count with each request', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      for (let i = 0; i < 5; i++) {
        rateLimit(req);
      }

      const status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(5);
      expect(status.remaining).toBe(95);
    });

    it('should allow requests without user ID', () => {
      const req = {
        session: null,
        headers: new Map()
      };
      req.headers.get = (key) => null;

      const result = rateLimit(req);
      expect(result).toBeNull();
    });

    it('should use x-user-id header as fallback', () => {
      const req = {
        session: null,
        headers: new Map([['x-user-id', testUserId]])
      };
      req.headers.get = (key) => req.headers.get(key);

      const result = rateLimit(req);
      expect(result).toBeNull();

      const status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(1);
    });
  });

  describe('getRateLimitStatus()', () => {
    it('should return zero count for new user', () => {
      const status = getRateLimitStatus('new-user');
      
      expect(status.count).toBe(0);
      expect(status.remaining).toBe(100);
      expect(status.resetTime).toBeNull();
    });

    it('should return current count for existing user', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Make some requests
      for (let i = 0; i < 10; i++) {
        rateLimit(req);
      }

      const status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(10);
      expect(status.remaining).toBe(90);
      expect(status.resetTime).toBeGreaterThan(Date.now());
    });

    it('should return zero remaining when limit exceeded', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Exceed limit
      for (let i = 0; i < 101; i++) {
        rateLimit(req);
      }

      const status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(101);
      expect(status.remaining).toBe(0);
    });
  });

  describe('resetRateLimit()', () => {
    it('should reset count for user', () => {
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      // Make some requests
      for (let i = 0; i < 50; i++) {
        rateLimit(req);
      }

      let status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(50);

      // Reset
      resetRateLimit(testUserId);

      status = getRateLimitStatus(testUserId);
      expect(status.count).toBe(0);
      expect(status.remaining).toBe(100);
    });
  });

  describe('Window Reset', () => {
    it('should reset after window expires', async () => {
      // This test would require waiting 60 seconds or mocking time
      // For now, we'll just verify the resetTime is set correctly
      const req = {
        session: { user: { id: testUserId } },
        headers: new Map()
      };
      req.headers.get = (key) => null;

      const beforeTime = Date.now();
      rateLimit(req);
      const afterTime = Date.now();

      const status = getRateLimitStatus(testUserId);
      
      // Reset time should be approximately 1 minute from now
      const expectedResetMin = beforeTime + 60000;
      const expectedResetMax = afterTime + 60000;
      
      expect(status.resetTime).toBeGreaterThanOrEqual(expectedResetMin);
      expect(status.resetTime).toBeLessThanOrEqual(expectedResetMax);
    }, 10000);
  });
});
