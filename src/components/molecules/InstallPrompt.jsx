'use client';

import { useState, useEffect } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export default function InstallPrompt() {
  const { isInstallable, install } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);
  const [engagementTime, setEngagementTime] = useState(0);
  const [pageViews, setPageViews] = useState(0);

  // Track engagement and page views (FR-006)
  useEffect(() => {
    // Track engagement time
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setEngagementTime(elapsed);
    }, 1000);

    // Track page views
    const views = parseInt(sessionStorage.getItem('pageViews') || '0') + 1;
    sessionStorage.setItem('pageViews', views.toString());
    setPageViews(views);

    return () => clearInterval(timer);
  }, []);

  // Show prompt after 30s engagement OR 2+ page views (FR-006)
  useEffect(() => {
    if (isInstallable && !showPrompt) {
      const shouldShow = engagementTime >= 30000 || pageViews >= 2;
      if (shouldShow) {
        setShowPrompt(true);
        console.log('✓ Install prompt criteria met');
      }
    }
  }, [isInstallable, engagementTime, pageViews, showPrompt]);

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't render if not installable or already dismissed
  if (!isInstallable || !showPrompt) {
    return null;
  }

  // Don't show if dismissed this session
  if (sessionStorage.getItem('installPromptDismissed') === 'true') {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border-2 border-purple-600 rounded-lg shadow-2xl p-4 z-50 animate-slide-up"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3
            id="install-prompt-title"
            className="text-lg font-semibold text-gray-900 mb-1"
          >
            Install Fasting Tracker
          </h3>
          <p
            id="install-prompt-description"
            className="text-sm text-gray-600 mb-3"
          >
            Install our app for quick access and offline tracking
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Install app"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Dismiss install prompt"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
