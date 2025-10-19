/**
 * Navbar Component (Organism)
 * 
 * Navigation bar that adapts based on authentication status.
 * Shows different links and buttons for authenticated vs unauthenticated users.
 * 
 * Common Links (All Users):
 * - Home, Features, FAQ
 * 
 * Authenticated Only:
 * - My Entries, Settings links
 * - User email/name display
 * - Sign Out button
 * 
 * Unauthenticated Only:
 * - Sign Up, Log In buttons
 * 
 * Features:
 * - Logo linking to homepage
 * - Navigation links with active state
 * - Mobile hamburger menu
 * - Smooth transitions
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Logo from '@/components/atoms/Logo';
import NavLink from '@/components/molecules/NavLink';
import Link from '@/components/atoms/Link';
import LogoutButton from '@/components/atoms/LogoutButton';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoWrapper}>
          <Logo size="medium" />
        </div>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          <NavLink href="/" exact={true}>
            Home
          </NavLink>
          
          <NavLink href="/features" exact={true}>
            Features
          </NavLink>
          
          <NavLink href="/faq" exact={true}>
            FAQ
          </NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink href="/entries" exact={true}>
                My Entries
              </NavLink>
              <NavLink href="/settings" exact={true}>
                Settings
              </NavLink>
            </>
          )}
        </div>

        {/* Desktop Auth Section */}
        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <>
              {session?.user?.email && (
                <span className={styles.userEmail} title={session.user.email}>
                  {session.user.name || session.user.email}
                </span>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" variant="text">
                Log In
              </Link>
              <Link href="/register" variant="primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className={styles.hamburgerIcon}>
            <span className={isMobileMenuOpen ? styles.hamburgerLineOpen : styles.hamburgerLine}></span>
            <span className={isMobileMenuOpen ? styles.hamburgerLineOpen : styles.hamburgerLine}></span>
            <span className={isMobileMenuOpen ? styles.hamburgerLineOpen : styles.hamburgerLine}></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className={styles.mobileMenu}
          role="dialog"
          aria-modal="false"
        >
          <div className={styles.mobileNavLinks} onClick={closeMobileMenu}>
            <NavLink href="/" exact={true}>
              Home
            </NavLink>
            
            <NavLink href="/features" exact={true}>
              Features
            </NavLink>
            
            <NavLink href="/faq" exact={true}>
              FAQ
            </NavLink>
            
            {isAuthenticated && (
              <>
                <NavLink href="/entries" exact={true}>
                  My Entries
                </NavLink>
                <NavLink href="/settings" exact={true}>
                  Settings
                </NavLink>
              </>
            )}
          </div>
          
          <div className={styles.mobileAuthButtons}>
            {isAuthenticated ? (
              <>
                {session?.user?.email && (
                  <div className={styles.mobileUserInfo}>
                    Logged in as: {session.user.name || session.user.email}
                  </div>
                )}
                <LogoutButton className={styles.mobileLogoutButton} />
              </>
            ) : (
              <>
                <Link href="/login" variant="secondary">
                  Log In
                </Link>
                <Link href="/register" variant="primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
