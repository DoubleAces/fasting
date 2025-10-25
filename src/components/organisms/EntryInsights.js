/**
 * EntryInsights Component
 * 
 * Displays personalized insights about a fasting entry by comparing it to
 * the user's historical patterns and averages.
 */

import InsightCard from '@/components/molecules/InsightCard';
import Badge from '@/components/atoms/Badge';

export default function EntryInsights({ insights }) {
  if (!insights) {
    return (
      <div className="text-center py-8 text-gray-500">
        No insights available for this entry.
      </div>
    );
  }

  const {
    isLongestThisMonth,
    rank,
    totalEntries,
    averageDuration,
    comparisonToAverage,
    typicalBreakfastTime,
    contributesToStreak,
    isBestDay,
  } = insights;

  // Check if we have insufficient data (<7 entries)
  const hasInsufficientData = !averageDuration;

  // Helper: Format duration in minutes to "Xh Ym"
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Helper: Format comparison with + or -
  const formatComparison = (minutes) => {
    if (!minutes) return null;
    const prefix = minutes > 0 ? '+' : '-';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    
    if (hours === 0) {
      return `${prefix}${mins}m vs average`;
    }
    if (mins === 0) {
      return `${prefix}${hours}h vs average`;
    }
    return `${prefix}${hours}h ${mins}m vs average`;
  };

  // Helper: Format time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return 'N/A';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper: Calculate percentile
  const calculatePercentile = (rank, total) => {
    if (!rank || !total) return null;
    const percentile = Math.round((rank / total) * 100);
    return `Top ${percentile}%`;
  };

  const comparisonVariant = comparisonToAverage > 0 ? 'positive' : comparisonToAverage < 0 ? 'negative' : 'neutral';
  const comparisonText = formatComparison(comparisonToAverage);
  const percentile = calculatePercentile(rank, totalEntries);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Insights & Patterns
        </h2>
        
        {/* Best Day Badge */}
        {isBestDay && (
          <Badge variant="best-day">Best Day</Badge>
        )}
      </div>

      {/* Insufficient Data Message */}
      {hasInsufficientData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">Need more data for meaningful insights</p>
          <p className="mt-1">
            Create at least 7 entries over 30 days to see personalized insights about your fasting patterns.
          </p>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Historical Rank */}
        {rank && totalEntries && (
          <InsightCard
            icon="🏆"
            label="Historical Rank"
            value={`#${rank} of ${totalEntries}`}
            comparison={percentile || undefined}
            variant="neutral"
          />
        )}

        {/* Longest This Month */}
        {isLongestThisMonth && (
          <InsightCard
            icon="🌟"
            label="Achievement"
            value="Longest fast this month!"
            variant="positive"
          />
        )}

        {/* Average Duration Comparison */}
        {!hasInsufficientData && (
          <InsightCard
            icon="⏱️"
            label="Average Duration"
            value={formatDuration(averageDuration)}
            comparison={comparisonText || undefined}
            variant={comparisonVariant}
          />
        )}

        {/* Typical Breakfast Time */}
        {typicalBreakfastTime && (
          <InsightCard
            icon="🍳"
            label="Typical Breakfast Time"
            value={formatTime(typicalBreakfastTime)}
            comparison="Based on last 30 days"
            variant="neutral"
          />
        )}

        {/* Streak Contribution */}
        {contributesToStreak && (
          <InsightCard
            icon="🔥"
            label="Streak Status"
            value="Contributes to current streak"
            variant="positive"
          />
        )}
      </div>
    </section>
  );
}
