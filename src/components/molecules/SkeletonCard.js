/**
 * SkeletonCard Component
 * 
 * Glassmorphic skeleton loading card for dashboard sections.
 * Shows animated placeholder while data is loading.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.height='h-32'] - Height class (e.g., 'h-32', 'h-64')
 * @returns {JSX.Element} Animated skeleton card
 */

export default function SkeletonCard({ className = '', height = 'h-32' }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/80 backdrop-blur-xl
        border border-white/50
        shadow-lg
        ${height}
        ${className}
      `}
      role="status"
      aria-label="Loading content"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-pulse">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-purple-100/30 to-transparent" />
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Content placeholder */}
      <div className="relative z-10 p-6 space-y-3">
        <div className="h-4 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded w-1/4 animate-pulse" />
        <div className="h-8 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded w-3/4 animate-pulse delay-75" />
        <div className="h-3 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded w-1/2 animate-pulse delay-150" />
      </div>
    </div>
  );
}
