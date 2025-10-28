/**
 * Unit Tests: Performance Measurement Utilities
 * 
 * Tests for client-side performance measurement functions.
 * TDD Approach: Write tests first, see them fail, then implement.
 */

import { 
  measureClickToNavigation, 
  observeWebVitals, 
  getNavigationTiming 
} from '@/lib/utils/performanceMeasurement';

describe('performanceMeasurement', () => {
  beforeEach(() => {
    // Mock Performance API with proper mark tracking
    const marks = new Map();
    
    global.performance = {
      now: jest.fn(() => 1000),
      mark: jest.fn((name) => {
        marks.set(name, performance.now());
      }),
      measure: jest.fn((measureName, startMark, endMark) => {
        // Simulate real measure behavior
        return { 
          name: measureName,
          duration: 42.5,
          startTime: 1000,
          entryType: 'measure'
        };
      }),
      getEntriesByType: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    };

    // Mock PerformanceObserver
    global.PerformanceObserver = undefined;
    
    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('measureClickToNavigation', () => {
    it('should measure click-to-navigation duration', () => {
      const entryId = '507f1f77bcf86cd799439012';
      const metric = measureClickToNavigation(entryId);
      
      expect(metric).toEqual({
        metricName: 'click-to-navigation',
        entryId: '507f1f77bcf86cd799439012',
        duration: 42.5,
        timestamp: expect.any(Number),
        phase: 'client'
      });

      // Verify performance marks were created
      expect(global.performance.mark).toHaveBeenCalledWith(
        expect.stringContaining('entry-click-end')
      );
    });

    it('should use custom start mark if provided', () => {
      const entryId = '507f1f77bcf86cd799439012';
      const customMark = 'custom-start-mark';
      
      const metric = measureClickToNavigation(entryId, customMark);
      
      expect(metric).toBeDefined();
      expect(metric.entryId).toBe(entryId);
      expect(global.performance.measure).toHaveBeenCalledWith(
        expect.any(String),
        customMark,
        expect.any(String)
      );
    });

    it('should throw error if entryId is missing', () => {
      expect(() => measureClickToNavigation()).toThrow('entryId is required');
      expect(() => measureClickToNavigation('')).toThrow('entryId is required');
      expect(() => measureClickToNavigation(null)).toThrow('entryId is required');
    });

    it('should return null if Performance API not supported', () => {
      global.performance = undefined;
      
      const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
      
      expect(metric).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Performance API not supported')
      );
    });

    it('should return null if performance.mark not available', () => {
      global.performance = { now: jest.fn(() => 1000) };
      
      const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
      
      expect(metric).toBeNull();
    });

    it('should return null if performance.measure not available', () => {
      global.performance = { 
        now: jest.fn(() => 1000),
        mark: jest.fn()
      };
      
      const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
      
      expect(metric).toBeNull();
    });

    it('should handle measurement errors gracefully', () => {
      global.performance.mark = jest.fn(); // Mark works
      global.performance.measure = jest.fn(() => {
        throw new Error('Measurement failed');
      });
      
      const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
      
      expect(metric).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error measuring'),
        expect.any(Error)
      );
    });

    it('should include timestamp in Unix milliseconds', () => {
      const beforeTime = Date.now();
      const metric = measureClickToNavigation('507f1f77bcf86cd799439012');
      const afterTime = Date.now();
      
      expect(metric.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(metric.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('observeWebVitals', () => {
    it('should call callback with Web Vital data', (done) => {
      // Mock PerformanceObserver
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      global.PerformanceObserver = jest.fn((callback) => {
        // Simulate LCP entry after short delay
        setTimeout(() => {
          callback({
            getEntries: () => [
              { 
                name: 'largest-contentful-paint', 
                value: 450,
                renderTime: 450,
                entryType: 'largest-contentful-paint'
              }
            ]
          });
        }, 10);
        
        return mockObserver;
      });

      const vitals = [];
      observeWebVitals((vital) => {
        vitals.push(vital);
        
        expect(vital.name).toBe('largest-contentful-paint');
        expect(vital.value).toBe(450);
        expect(vital.rating).toBe('good');
        
        done();
      });

      expect(mockObserver.observe).toHaveBeenCalled();
    });

    it('should rate LCP as poor if > 2500ms', (done) => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      global.PerformanceObserver = jest.fn((callback) => {
        setTimeout(() => {
          callback({
            getEntries: () => [
              { name: 'largest-contentful-paint', value: 3000 }
            ]
          });
        }, 10);
        return mockObserver;
      });

      observeWebVitals((vital) => {
        expect(vital.rating).toBe('poor');
        done();
      });
    });

    it('should not throw if PerformanceObserver not supported', () => {
      global.PerformanceObserver = undefined;
      
      expect(() => observeWebVitals(() => {})).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('PerformanceObserver not supported')
      );
    });

    it('should handle callback errors gracefully', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      global.PerformanceObserver = jest.fn((callback) => {
        setTimeout(() => {
          callback({
            getEntries: () => [
              { name: 'largest-contentful-paint', value: 450 }
            ]
          });
        }, 10);
        return mockObserver;
      });

      const errorCallback = () => {
        throw new Error('Callback error');
      };

      // Should not throw - errors are caught internally
      expect(() => observeWebVitals(errorCallback)).not.toThrow();
    });

    it('should observe multiple vital types', (done) => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      let observerCount = 0;
      global.PerformanceObserver = jest.fn((callback) => {
        observerCount++;
        return mockObserver;
      });

      observeWebVitals(() => {});

      // Wait for all observers to be created
      setTimeout(() => {
        // Should create 3 observers: LCP, FCP, FID
        expect(observerCount).toBe(3);
        done();
      }, 50);
    });
  });

  describe('getNavigationTiming', () => {
    it('should return navigation timing breakdown', () => {
      global.performance.getEntriesByType = jest.fn((type) => {
        if (type === 'navigation') {
          return [{
            responseEnd: 150,
            domContentLoadedEventEnd: 300,
            loadEventEnd: 500,
            transferSize: 12345,
            nextHopProtocol: 'h2'
          }];
        }
        return [];
      });

      const timing = getNavigationTiming();
      
      expect(timing).toEqual({
        serverResponseTime: 150,
        domContentLoaded: 300,
        loadComplete: 500,
        transferSize: 12345,
        protocol: 'h2'
      });
    });

    it('should return null if Navigation Timing not supported', () => {
      global.performance.getEntriesByType = jest.fn(() => []);
      
      const timing = getNavigationTiming();
      
      expect(timing).toBeNull();
    });

    it('should return null if performance.getEntriesByType not available', () => {
      global.performance = { 
        now: jest.fn(() => 1000)
        // getEntriesByType intentionally missing
      };
      
      const timing = getNavigationTiming();
      
      expect(timing).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Navigation Timing API not supported')
      );
    });    it('should return null if Performance API not available', () => {
      global.performance = undefined;
      
      const timing = getNavigationTiming();
      
      expect(timing).toBeNull();
    });

    it('should handle missing navigation entry gracefully', () => {
      global.performance.getEntriesByType = jest.fn(() => []);
      
      const timing = getNavigationTiming();
      
      expect(timing).toBeNull();
    });
  });
});
