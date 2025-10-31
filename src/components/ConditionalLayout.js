/**
 * ConditionalLayout Component
 * 
 * Conditionally renders Navbar/Footer based on the current route.
 * Hides them for admin routes (/admin).
 */

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './organisms/Navbar';
import Footer from './organisms/Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes - no navbar/footer, full height
    // Feature 022: Mobile UX - Compact padding on mobile
    return (
      <main className="p-3 md:p-4" style={{ minHeight: '100vh' }}>
        {children}
      </main>
    );
  }

  // Public routes - with navbar/footer
  // Feature 022: Mobile UX - Compact padding on mobile
  return (
    <>
      <Navbar />
      <main className="p-3 md:p-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
