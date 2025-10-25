/**
 * EntryDetailsView Component
 * 
 * Main organism that displays comprehensive fasting entry details.
 * Includes duration, timeline, meals, health metrics, mood, notes, and metadata.
 */

'use client';

import React from 'react';
import Badge from '@/components/atoms/Badge';
import TimeDisplay from '@/components/atoms/TimeDisplay';
import FastingTimeline from '@/components/molecules/FastingTimeline';
import EntryMetadata from '@/components/molecules/EntryMetadata';
import EntryActions from '@/components/organisms/EntryActions';

const EntryDetailsView = ({ entry, settings }) => {
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
    <article className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-6">
      {/* Header with duration */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {formatEntryDate(entry.date)}
        </h1>
        
        <div className="flex flex-col gap-2">
          {/* Fasting Duration */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <div className="text-sm text-gray-600 mb-1">Fasting Duration</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatDuration(entry.fastingDuration)}
              </div>
            </div>
            
            {isExtendedFast && (
              <Badge variant="longest-fast">
                Extended Fast (24+ hours)
              </Badge>
            )}
          </div>

          {/* Show eating window for all entries */}
          {eatingWindow && (
            <div className="text-sm text-gray-600">
              Eating window: <span className="font-medium text-gray-900">
                {eatingWindow.hours}h {eatingWindow.mins > 0 ? `${eatingWindow.mins}m` : ''}
              </span>
            </div>
          )}

          {/* Show helpful info when no fasting duration */}
          {(!entry.fastingDuration || entry.fastingDuration === 0) && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-700">
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
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Fasting Timeline
          </h2>
          <FastingTimeline
            firstMealTime={entry.firstMealTime}
            fastingDuration={entry.fastingDuration}
            entryDate={entry.date}
          />
        </section>
      )}

      {/* Meal times */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Meal Times
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">First Meal</div>
            <div className="text-xl font-semibold text-gray-900">
              {entry.firstMealTime ? (
                <TimeDisplay time={entry.firstMealTime} format={timeFormat} />
              ) : (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Last Meal</div>
            <div className="text-xl font-semibold text-gray-900">
              {entry.lastMealTime ? (
                <TimeDisplay time={entry.lastMealTime} format={timeFormat} />
              ) : (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Health metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Health Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Weight</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatWeight(entry.morningWeight) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Sleep Duration</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatHours(entry.hoursOfSleep) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mood ratings */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Mood & Well-being
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Hunger Level</div>
            <div className="text-xl font-semibold text-gray-900">
              {getMoodLabel(entry.hungerLevel) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Energy Level</div>
            <div className="text-xl font-semibold text-gray-900">
              {getMoodLabel(entry.energyLevel) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Well-being</div>
            <div className="text-xl font-semibold text-gray-900">
              {getMoodLabel(entry.wellBeing) || (
                <span className="text-gray-400">Not logged</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Food notes */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Food Notes
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          {entry.foodNotes ? (
            <p className="text-gray-700 whitespace-pre-wrap">
              {entry.foodNotes}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              No food notes logged for this entry
            </p>
          )}
        </div>
      </section>

      {/* Metadata */}
      <section className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Entry Information
        </h3>
        <EntryMetadata entry={entry} />
      </section>

      {/* Actions */}
      <section className="border-t pt-4">
        <EntryActions entry={entry} isToday={isToday()} />
      </section>
    </article>
  );
};

export default EntryDetailsView;
