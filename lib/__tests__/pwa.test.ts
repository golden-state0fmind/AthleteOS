/**
 * Tests for PWA Utilities Module
 */

import { detectPlatform, isInstalled, isInstallable } from '../pwa';

describe('PWA Utilities', () => {
  describe('detectPlatform', () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });

    it('should return "desktop" when window is undefined (SSR)', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('desktop');
    });

    it('should detect iOS platform from iPhone user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iOS platform from iPad user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('ios');
    });

    it('should detect iOS platform from iPod user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('android');
    });

    it('should return "desktop" for non-mobile user agents', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('desktop');
    });

    it('should handle case-insensitive user agent matching', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (IPHONE; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('ios');
    });
  });

  describe('isInstalled', () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });

    it('should return false when window is undefined (SSR)', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(isInstalled()).toBe(false);
    });

    it('should return true when iOS standalone mode is active', () => {
      Object.defineProperty(global.navigator, 'standalone', {
        value: true,
        writable: true,
        configurable: true,
      });

      expect(isInstalled()).toBe(true);
    });

    it('should return false when iOS standalone mode is not active', () => {
      Object.defineProperty(global.navigator, 'standalone', {
        value: false,
        writable: true,
        configurable: true,
      });

      // Mock matchMedia to return false
      Object.defineProperty(global.window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: false }),
        writable: true,
        configurable: true,
      });

      expect(isInstalled()).toBe(false);
    });

    it('should return true when display-mode is standalone', () => {
      // Remove standalone property
      const nav = { ...global.navigator };
      delete (nav as any).standalone;
      Object.defineProperty(global, 'navigator', {
        value: nav,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global.window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: true }),
        writable: true,
        configurable: true,
      });

      expect(isInstalled()).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
    });

    it('should return false when display-mode is not standalone', () => {
      // Remove standalone property
      const nav = { ...global.navigator };
      delete (nav as any).standalone;
      Object.defineProperty(global, 'navigator', {
        value: nav,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global.window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: false }),
        writable: true,
        configurable: true,
      });

      expect(isInstalled()).toBe(false);
    });
  });

  describe('isInstallable', () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;

    beforeEach(() => {
      // Reset to default state
      Object.defineProperty(global.navigator, 'standalone', {
        value: false,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global.window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: false }),
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });

    it('should return false when app is already installed', () => {
      Object.defineProperty(global.navigator, 'standalone', {
        value: true,
        writable: true,
        configurable: true,
      });

      expect(isInstallable()).toBe(false);
    });

    it('should return false on iOS (not installable via prompt)', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });

      expect(isInstallable()).toBe(false);
    });

    it('should return true on Android when not installed', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
        writable: true,
        configurable: true,
      });

      expect(isInstallable()).toBe(true);
    });

    it('should return true on desktop when not installed', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
        writable: true,
        configurable: true,
      });

      expect(isInstallable()).toBe(true);
    });
  });
});
