/**
 * Footer Component (Organism)
 * 
 * Site footer with logo, navigation links, and copyright.
 * Responsive layout for mobile and desktop.
 * 
 * Features:
 * - Logo and tagline
 * - Navigation links (Features, FAQ, Privacy, Terms)
 * - Copyright notice with current year
 * - Responsive grid layout
 * - Accessible footer landmark
 */

import Logo from '@/components/atoms/Logo';
import Link from '@/components/atoms/Link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Logo and Tagline Section */}
        <div className={styles.brandSection}>
          <Logo size="medium" noLink={false} />
          <p className={styles.tagline}>
            Track your fasting journey with ease and achieve your health goals.
          </p>
        </div>

        {/* Navigation Links Section */}
        <div className={styles.linksSection}>
          <div className={styles.linkColumn}>
            <h3 className={styles.linkHeading}>Product</h3>
            <nav className={styles.linkList} aria-label="Product links">
              <Link href="/features" variant="text" className={styles.footerLink}>
                Features
              </Link>
              <Link href="/faq" variant="text" className={styles.footerLink}>
                FAQ
              </Link>
            </nav>
          </div>

          <div className={styles.linkColumn}>
            <h3 className={styles.linkHeading}>Legal</h3>
            <nav className={styles.linkList} aria-label="Legal links">
              <Link href="/privacy" variant="text" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link href="/terms" variant="text" className={styles.footerLink}>
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright Section */}
        <div className={styles.copyrightSection}>
          <p className={styles.copyright}>
            © {currentYear} Fasting Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
