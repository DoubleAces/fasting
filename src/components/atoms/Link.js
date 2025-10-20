/**
 * Link Component
 * 
 * Styled wrapper around Next.js Link component with consistent styling and variants.
 * Provides primary, secondary, and text link styles throughout the application.
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, text)
 * - Hover and focus states
 * - External link support with target and rel attributes
 * - Disabled state
 * - Full accessibility support
 * 
 * @component
 * @example
 * // Primary button-style link
 * <Link href="/register" variant="primary">Sign Up</Link>
 * 
 * @example
 * // Secondary button-style link
 * <Link href="/login" variant="secondary">Log In</Link>
 * 
 * @example
 * // Text-style link (default)
 * <Link href="/faq">Learn More</Link>
 * 
 * @example
 * // External link
 * <Link href="https://example.com" external>External Site</Link>
 */

import NextLink from 'next/link';
import styles from './Link.module.css';

/**
 * Link component
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - Link destination URL
 * @param {'primary' | 'secondary' | 'text'} [props.variant='text'] - Visual style variant
 * @param {boolean} [props.external=false] - If true, opens in new tab with noopener noreferrer
 * @param {boolean} [props.disabled=false] - If true, link is disabled (not clickable)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Link content
 * @param {Object} [props.rest] - Other props passed to Next.js Link
 * @returns {JSX.Element} Link component
 */
export default function Link({
  href,
  variant = 'text',
  external = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const variantClass = styles[variant] || styles.text;
  const disabledClass = disabled ? styles.disabled : '';
  const linkClasses = `${styles.link} ${variantClass} ${disabledClass} ${className}`.trim();

  // External link attributes
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  // Disabled link behavior
  if (disabled) {
    return (
      <span 
        className={linkClasses}
        aria-disabled="true"
        role="link"
      >
        {children}
      </span>
    );
  }

  return (
    <NextLink
      href={href}
      className={linkClasses}
      {...externalProps}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
