'use client';

import { useFormContext } from 'react-hook-form';

/**
 * MetadataStep Component
 * 
 * Third step of achievement form - handles category, tier, points, and order
 * 
 * @returns {JSX.Element} Metadata step form fields
 */
export default function MetadataStep() {
  const { register, watch, formState: { errors } } = useFormContext();

  const selectedTier = watch('tier');
  const selectedCategory = watch('category');

  const categories = [
    { value: 'getting-started', label: 'Getting Started', description: 'First time user milestones', icon: '🚀' },
    { value: 'duration', label: 'Duration', description: 'Fasting duration achievements', icon: '⏱️' },
    { value: 'streak', label: 'Streak', description: 'Consistency and streaks', icon: '🔥' },
    { value: 'goal', label: 'Goal', description: 'Goal completion milestones', icon: '🎯' },
    { value: 'weight', label: 'Weight', description: 'Weight loss achievements', icon: '⚖️' },
    { value: 'consistency', label: 'Consistency', description: 'Regular fasting habits', icon: '📊' },
    { value: 'special', label: 'Special', description: 'Limited time events', icon: '🎉' },
    { value: 'knowledge', label: 'Knowledge', description: 'Educational milestones', icon: '📚' }
  ];

  const tiers = [
    { value: 'bronze', label: 'Bronze', bgClass: 'bg-orange-100', textClass: 'text-orange-900', borderClass: 'border-orange-500', points: 10, description: 'Easy to unlock', icon: '🥉' },
    { value: 'silver', label: 'Silver', bgClass: 'bg-gray-100', textClass: 'text-gray-900', borderClass: 'border-gray-500', points: 25, description: 'Moderate difficulty', icon: '🥈' },
    { value: 'gold', label: 'Gold', bgClass: 'bg-yellow-100', textClass: 'text-yellow-900', borderClass: 'border-yellow-500', points: 50, description: 'Challenging', icon: '🥇' },
    { value: 'platinum', label: 'Platinum', bgClass: 'bg-cyan-100', textClass: 'text-cyan-900', borderClass: 'border-cyan-500', points: 100, description: 'Very difficult', icon: '💎' },
    { value: 'diamond', label: 'Diamond', bgClass: 'bg-purple-100', textClass: 'text-purple-900', borderClass: 'border-purple-500', points: 200, description: 'Extremely rare', icon: '👑' }
  ];

  const selectedTierData = tiers.find(t => t.value === selectedTier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Achievement Metadata</h2>
        <p className="mt-2 text-sm text-gray-600">
          Categorize and configure the achievement's attributes
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
          Category
          <span className="ml-1 text-red-500">*</span>
        </label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label} - {cat.description}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.category.message}
          </p>
        )}
        {selectedCategory && (
          <p className="mt-1.5 text-xs text-gray-500">
            {categories.find(c => c.value === selectedCategory)?.icon} Selected: {categories.find(c => c.value === selectedCategory)?.description}
          </p>
        )}
      </div>

      {/* Tier */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Tier
          <span className="ml-1 text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {tiers.map((tier) => (
            <label
              key={tier.value}
              className={`
                relative flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedTier === tier.value 
                  ? `${tier.borderClass} ${tier.bgClass} shadow-sm` 
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                }
              `}
            >
              <div className="flex items-center flex-1">
                <input
                  type="radio"
                  value={tier.value}
                  {...register('tier', { required: 'Tier is required' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tier.icon}</span>
                    <span className={`block text-sm font-semibold ${selectedTier === tier.value ? tier.textClass : 'text-gray-900'}`}>
                      {tier.label}
                    </span>
                  </div>
                  <span className="block text-sm text-gray-600 mt-1">{tier.description}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${selectedTier === tier.value ? tier.textClass : 'text-gray-700'}`}>
                  {tier.points} pts
                </span>
                {selectedTier === tier.value && (
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
        {errors.tier && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.tier.message}
          </p>
        )}
      </div>

      {/* Points (Rarity Score) */}
      <div className="space-y-2">
        <label htmlFor="rarity.score" className="block text-sm font-semibold text-gray-900">
          Points (Rarity Score)
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          id="rarity.score"
          type="number"
          min="1"
          max="1000"
          {...register('rarity.score', {
            required: 'Points are required',
            min: { value: 1, message: 'Points must be at least 1' },
            max: { value: 1000, message: 'Points cannot exceed 1000' },
            valueAsNumber: true
          })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
          placeholder={selectedTierData ? `Default: ${selectedTierData.points}` : 'Enter points'}
        />
        {errors.rarity?.score && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.rarity.score.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Higher points indicate rarer achievements. {selectedTierData && `${selectedTierData.icon} ${selectedTierData.label} tier default: ${selectedTierData.points} points`}
        </p>
      </div>

      {/* Display Order */}
      <div className="space-y-2">
        <label htmlFor="order" className="block text-sm font-semibold text-gray-900">
          Display Order
        </label>
        <input
          id="order"
          type="number"
          min="0"
          {...register('order', {
            min: { value: 0, message: 'Order must be 0 or greater' },
            valueAsNumber: true
          })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
          placeholder="999"
        />
        {errors.order && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.order.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Lower numbers appear first in lists. Leave blank to sort alphabetically (default: 999).
        </p>
      </div>
    </div>
  );
}
