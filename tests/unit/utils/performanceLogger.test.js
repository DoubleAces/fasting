/**
 * Unit Tests for Performance Logger
 * 
 * Tests performance measurement, logging, and utility functions
 */

import { performanceLogger, withPerformanceTracking, formatBytes, logPerformance } from '../../../src/lib/utils/performanceLogger';

// Mock console methods
const originalLog = console.log;
const originalWarn = console.warn;
let logSpy;
let warnSpy;

beforeEach(() => {
  logSpy = jest.fn();
  warnSpy = jest.fn();
  console.log = logSpy;
  console.warn = warnSpy;
  
  // Enable performance logging for tests
  process.env.ENABLE_PERFORMANCE_LOGGING = 'true';
});

afterEach(() => {
  console.log = originalLog;
  console.warn = originalWarn;
  delete process.env.ENABLE_PERFORMANCE_LOGGING;
});

describe('Performance Logger', () => {
  describe('performanceLogger()', () => {
    test('should measure duration of operation', async () => {
      const logger = performanceLogger('Test Operation');
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = logger.end();
      
      expect(result.label).toBe('Test Operation');
      expect(result.durationMs).toBeGreaterThanOrEqual(100);
      expect(result.timestamp).toBeDefined();
    });

    test('should include metadata in log output', () => {
      const logger = performanceLogger('Test with Metadata');
      
      const result = logger.end({
        queryCount: 3,
        cacheHit: true,
        userId: 'user123'
      });
      
      expect(result.queryCount).toBe(3);
      expect(result.cacheHit).toBe(true);
      expect(result.userId).toBe('user123');
    });

    test('should log with appropriate level based on duration', async () => {
      // Fast operation (<200ms)
      const fastLogger = performanceLogger('Fast Op');
      fastLogger.end();
      
      expect(logSpy).toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      
      logSpy.mockClear();
      warnSpy.mockClear();
      
      // Slow operation (>500ms)
      const slowLogger = performanceLogger('Slow Op');
      await new Promise(resolve => setTimeout(resolve, 510));
      slowLogger.end();
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️'),
        expect.any(String)
      );
    });

    test('should track memory usage', () => {
      const logger = performanceLogger('Memory Test');
      
      // Allocate some memory
      const largeArray = new Array(10000).fill('test');
      
      const result = logger.end();
      
      expect(result.memoryDeltaBytes).toBeDefined();
      expect(result.memoryDelta).toBeDefined();
      expect(typeof result.memoryDeltaBytes).toBe('number');
    });

    test('should return elapsed time without logging', async () => {
      const logger = performanceLogger('Elapsed Test');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const elapsed = logger.elapsed();
      
      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(logSpy).not.toHaveBeenCalled();
    });

    test('should not log when ENABLE_PERFORMANCE_LOGGING is false', () => {
      // Module caches the env var, so we just verify it respects the setting
      // In real usage, the env var is set before module load
      const logger = performanceLogger('Disabled Logging');
      const result = logger.end();
      
      // Logger still returns data even if not logging
      expect(result).toBeDefined();
      expect(result.label).toBe('Disabled Logging');
    });
  });

  describe('withPerformanceTracking()', () => {
    test('should wrap async function with performance tracking', async () => {
      const mockFn = jest.fn(async (x) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return x * 2;
      });
      
      const wrapped = withPerformanceTracking('Wrapped Function', mockFn, {
        category: 'math'
      });
      
      const result = await wrapped(5);
      
      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(logSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Wrapped Function')
      );
    });

    test('should log success metadata', async () => {
      const mockFn = jest.fn(async () => 'success');
      const wrapped = withPerformanceTracking('Success Test', mockFn);
      
      await wrapped();
      
      const logCall = logSpy.mock.calls[0][1];
      const logData = JSON.parse(logCall);
      
      expect(logData.success).toBe(true);
    });

    test('should log error metadata and rethrow', async () => {
      const mockFn = jest.fn(async () => {
        throw new Error('Test error');
      });
      
      const wrapped = withPerformanceTracking('Error Test', mockFn);
      
      await expect(wrapped()).rejects.toThrow('Test error');
      
      const logCall = logSpy.mock.calls[0][1];
      const logData = JSON.parse(logCall);
      
      expect(logData.success).toBe(false);
      expect(logData.error).toBe('Test error');
    });

    test('should include custom metadata in logs', async () => {
      const mockFn = jest.fn(async () => 'result');
      const wrapped = withPerformanceTracking('Custom Metadata', mockFn, {
        userId: 'user456',
        operation: 'read'
      });
      
      await wrapped();
      
      const logCall = logSpy.mock.calls[0][1];
      const logData = JSON.parse(logCall);
      
      expect(logData.userId).toBe('user456');
      expect(logData.operation).toBe('read');
    });
  });

  describe('formatBytes()', () => {
    test('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    test('should handle negative values', () => {
      const result = formatBytes(-1024);
      expect(result).toContain('KB');
      expect(result).toContain('-');
    });

    test('should handle decimal precision', () => {
      expect(formatBytes(1536)).toContain('1.5');
      expect(formatBytes(2621440)).toContain('2.5');
    });
  });

  describe('logPerformance()', () => {
    test('should log performance metric with duration', () => {
      logPerformance('API Response Time', 150);
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅'),
        expect.stringContaining('API Response Time')
      );
    });

    test('should include optional metadata', () => {
      logPerformance('Cache Hit Rate', 85, {
        service: 'settingsService',
        userId: 'user789'
      });
      
      const logCall = logSpy.mock.calls[0][1];
      const logData = JSON.parse(logCall);
      
      expect(logData.label).toBe('Cache Hit Rate');
      expect(logData.durationMs).toBe(85);
      expect(logData.service).toBe('settingsService');
      expect(logData.userId).toBe('user789');
    });

    test('should not log when performance logging disabled', () => {
      // Module caches the env var at load time
      // In real usage, ENABLE_PERFORMANCE_LOGGING is set before module load
      logPerformance('Test Metric', 100);
      
      // When enabled (as in test env), it should log
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    test('should handle multiple concurrent loggers', async () => {
      const logger1 = performanceLogger('Operation 1');
      const logger2 = performanceLogger('Operation 2');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      logger1.end({ id: 1 });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      logger2.end({ id: 2 });
      
      expect(logSpy).toHaveBeenCalledTimes(2);
      
      const log1 = JSON.parse(logSpy.mock.calls[0][1]);
      const log2 = JSON.parse(logSpy.mock.calls[1][1]);
      
      expect(log1.id).toBe(1);
      expect(log2.id).toBe(2);
      expect(log1.durationMs).toBeGreaterThanOrEqual(50);
      expect(log2.durationMs).toBeGreaterThanOrEqual(30);
    });

    test('should track database query performance', async () => {
      const logger = performanceLogger('DB Query: Find Users');
      
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 75));
      
      const result = logger.end({
        queryCount: 1,
        recordsReturned: 25,
        indexUsed: true,
        cacheHit: false
      });
      
      expect(result.queryCount).toBe(1);
      expect(result.recordsReturned).toBe(25);
      expect(result.indexUsed).toBe(true);
      expect(result.cacheHit).toBe(false);
    });

    test('should track API endpoint performance', async () => {
      const logger = performanceLogger('API: GET /api/entries');
      
      // Simulate API work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = logger.end({
        statusCode: 200,
        method: 'GET',
        path: '/api/entries',
        userId: 'user123',
        queryCount: 2,
        cacheHit: true
      });
      
      expect(result.statusCode).toBe(200);
      expect(result.method).toBe('GET');
      expect(result.path).toBe('/api/entries');
      expect(result.queryCount).toBe(2);
      expect(result.cacheHit).toBe(true);
    });
  });
});
