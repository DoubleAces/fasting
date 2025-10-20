/**
 * NavLink Component
 * 
 * Navigation link with active state detection for use in navigation menus.
 * Automatically highlights when the current route matches the link's href.
 * 
 * Features:
 * - Active state detection using Next.js usePathname
 * - Exact match or starts-with matching
 * - Custom active styling
 * - Accessible with aria-current
 * - Smooth hover transitions
 * 
 * @component
 * @example
 * // Basic navigation link (exact match)
 * <NavLink href="/about">About</NavLink>
 * 
 * @example
 * // Starts-with matching for nested routes
 * <NavLink href="/blog" exact={false}>Blog</NavLink>
 * 
 * @example
 * // Custom className
 * <NavLink href="/contact" className="custom-nav">Contact</NavLink>
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './NavLink.module.css';

/**
 * NavLink component
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - Link destination URL
 * @param {boolean} [props.exact=true] - If true, matches pathname exactly. If false, matches if pathname starts with href
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Link content
 * @param {Object} [props.rest] - Other props passed to Next.js Link
 * @returns {JSX.Element} NavLink component
 */
export default function NavLink({
  href,
  exact = true,
  className = '',
  children,
  ...rest
}) {
  const pathname = usePathname();
  
  // Determine if this link is active
  const isActive = exact 
    ? pathname === href
    : pathname.startsWith(href);

  const activeClass = isActive ? styles.active : '';
  const navLinkClasses = `${styles.navLink} ${activeClass} ${className}`.trim();

  // Add aria-current for accessibility when link is active
  const ariaCurrent = isActive ? 'page' : undefined;

  return (
    <Link
      href={href}
      className={navLinkClasses}
      aria-current={ariaCurrent}
      {...rest}
    >
      {children}
    </Link>
  );
}
