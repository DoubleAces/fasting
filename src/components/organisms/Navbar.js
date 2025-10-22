/**
 * Navbar Component - Apple-Inspired Design
 * Modern navigation with glassmorphism, gradient logo, and smooth animations
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/faq', label: 'FAQ' },
  ];

  const authLinks = session
    ? [
        { href: '/entries', label: 'My Entries' },
        { href: '/settings', label: 'Settings' },
      ]
    : [
        { href: '/login', label: 'Login' },
        { href: '/register', label: 'Get Started' },
      ];

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-lg bg-white/80 transition-shadow duration-300 ${
        scrolled ? 'shadow-soft-lg' : 'shadow-soft'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent hidden sm:block">
              Fasting Tracker
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-6 w-px bg-gray-200 mx-2" />

            {status === 'loading' ? (
              <div className="w-20 h-9 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-primary-50 text-primary-700'
                        : link.label === 'Get Started'
                        ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white hover:shadow-soft-lg hover:scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {session?.user?.isAdmin && (
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-200 flex items-center gap-2"
                    title="Admin Dashboard"
                  >
                    <span className="text-xs font-bold px-1.5 py-0.5 bg-purple-600 text-white rounded">ADMIN</span>
                    <span>Dashboard</span>
                  </Link>
                )}

                {session && (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-200 my-2" />

            {status === 'loading' ? (
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-primary-50 text-primary-700'
                        : link.label === 'Get Started'
                        ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white text-center'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {session?.user?.isAdmin && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 rounded-xl text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 bg-purple-600 text-white rounded">ADMIN</span>
                      <span>Dashboard</span>
                    </span>
                  </Link>
                )}

                {session && (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
