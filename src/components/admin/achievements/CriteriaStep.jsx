'use client';

import { useFormContext } from 'react-hook-form';

/**
 * CriteriaStep Component
 * 
 * Second step of achievement form - handles unlock criteria
 * 
 * @returns {JSX.Element} Criteria step form fields
 */
export default function CriteriaStep() {
  const { register, watch, formState: { errors } } = useFormContext();

  const criteriaType = watch('criteria.type');
  const customRequirement = watch('criteria.requirement');

  const criteriaTypes = [
    { 
      value: 'duration-milestone', 
      label: 'Duration Milestone', 
      description: 'Complete a fast of X hours',
      icon: '⏱️'
    },
    { 
      value: 'streak-days', 
      label: 'Streak Days', 
      description: 'Maintain a streak for X consecutive days',
      icon: '🔥'
    },
    { 
      value: 'total-fasts', 
      label: 'Total Fasts', 
      description: 'Complete X fasting sessions (lifetime)',
      icon: '📊'
    },
    { 
      value: 'weight-loss', 
      label: 'Weight Loss', 
      description: 'Lose X kg during fasting journey',
      icon: '⚖️'
    },
    { 
      value: 'goal-completion', 
      label: 'Goal Completion', 
      description: 'Reach your fasting goal X times',
      icon: '🎯'
    },
    { 
      value: 'special', 
      label: 'Special Event', 
      description: 'Participate in special challenge or promotion',
      icon: '🎉'
    },
    { 
      value: 'custom', 
      label: 'Custom', 
      description: 'Advanced criteria with predefined logic',
      icon: '⚙️'
    }
  ];

  const customRequirements = [
    // Goal-related
    { value: 'setFirstGoal', label: 'Set First Goal', category: 'Goal-Based' },
    { value: 'completeFirstGoal', label: 'Complete First Goal', category: 'Goal-Based' },
    { value: 'completeThreeGoals', label: 'Complete 3 Goals', category: 'Goal-Based' },
    { value: 'completeFiveGoals', label: 'Complete 5 Goals', category: 'Goal-Based' },
    { value: 'completeTenGoals', label: 'Complete 10 Goals', category: 'Goal-Based' },
    { value: 'completeTwentyfiveGoals', label: 'Complete 25 Goals', category: 'Goal-Based' },
    { value: 'perfectMonthGoals', label: 'Perfect Month (All Goals)', category: 'Goal-Based' },
    { value: 'complete20HourGoal', label: 'Complete 20+ Hour Goal', category: 'Goal-Based' },
    
    // Weight-related
    { value: 'logFirstWeight', label: 'Log First Weight', category: 'Weight-Based' },
    { value: 'lose5Pounds', label: 'Lose 5 Pounds', category: 'Weight-Based' },
    { value: 'lose10Pounds', label: 'Lose 10 Pounds', category: 'Weight-Based' },
    { value: 'lose25Pounds', label: 'Lose 25 Pounds', category: 'Weight-Based' },
    { value: 'lose50Pounds', label: 'Lose 50 Pounds', category: 'Weight-Based' },
    { value: 'lose75Pounds', label: 'Lose 75 Pounds', category: 'Weight-Based' },
    { value: 'lose100Pounds', label: 'Lose 100 Pounds', category: 'Weight-Based' },
    { value: 'reachGoalWeight', label: 'Reach Goal Weight', category: 'Weight-Based' },
    
    // Pattern-based
    { value: 'fastBothWeekendDays', label: 'Fast Both Weekend Days', category: 'Pattern-Based' },
    { value: 'fastAllWeekdays', label: 'Fast All Weekdays', category: 'Pattern-Based' },
    { value: 'fastAllSevenDays', label: 'Fast All 7 Days in Week', category: 'Pattern-Based' },
    { value: 'perfectWeek', label: 'Perfect Week (7 Days)', category: 'Pattern-Based' },
    { value: 'perfectMonth', label: 'Perfect Month', category: 'Pattern-Based' },
    
    // Time-based
    { value: 'tenEarlyStarts', label: '10 Early Starts (Before 6 AM)', category: 'Time-Based' },
    { value: 'tenLateStarts', label: '10 Late Starts (After 10 PM)', category: 'Time-Based' },
    { value: 'startAtMidnight', label: 'Start at Midnight', category: 'Time-Based' },
    { value: 'endAtSunrise', label: 'End at Sunrise (5-7 AM)', category: 'Time-Based' },
    
    // Special
    { value: 'comebackAfter30Days', label: 'Comeback After 30+ Day Break', category: 'Special' },
    { value: 'twoMidnightFast', label: '48+ Hour Fast (Two Midnights)', category: 'Special' },
    { value: 'tenNotesAdded', label: 'Add 10 Notes', category: 'Special' },
    { value: 'firstFast', label: 'Complete First Fast', category: 'Special' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Unlock Criteria</h2>
        <p className="mt-2 text-sm text-gray-600">
          Define the requirements for unlocking this achievement
        </p>
      </div>

      {/* Criteria Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Criteria Type
          <span className="ml-1 text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {criteriaTypes.map((type) => (
            <label 
              key={type.value} 
              className={`
                relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
                ${criteriaType === type.value 
                  ? 'border-purple-500 bg-purple-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                }
              `}
            >
              <input
                type="radio"
                value={type.value}
                {...register('criteria.type', { required: 'Criteria type is required' })}
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 border-gray-300"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="block text-sm font-semibold text-gray-900">{type.label}</span>
                </div>
                <span className="block text-sm text-gray-600 mt-1">{type.description}</span>
              </div>
              {criteriaType === type.value && (
                <div className="absolute top-4 right-4">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.criteria?.type && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.criteria.type.message}
          </p>
        )}
      </div>

      {/* Custom Requirement Selector - Only show for custom type */}
      {criteriaType === 'custom' && (
        <div className="space-y-2">
          <label htmlFor="criteria.requirement" className="block text-sm font-semibold text-gray-900">
            Custom Requirement Type
            <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            id="criteria.requirement"
            {...register('criteria.requirement', { 
              required: criteriaType === 'custom' ? 'Custom requirement is required' : false 
            })}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
          >
            <option value="">Select a custom requirement...</option>
            {Object.entries(
              customRequirements.reduce((acc, req) => {
                if (!acc[req.category]) acc[req.category] = [];
                acc[req.category].push(req);
                return acc;
              }, {})
            ).map(([category, reqs]) => (
              <optgroup key={category} label={category}>
                {reqs.map(req => (
                  <option key={req.value} value={req.value}>
                    {req.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.criteria?.requirement && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.criteria.requirement.message}
            </p>
          )}
          {customRequirement && (
            <p className="mt-1.5 text-xs text-gray-500">
              ✓ Selected: {customRequirements.find(r => r.value === customRequirement)?.label}
            </p>
          )}
        </div>
      )}

      {/* Value Input - conditional based on criteria type (NOT for custom) */}
      {criteriaType && criteriaType !== 'special' && criteriaType !== 'custom' && (
        <div className="space-y-2">
          <label htmlFor="criteria.value" className="block text-sm font-semibold text-gray-900">
            {criteriaType === 'duration-milestone' && 'Duration (hours)'}
            {criteriaType === 'streak-days' && 'Number of days'}
            {criteriaType === 'total-fasts' && 'Number of fasts'}
            {criteriaType === 'weight-loss' && 'Weight loss (kg)'}
            {criteriaType === 'goal-completion' && 'Number of goals'}
            {criteriaType === 'custom' && 'Threshold value'}
            <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            id="criteria.value"
            type="number"
            step={criteriaType === 'weight-loss' ? '0.1' : '1'}
            min="0"
            {...register('criteria.value', {
              required: 'Value is required',
              min: { value: 0, message: 'Value must be positive' },
              valueAsNumber: true
            })}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
            placeholder={
              criteriaType === 'duration-milestone' ? 'e.g., 24' :
              criteriaType === 'streak-days' ? 'e.g., 7' :
              criteriaType === 'total-fasts' ? 'e.g., 10' :
              criteriaType === 'weight-loss' ? 'e.g., 5.0' :
              criteriaType === 'goal-completion' ? 'e.g., 3' :
              'Enter value'
            }
          />
          {errors.criteria?.value && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.criteria.value.message}
            </p>
          )}
          <p className="mt-1.5 text-xs text-gray-500">
            {criteriaType === 'duration-milestone' && 'Hours of continuous fasting required'}
            {criteriaType === 'streak-days' && 'Consecutive days user must maintain streak'}
            {criteriaType === 'total-fasts' && 'Total number of completed fasts (all time)'}
            {criteriaType === 'weight-loss' && 'Kilograms lost during fasting journey'}
            {criteriaType === 'goal-completion' && 'Number of times goal must be reached'}
            {criteriaType === 'custom' && 'Numeric threshold for custom criteria'}
          </p>
        </div>
      )}

      {/* Custom Requirement Info Box */}
      {criteriaType === 'custom' && customRequirement && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Custom Requirement Selected</h3>
              <p className="mt-1 text-sm text-blue-800">
                {customRequirement === 'endAtSunrise' && 'Achievement unlocks when user ends a fast between 5:00 AM and 7:00 AM.'}
                {customRequirement === 'startAtMidnight' && 'Achievement unlocks when user starts a fast exactly at midnight (00:00).'}
                {customRequirement === 'tenEarlyStarts' && 'Achievement unlocks after 10 fasts started before 6:00 AM.'}
                {customRequirement === 'tenLateStarts' && 'Achievement unlocks after 10 fasts started after 10:00 PM (22:00).'}
                {customRequirement === 'twoMidnightFast' && 'Achievement unlocks when user completes a 48+ hour fast that spans two midnights.'}
                {customRequirement === 'comebackAfter30Days' && 'Achievement unlocks when user returns to fasting after a 30+ day break.'}
                {customRequirement.includes('Goal') && 'Achievement is tracked based on user goal completion.'}
                {customRequirement.includes('Pounds') && 'Achievement is tracked based on weight loss progress.'}
                {customRequirement.includes('fast') && customRequirement.includes('Days') && 'Achievement is tracked based on weekly fasting patterns.'}
                {!['endAtSunrise', 'startAtMidnight', 'tenEarlyStarts', 'tenLateStarts', 'twoMidnightFast', 'comebackAfter30Days'].includes(customRequirement) && !customRequirement.includes('Goal') && !customRequirement.includes('Pounds') && !customRequirement.includes('fast') && 'Custom logic will evaluate this achievement automatically.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Special Event Details */}
      {criteriaType === 'special' && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-900">Special Event Achievement</h3>
              <p className="mt-1 text-sm text-yellow-800">
                Special achievements are unlocked through promotional events, challenges, or unique circumstances. 
                Make sure to document the unlock conditions clearly in the achievement description above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
