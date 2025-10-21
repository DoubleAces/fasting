/**
 * TermsPageClient Component
 * 
 * Client-side wrapper for terms page to handle anchor scrolling on page load.
 * Scrolls to the section specified in URL hash (e.g., /terms#health-disclaimer)
 */

'use client';

import { useEffect } from 'react';

export default function TermsPageClient({ children }) {
  useEffect(() => {
    // Check if URL has a hash on initial load
    const hash = window.location.hash;
    
    if (hash) {
      // Remove the # from the hash
      const id = hash.substring(1);
      
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return <>{children}</>;
}
