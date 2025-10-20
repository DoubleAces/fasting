/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (register, login, forgot-password, reset-password).
 * Provides centered, card-based design optimized for form completion.
 * 
 * Features:
 * - Clean, distraction-free environment
 * - Centered layout with max-width constraints
 * - Responsive design
 * - Light background with card elevation
 * - No navigation to minimize distractions during auth flow
 */

// Metadata for authentication pages
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}
