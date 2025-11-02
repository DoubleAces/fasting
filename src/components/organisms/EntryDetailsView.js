/**
 * EntryDetailsView Component
 * 
 * Main organism that displays comprehensive fasting entry details.
 * Includes duration, timeline, meals, health metrics, mood, notes, and metadata.
 */

'use client';

import React, { useState } from 'react';
import Badge from '@/components/atoms/Badge';
import TimeDisplay from '@/components/atoms/TimeDisplay';
import FastingTimeline from '@/components/molecules/FastingTimeline';
import EntryMetadata from '@/components/molecules/EntryMetadata';
import EntryActions from '@/components/organisms/EntryActions';
import InsightsSection from '@/components/organisms/InsightsSection';
import ComparisonSection from '@/components/organisms/ComparisonSection';

/**
 * FoodNotesExpandable Component
 * Shows truncated notes with "Read more" button for long content (>300 chars)
 */
const FoodNotesExpandable = ({ notes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CHAR_LIMIT = 300;
  
  if (!notes || notes.length <= CHAR_LIMIT) {
    return (
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {notes}
      </p>
    );
  }
  
  const truncatedNotes = notes.substring(0, CHAR_LIMIT) + '...';
  
  return (
    <div>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {isExpanded ? notes : truncatedNotes}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors flex items-center gap-1"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            <span>Show less</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>Read more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

const EntryDetailsView = ({ entry, settings, insights, comparisons }) => {
  if (!entry) return null;

  const timeFormat = settings?.timeFormat || '24h';
  const measurementSystem = settings?.measurementSystem || 'metric';

  // Check if this entry is for today
  const isToday = () => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    entryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  };

  // Format fasting duration
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Check if extended fast (>24 hours)
  const isExtendedFast = entry.fastingDuration && entry.fastingDuration >= 1440;

  // Format weight based on measurement system
  const formatWeight = (kg) => {
    if (kg === null || kg === undefined) return null;
    
    if (measurementSystem === 'imperial') {
      const lbs = (kg * 2.20462).toFixed(1);
      return `${lbs} lbs`;
    }
    
    return `${kg.toFixed(1)} kg`;
  };

  // Format hours
  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return null;
    return `${hours.toFixed(1)}h`;
  };

  // Get mood label - already a string in the Entry model
  const getMoodLabel = (value) => {
    if (!value) return null;
    return value;
  };

  // Calculate eating window duration
  const calculateEatingWindow = () => {
    if (!entry.firstMealTime || !entry.lastMealTime) return null;
    
    const [firstHour, firstMin] = entry.firstMealTime.split(':').map(Number);
    const [lastHour, lastMin] = entry.lastMealTime.split(':').map(Number);
    
    const firstMinutes = firstHour * 60 + firstMin;
    const lastMinutes = lastHour * 60 + lastMin;
    
    let windowMinutes = lastMinutes - firstMinutes;
    
    // Handle case where last meal is before first meal (shouldn't happen but just in case)
    if (windowMinutes < 0) {
      windowMinutes += 24 * 60;
    }
    
    const hours = Math.floor(windowMinutes / 60);
    const mins = windowMinutes % 60;
    
    return { hours, mins, totalMinutes: windowMinutes };
  };

  const eatingWindow = calculateEatingWindow();

  // Format entry date for header
  const formatEntryDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}${suffix} of ${month}, ${year}`;
  };

  return (
    <article className="bg-white/70 backdrop-blur-md rounded-2xl shadow-soft-lg p-6 md:p-8 space-y-6 border border-white/20">
      {/* Header with duration - Glassmorphic styling */}
      <div className="border-b border-gray-200/50 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {formatEntryDate(entry.date)}
        </h1>
        
        <div className="flex flex-col gap-4">
          {/* Fasting Duration with gradient styling */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Fasting Duration</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {formatDuration(entry.fastingDuration)}
              </div>
            </div>
            
            {isExtendedFast && (
              <Badge variant="longest-fast">
                🔥 Extended Fast (24+ hours)
              </Badge>
            )}
          </div>

          {/* Show eating window for all entries */}
          {eatingWindow && (
            <div className="text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-4 py-2 border border-purple-100">
              Eating window: <span className="font-semibold text-gray-900">
                {eatingWindow.hours}h {eatingWindow.mins > 0 ? `${eatingWindow.mins}m` : ''}
              </span>
            </div>
          )}

          {/* Show helpful info when no fasting duration */}
          {(!entry.fastingDuration || entry.fastingDuration === 0) && (
            <div className="mt-2 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-700 font-medium">
                    Fasting duration requires a prior meal entry to calculate the time between your last meal and this day's first meal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline visualization - only show if fasting duration exists */}
      {entry.fastingDuration && entry.fastingDuration > 0 && (
        <section className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏱️</span>
            Fasting Timeline
          </h2>
          <FastingTimeline
            firstMealTime={entry.firstMealTime}
            fastingDuration={entry.fastingDuration}
            entryDate={entry.date}
          />
        </section>
      )}

      {/* Insights Section - User Story 2: Personalized Insights */}
      <InsightsSection insights={insights} />

      {/* Comparison Section - User Story 3: Comparison Statistics */}
      <ComparisonSection comparisons={comparisons} />

      {/* Meal times with glassmorphic cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🍽️</span>
          Meal Times
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-xl p-5 border border-green-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2">First Meal</div>
            <div className="text-2xl font-bold text-gray-900">
              {entry.firstMealTime ? (
                <TimeDisplay time={entry.firstMealTime} format={timeFormat} />
              ) : (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-5 border border-red-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2">Last Meal</div>
            <div className="text-2xl font-bold text-gray-900">
              {entry.lastMealTime ? (
                <TimeDisplay time={entry.lastMealTime} format={timeFormat} />
              ) : (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Health metrics with glassmorphic cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Health Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2">Weight</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatWeight(entry.morningWeight) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2">Sleep Duration</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatHours(entry.hoursOfSleep) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mood ratings with emojis and glassmorphic cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>😊</span>
          Mood & Well-being
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
              <span>😋</span>
              Hunger Level
            </div>
            <div className="text-xl font-bold text-gray-900">
              {getMoodLabel(entry.hungerLevel) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50/80 to-amber-50/80 backdrop-blur-sm rounded-xl p-5 border border-yellow-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
              <span>⚡</span>
              Energy Level
            </div>
            <div className="text-xl font-bold text-gray-900">
              {getMoodLabel(entry.energyLevel) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50 shadow-soft">
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
              <span>✨</span>
              Well-being
            </div>
            <div className="text-xl font-bold text-gray-900">
              {getMoodLabel(entry.wellBeing) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Food notes with glassmorphic styling and expandable content */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📝</span>
          Food Notes
        </h2>
        <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100/50 shadow-soft">
          {entry.foodNotes ? (
            <FoodNotesExpandable notes={entry.foodNotes} />
          ) : (
            <p className="text-gray-400 italic">
              No food notes logged for this entry
            </p>
          )}
        </div>
      </section>

      {/* Metadata with subtle styling */}
      <section className="border-t border-gray-200/50 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>ℹ️</span>
          Entry Information
        </h3>
        <EntryMetadata entry={entry} />
      </section>

      {/* Actions with glassmorphic container */}
      <section className="border-t border-gray-200/50 pt-6">
        <EntryActions entry={entry} isToday={isToday()} />
      </section>
    </article>
  );
};

export default EntryDetailsView;
