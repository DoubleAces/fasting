/**
 * Navbar Component (Organism)
 * 
 * Public navigation bar with logo, navigation links, and auth buttons.
 * Responsive with mobile hamburger menu.
 * 
 * Features:
 * - Logo linking to homepage
 * - Navigation links with active state
 * - Sign Up / Log In buttons
 * - Mobile hamburger menu
 * - Smooth transitions
 */

'use client';

import { useState } from 'react';
import Logo from '@/components/atoms/Logo';
import NavLink from '@/components/molecules/NavLink';
import Link from '@/components/atoms/Link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        </div>

        {/* Desktop Auth Buttons */}
        <div className={styles.authButtons}>
          <Link href="/login" variant="text">
            Log In
          </Link>
          <Link href="/register" variant="primary">
            Sign Up
          </Link>
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
          </div>
          <div className={styles.mobileAuthButtons}>
            <Link href="/login" variant="secondary">
              Log In
            </Link>
            <Link href="/register" variant="primary">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
