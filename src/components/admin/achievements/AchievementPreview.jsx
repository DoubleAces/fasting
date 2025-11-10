'use client';

import { useFormContext } from 'react-hook-form';

/**
 * AchievementPreview Component
 * 
 * Real-time preview of achievement as admin fills the form
 * Shows how the achievement will appear to users
 * Can work with form context OR external data prop
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.data] - Achievement data (when not using form context)
 * @returns {JSX.Element} Achievement preview card
 */
export default function AchievementPreview({ data = null }) {
  // Try to get form context, but don't fail if it doesn't exist
  let formContext = null;
  try {
    formContext = useFormContext();
  } catch (e) {
    // No form context available, will use data prop instead
  }

  // Use form context if available, otherwise use data prop
  const name = data?.name || formContext?.watch('name') || 'Untitled Achievement';
  const description = data?.description || formContext?.watch('description') || 'No description provided';
  const icon = data?.iconUrl || formContext?.watch('iconUrl') || '🏆';
  const category = data?.category || formContext?.watch('category');
  const tier = data?.tier || formContext?.watch('tier');
  const rarity = data?.rarity || formContext?.watch('rarity');
  const isActive = data?.isActive ?? formContext?.watch('isActive');
  const isSecret = data?.isSecret ?? formContext?.watch('isSecret');
  const criteria = data?.criteria || formContext?.watch('criteria');

  // Tier color mapping
  const tierColors = {
    bronze: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    silver: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    platinum: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
    diamond: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
  };

  const tierColor = tierColors[tier] || tierColors.bronze;

  // Format criteria for display
  const getCriteriaText = () => {
    if (!criteria?.type) return 'No criteria set';
    
    const typeLabels = {
      'duration-milestone': 'Complete a fast of',
      'streak-days': 'Maintain a streak for',
      'total-fasts': 'Complete',
      'weight-loss': 'Lose',
      'goal-completion': 'Reach your goal',
      'special': 'Special event',
      'custom': 'Custom criteria'
    };

    const typeLabel = typeLabels[criteria.type] || criteria.type;
    const value = criteria.value || 0;
    
    switch (criteria.type) {
      case 'duration-milestone':
        return `${typeLabel} ${value} hours`;
      case 'streak-days':
        return `${typeLabel} ${value} days`;
      case 'total-fasts':
        return `${typeLabel} ${value} fasting sessions`;
      case 'weight-loss':
        return `${typeLabel} ${value} kg`;
      case 'goal-completion':
        return `${typeLabel} ${value} times`;
      case 'special':
        return 'Special event participation';
      case 'custom':
        return criteria.description || 'Custom unlock criteria';
      default:
        return typeLabel;
    }
  };

  return (
    <div className="sticky top-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Preview Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
          <h3 className="text-sm font-medium text-white">Achievement Preview</h3>
          <p className="text-xs text-purple-100 mt-1">How this will appear to users</p>
        </div>

        {/* Achievement Card */}
        <div className="p-6">
          {/* Status Indicators */}
          <div className="flex gap-2 mb-4">
            {isActive ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
            {isSecret && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🔒 Secret
              </span>
            )}
          </div>

          {/* Achievement Content */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${tierColor.bg} ${tierColor.border} border-2 flex items-center justify-center text-3xl`}>
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {name}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Tier Badge */}
                {tier && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${tierColor.bg} ${tierColor.text}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                )}

                {/* Category Badge */}
                {category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                )}

                {/* Points */}
                {rarity?.score && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    {rarity.score} points
                  </span>
                )}
              </div>

              {/* Criteria */}
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">Unlock Requirement:</p>
                <p className="text-sm text-gray-900">{getCriteriaText()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 This preview updates in real-time as you fill the form
          </p>
        </div>
      </div>
    </div>
  );
}
