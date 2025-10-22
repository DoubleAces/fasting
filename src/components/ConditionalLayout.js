/**
 * ConditionalLayout Component
 * 
 * Conditionally renders Navbar/Footer based on the current route.
 * Hides them for admin routes (/dashboard).
 */

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './organisms/Navbar';
import Footer from './organisms/Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/dashboard');

  if (isAdminRoute) {
    // Admin routes - no navbar/footer, full height
    return (
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    );
  }

  // Public routes - with navbar/footer
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
