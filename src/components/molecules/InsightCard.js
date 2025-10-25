/**
 * InsightCard Component
 * 
 * Displays a single insight with icon, label, value, and optional comparison text.
 * Used within EntryInsights to show personalized fasting insights.
 */

export default function InsightCard({ label, value, comparison, icon, variant = 'neutral' }) {
  const variantStyles = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const comparisonClass = variantStyles[variant] || variantStyles.neutral;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="text-sm font-medium text-gray-700 mb-1">
            {label}
          </div>

          {/* Value */}
          <div className="text-lg font-semibold text-gray-900 break-words">
            {value}
          </div>

          {/* Comparison (optional) */}
          {comparison && (
            <div className={`text-sm mt-1 ${comparisonClass}`}>
              {comparison}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
