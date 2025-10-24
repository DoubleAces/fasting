/**
 * Unit tests for useSyncQueue hook
 * Tests offline sync queue management
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { getSyncQueueStats, processSyncQueue } from '@/lib/pwa/syncQueue';

// Mock the sync queue functions
jest.mock('@/lib/pwa/syncQueue', () => ({
  getSyncQueueStats: jest.fn(),
  processSyncQueue: jest.fn(),
}));

describe('useSyncQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mocks
    getSyncQueueStats.mockResolvedValue({ queueLength: 0, syncing: false });
    processSyncQueue.mockResolvedValue({ synced: 0, failed: 0 });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock console
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useSyncQueue());

      expect(result.current.syncing).toBe(false);
      expect(result.current.queueLength).toBe(0);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.triggerSync).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should fetch queue length on mount', async () => {
      getSyncQueueStats.mockResolvedValue({ queueLength: 5, syncing: false });

      const { result } = renderHook(() => useSyncQueue());

      await waitFor(() => {
        expect(result.current.queueLength).toBe(5);
      });

      expect(getSyncQueueStats).toHaveBeenCalled();
    });

    it('should setup auto-refresh interval', async () => {
      getSyncQueueStats.mockResolvedValue({ queueLength: 3, syncing: false });

      renderHook(() => useSyncQueue());

      // Fast-forward 10 seconds
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(getSyncQueueStats).toHaveBeenCalledTimes(2); // Initial + 1 interval
      });
    });

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useSyncQueue());

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('triggerSync', () => {
    it('should set syncing state to true during sync', async () => {
      let resolveSync;
      processSyncQueue.mockReturnValue(
        new Promise((resolve) => {
          resolveSync = resolve;
        })
      );

      const { result } = renderHook(() => useSyncQueue());

      act(() => {
        result.current.triggerSync();
      });

      expect(result.current.syncing).toBe(true);

      await act(async () => {
        resolveSync({ synced: 2, failed: 0 });
      });

      await waitFor(() => {
        expect(result.current.syncing).toBe(false);
      });
    });

    it('should call processSyncQueue', async () => {
      const { result } = renderHook(() => useSyncQueue());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(processSyncQueue).toHaveBeenCalled();
    });

    it('should update queue length after sync', async () => {
      getSyncQueueStats
        .mockResolvedValueOnce({ queueLength: 3, syncing: false })
        .mockResolvedValueOnce({ queueLength: 1, syncing: false });
      processSyncQueue.mockResolvedValue({ synced: 2, failed: 0 });

      const { result } = renderHook(() => useSyncQueue());

      await waitFor(() => {
        expect(result.current.queueLength).toBe(3);
      });

      await act(async () => {
        await result.current.triggerSync();
      });

      await waitFor(() => {
        expect(result.current.queueLength).toBe(1);
      });
    });

    it('should not trigger sync if already syncing', async () => {
      let resolveSync;
      processSyncQueue.mockReturnValue(
        new Promise((resolve) => {
          resolveSync = resolve;
        })
      );

      const { result } = renderHook(() => useSyncQueue());

      act(() => {
        result.current.triggerSync();
        result.current.triggerSync(); // Second call should be ignored
      });

      expect(processSyncQueue).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveSync({ synced: 0, failed: 0 });
      });
    });

    it('should handle sync errors', async () => {
      const syncError = new Error('Sync failed');
      processSyncQueue.mockRejectedValue(syncError);

      const { result } = renderHook(() => useSyncQueue());

      await act(async () => {
        await result.current.triggerSync();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.syncing).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('Manual sync failed:', syncError);
    });

    it('should clear error on successful sync', async () => {
      // First sync fails
      processSyncQueue.mockRejectedValueOnce(new Error('First fail'));
      const { result } = renderHook(() => useSyncQueue());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(result.current.error).toBeTruthy();

      // Second sync succeeds
      processSyncQueue.mockResolvedValueOnce({ synced: 1, failed: 0 });

      await act(async () => {
        await result.current.triggerSync();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useSyncQueue());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(processSyncQueue).not.toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('offline');
    });
  });

  describe('refresh', () => {
    it('should update queue length', async () => {
      getSyncQueueStats
        .mockResolvedValueOnce({ queueLength: 0, syncing: false })
        .mockResolvedValueOnce({ queueLength: 5, syncing: false });

      const { result } = renderHook(() => useSyncQueue());

      await waitFor(() => {
        expect(result.current.queueLength).toBe(0);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.queueLength).toBe(5);
      });
    });

    it('should handle refresh errors gracefully', async () => {
      getSyncQueueStats
        .mockResolvedValueOnce({ queueLength: 2, syncing: false })
        .mockRejectedValueOnce(new Error('DB error'));

      const { result } = renderHook(() => useSyncQueue());

      await waitFor(() => {
        expect(result.current.queueLength).toBe(2);
      });

      await act(async () => {
        await result.current.refresh();
      });

      // Queue length should remain unchanged on error
      expect(result.current.queueLength).toBe(2);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('auto-refresh', () => {
    it('should refresh queue length every 10 seconds', async () => {
      getSyncQueueStats
        .mockResolvedValueOnce({ queueLength: 0, syncing: false })
        .mockResolvedValueOnce({ queueLength: 1, syncing: false })
        .mockResolvedValueOnce({ queueLength: 2, syncing: false })
        .mockResolvedValueOnce({ queueLength: 3, syncing: false });

      const { result } = renderHook(() => useSyncQueue());

      await waitFor(() => {
        expect(result.current.queueLength).toBe(0);
      });

      // Advance 10 seconds
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.queueLength).toBe(1);
      });

      // Advance another 10 seconds
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.queueLength).toBe(2);
      });
    });

    it('should not refresh while syncing', async () => {
      let resolveSync;
      processSyncQueue.mockReturnValue(
        new Promise((resolve) => {
          resolveSync = resolve;
        })
      );

      renderHook(() => useSyncQueue());

      // Start syncing
      act(() => {
        jest.advanceTimersByTime(0);
      });

      const initialCallCount = getSyncQueueStats.mock.calls.length;

      // Advance time while syncing
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      // Should not have refreshed during sync
      expect(getSyncQueueStats).toHaveBeenCalledTimes(initialCallCount);

      // Complete sync
      await act(async () => {
        resolveSync({ synced: 0, failed: 0 });
      });
    });
  });
});

