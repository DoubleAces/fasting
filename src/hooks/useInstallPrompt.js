'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * React hook for PWA install prompt
 * @returns {object} Install prompt state and functions
 */
export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const promptRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default install prompt
      e.preventDefault();
      
      // Store the event for later use
      promptRef.current = e;
      setIsInstallable(true);
      
      console.log('✓ PWA install prompt available');
    };

    const handleAppInstalled = () => {
      console.log('✓ PWA installed successfully');
      setIsInstallable(false);
      setOutcome('accepted');
      promptRef.current = null;
    };

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the install prompt
   * @returns {Promise<string>} User choice ('accepted' or 'dismissed')
   */
  const install = async () => {
    if (!promptRef.current) {
      console.warn('Install prompt not available');
      return 'unavailable';
    }

    try {
      // Show the install prompt
      promptRef.current.prompt();

      // Wait for user response
      const { outcome: userChoice } = await promptRef.current.userChoice;
      
      console.log(`Install prompt ${userChoice}`);
      setOutcome(userChoice);
      
      if (userChoice === 'accepted') {
        setIsInstallable(false);
        promptRef.current = null;
      }

      return userChoice;
    } catch (error) {
      console.error('Install prompt error:', error);
      return 'error';
    }
  };

  return {
    isInstallable,
    install,
    outcome,
  };
}
