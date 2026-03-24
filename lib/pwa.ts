/**
 * PWA Utilities Module
 * 
 * Provides platform detection, install detection, and PWA install prompt handling.
 */

export type Platform = 'ios' | 'android' | 'desktop';

/**
 * Detects the user's platform based on user agent and browser capabilities.
 * 
 * @returns Platform type: 'ios', 'android', or 'desktop'
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  if (isIOS) {
    return 'ios';
  }

  if (isAndroid) {
    return 'android';
  }

  return 'desktop';
}

/**
 * Checks if the app is currently running in standalone/installed mode.
 * 
 * @returns true if app is installed and running standalone
 */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for iOS standalone mode
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true;
  }

  // Check for display-mode: standalone (Android, Desktop)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  return false;
}

/**
 * Checks if the app can be installed (beforeinstallprompt event available).
 * This only works on Android and Desktop Chrome/Edge.
 * 
 * Note: This function checks if the event has been captured.
 * The actual event must be stored externally.
 * 
 * @returns true if install prompt is available
 */
export function isInstallable(): boolean {
  // This is a placeholder - the actual installability is determined
  // by whether the beforeinstallprompt event has fired.
  // Components should track this state themselves.
  return !isInstalled() && detectPlatform() !== 'ios';
}
