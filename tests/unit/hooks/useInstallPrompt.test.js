/**
 * Unit tests for useInstallPrompt hook
 * Tests PWA install prompt functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

describe('useInstallPrompt', () => {
  let mockPromptEvent;
  let eventListeners;

  beforeEach(() => {
    // Mock event listeners
    eventListeners = {};
    window.addEventListener = jest.fn((event, handler) => {
      eventListeners[event] = handler;
    });
    window.removeEventListener = jest.fn((event) => {
      delete eventListeners[event];
    });

    // Mock beforeinstallprompt event
    mockPromptEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    // Clear console logs
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with isInstallable false', () => {
      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isInstallable).toBe(false);
      expect(result.current.outcome).toBe(null);
      expect(typeof result.current.install).toBe('function');
    });

    it('should register beforeinstallprompt event listener', () => {
      renderHook(() => useInstallPrompt());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
    });

    it('should register appinstalled event listener', () => {
      renderHook(() => useInstallPrompt());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      );
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useInstallPrompt());

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      );
    });
  });

  describe('beforeinstallprompt event', () => {
    it('should set isInstallable to true when event fires', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });
    });

    it('should prevent default behavior of event', () => {
      renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      expect(mockPromptEvent.preventDefault).toHaveBeenCalled();
    });

    it('should log availability message', () => {
      renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      expect(console.log).toHaveBeenCalledWith(
        '✓ PWA install prompt available'
      );
    });
  });

  describe('install function', () => {
    it('should return "unavailable" if prompt not available', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      let outcome;
      await act(async () => {
        outcome = await result.current.install();
      });

      expect(outcome).toBe('unavailable');
      expect(console.warn).toHaveBeenCalledWith('Install prompt not available');
    });

    it('should show native install prompt when available', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      await act(async () => {
        await result.current.install();
      });

      expect(mockPromptEvent.prompt).toHaveBeenCalled();
    });

    it('should return "accepted" when user accepts', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      let outcome;
      await act(async () => {
        outcome = await result.current.install();
      });

      expect(outcome).toBe('accepted');
      expect(result.current.outcome).toBe('accepted');
    });

    it('should return "dismissed" when user dismisses', async () => {
      const dismissedPrompt = {
        ...mockPromptEvent,
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(dismissedPrompt);
      });

      let outcome;
      await act(async () => {
        outcome = await result.current.install();
      });

      expect(outcome).toBe('dismissed');
      expect(result.current.outcome).toBe('dismissed');
    });

    it('should set isInstallable to false after accepted', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      await act(async () => {
        await result.current.install();
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(false);
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Install failed');
      const errorPrompt = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.reject(error),
      };

      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(errorPrompt);
      });

      let outcome;
      await act(async () => {
        outcome = await result.current.install();
      });

      expect(outcome).toBe('error');
      expect(console.error).toHaveBeenCalledWith(
        'Install prompt error:',
        error
      );
    });

    it('should log user choice', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      await act(async () => {
        await result.current.install();
      });

      expect(console.log).toHaveBeenCalledWith('Install prompt accepted');
    });
  });

  describe('appinstalled event', () => {
    it('should set isInstallable to false when app installed', () => {
      const { result } = renderHook(() => useInstallPrompt());

      // First make it installable
      act(() => {
        eventListeners.beforeinstallprompt(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      // Then trigger install
      act(() => {
        eventListeners.appinstalled();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('should set outcome to "accepted"', () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.appinstalled();
      });

      expect(result.current.outcome).toBe('accepted');
    });

    it('should log success message', () => {
      renderHook(() => useInstallPrompt());

      act(() => {
        eventListeners.appinstalled();
      });

      expect(console.log).toHaveBeenCalledWith('✓ PWA installed successfully');
    });
  });
});
