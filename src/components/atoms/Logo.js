/**
 * Logo Component
 * 
 * Displays the Fasting Tracker application logo with consistent branding.
 * Can be used in navbar, footer, and other branding contexts.
 * 
 * Features:
 * - Configurable size (small, medium, large)
 * - Text-based logo with optional icon
 * - Accessible with proper alt text
 * - Responsive sizing
 * - Link to homepage by default
 * 
 * @component
 * @example
 * // Default medium size with link
 * <Logo />
 * 
 * @example
 * // Large size without link
 * <Logo size="large" noLink />
 * 
 * @example
 * // Small size in footer
 * <Logo size="small" />
 */

import Link from 'next/link';
import styles from './Logo.module.css';

/**
 * Logo component
 * 
 * @param {Object} props - Component props
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Logo size variant
 * @param {boolean} [props.noLink=false] - If true, renders logo without link wrapper
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Logo component
 */
export default function Logo({ 
  size = 'medium', 
  noLink = false,
  className = ''
}) {
  const sizeClass = styles[size] || styles.medium;
  const logoClasses = `${styles.logo} ${sizeClass} ${className}`.trim();

  const logoContent = (
    <div className={logoClasses}>
      <span className={styles.icon} aria-hidden="true">
        🍽️
      </span>
      <span className={styles.text}>
        Fasting Tracker
      </span>
    </div>
  );

  // Return without link wrapper if noLink is true
  if (noLink) {
    return logoContent;
  }

  // Default: wrap in link to homepage
  return (
    <Link 
      href="/" 
      className={styles.logoLink}
      aria-label="Fasting Tracker - Go to homepage"
    >
      {logoContent}
    </Link>
  );
}
