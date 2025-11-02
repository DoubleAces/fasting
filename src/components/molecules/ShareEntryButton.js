/**
 * ShareEntryButton Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: Share Entry functionality
 * 
 * Button that shares entry to social media (Facebook, Twitter, etc.)
 * or copies details to clipboard as fallback.
 * 
 * Props:
 * - entry: object (required) - Entry data to share
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';

/**
 * Format duration from milliseconds to human-readable string
 */
function formatDuration(ms) {
  if (!ms) return '0h 0m';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

/**
 * Generate shareable text from entry data
 */
function generateShareText(entry) {
  const lines = [];
  
  // Header
  lines.push('🕐 Fasting Entry');
  lines.push('');
  
  // Date - show as "Log Date" since it's when the entry was logged
  if (entry.date) {
    try {
      const formattedDate = format(new Date(entry.date), 'EEEE, MMMM d, yyyy');
      lines.push(`📅 Log Date: ${formattedDate}`);
    } catch (e) {
      lines.push(`📅 Log Date: ${entry.date}`);
    }
  }
  
  // Calculate fast duration to determine if it's > 24h
  let durationMs = null;
  if (entry.fastingDuration) {
    durationMs = entry.fastingDuration * 60 * 1000;
  } else if (entry.duration) {
    durationMs = entry.duration;
  } else if (entry.startTime && entry.endTime) {
    durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
  }
  
  const isLongFast = durationMs && durationMs > (24 * 60 * 60 * 1000); // > 24 hours
  
  // Meal Times - show full date-time for fasts > 24h, otherwise just times
  // The fasting window is BETWEEN two entries:
  // - Start of fast: previousEntry.lastMealTime (from previousEntryLastMealTime field)
  // - End of fast: currentEntry.firstMealTime
  if (entry.date && entry.firstMealTime) {
    try {
      const logDate = new Date(entry.date);
      
      // End of fast: LOG day at firstMealTime (current entry)
      const [firstHour, firstMin] = entry.firstMealTime.split(':');
      const fastEndDate = new Date(logDate);
      fastEndDate.setHours(parseInt(firstHour), parseInt(firstMin), 0, 0);
      
      // Start of fast: From previous entry's lastMealTime
      let fastStartDate = null;
      if (entry.previousEntryLastMealTime) {
        const [prevLastHour, prevLastMin] = entry.previousEntryLastMealTime.split(':');
        // Calculate start date based on duration
        if (durationMs) {
          fastStartDate = new Date(fastEndDate.getTime() - durationMs);
        } else {
          // Fallback: assume previous day
          fastStartDate = new Date(logDate);
          fastStartDate.setDate(fastStartDate.getDate() - 1);
          fastStartDate.setHours(parseInt(prevLastHour), parseInt(prevLastMin), 0, 0);
        }
      } else {
        // No previous entry data - use current entry's lastMealTime as fallback
        const [lastHour, lastMin] = (entry.lastMealTime || '18:00').split(':');
        fastStartDate = new Date(logDate);
        fastStartDate.setDate(fastStartDate.getDate() - 1);
        fastStartDate.setHours(parseInt(lastHour), parseInt(lastMin), 0, 0);
      }
      
      if (isLongFast && fastStartDate) {
        // Show full date-time for long fasts
        const startStr = format(fastStartDate, 'MMM d, h:mm a');
        const endStr = format(fastEndDate, 'MMM d, h:mm a');
        lines.push(`🕐 ${startStr} - ${endStr}`);
      } else if (fastStartDate) {
        // Show just times for short fasts
        const startTime = format(fastStartDate, 'HH:mm');
        const endTime = format(fastEndDate, 'HH:mm');
        lines.push(`🕐 ${startTime} - ${endTime}`);
      }
    } catch (e) {
      // Fallback to simple times
      if (entry.lastMealTime && entry.firstMealTime) {
        lines.push(`🕐 ${entry.lastMealTime} - ${entry.firstMealTime}`);
      }
    }
  } else if (entry.startTime && entry.endTime) {
    // Fallback to old field names
    try {
      const startDate = new Date(entry.startTime);
      const endDate = new Date(entry.endTime);
      
      if (isLongFast) {
        const startStr = format(startDate, 'MMM d, h:mm a');
        const endStr = format(endDate, 'MMM d, h:mm a');
        lines.push(`🕐 ${startStr} - ${endStr}`);
      } else {
        const start = format(startDate, 'h:mm a');
        const end = format(endDate, 'h:mm a');
        lines.push(`🕐 ${start} - ${end}`);
      }
    } catch (e) {
      // Skip if dates are invalid
    }
  }
  
  // Duration (already calculated above)
  if (durationMs) {
    lines.push(`⏱️ Duration: ${formatDuration(durationMs)}`);
  }
  
  // Fasting Goal (convert minutes to hours if needed)
  if (entry.fastingGoal) {
    const goalHours = entry.fastingGoal > 100 ? Math.round(entry.fastingGoal / 60) : entry.fastingGoal;
    lines.push(`🎯 Goal: ${goalHours}h`);
  } else if (entry.type) {
    lines.push(`🎯 Type: ${entry.type}`);
  }
  
  // Goal Status - make it user-friendly
  if (entry.fastingGoal) {
    // Determine if entry is actually completed (past entry with duration)
    const isCompleted = durationMs && entry.date && new Date(entry.date) < new Date();
    
    let statusText = '';
    let statusEmoji = '';
    
    if (isCompleted) {
      // Past entry with duration - it's completed
      const goalMinutes = entry.fastingGoal > 100 ? entry.fastingGoal : entry.fastingGoal * 60;
      const actualMinutes = entry.fastingDuration || (durationMs / 60000);
      
      if (actualMinutes >= goalMinutes) {
        statusEmoji = '✅';
        statusText = 'Goal Achieved!';
      } else {
        statusEmoji = '⏸️';
        statusText = 'Ended Early';
      }
    } else {
      // Use the stored status for current/future entries
      switch(entry.goalStatus) {
        case 'achieved':
          statusEmoji = '✅';
          statusText = 'Goal Achieved!';
          break;
        case 'extended':
          statusEmoji = '🚀';
          statusText = 'Extended Beyond Goal';
          break;
        case 'not-completed':
          statusEmoji = '⏱️';
          statusText = 'In Progress';
          break;
        default:
          if (entry.goalStatus && entry.goalStatus !== 'no-goal') {
            statusEmoji = '⏱️';
            statusText = entry.goalStatus;
          }
      }
    }
    
    if (statusText) {
      lines.push(`${statusEmoji} ${statusText}`);
    }
  }
  
  lines.push('');
  
  // Health Metrics
  const metrics = [];
  
  if (entry.morningWeight) {
    metrics.push(`⚖️ Weight: ${entry.morningWeight} kg`);
  } else if (entry.weight) {
    metrics.push(`⚖️ Weight: ${entry.weight} kg`);
  }
  
  if (entry.waist) {
    metrics.push(`📏 Waist: ${entry.waist} cm`);
  }
  
  if (entry.hoursOfSleep) {
    metrics.push(`😴 Sleep: ${entry.hoursOfSleep}h`);
  }
  
  if (metrics.length > 0) {
    lines.push(...metrics);
    lines.push('');
  }
  
  // Well-being indicators
  const wellBeing = [];
  
  if (entry.energyLevel) {
    wellBeing.push(`⚡ Energy: ${entry.energyLevel}`);
  }
  
  if (entry.hungerLevel) {
    wellBeing.push(`🍽️ Hunger: ${entry.hungerLevel}`);
  }
  
  if (entry.wellBeing) {
    wellBeing.push(`😊 Well-being: ${entry.wellBeing}`);
  } else if (entry.mood) {
    wellBeing.push(`😊 Mood: ${entry.mood}`);
  }
  
  if (wellBeing.length > 0) {
    lines.push(...wellBeing);
    lines.push('');
  }
  
  // Food Notes
  if (entry.foodNotes) {
    lines.push(`🍴 Food Notes: ${entry.foodNotes}`);
    lines.push('');
  }
  
  // General Notes
  if (entry.notes) {
    lines.push(`📝 Notes: ${entry.notes}`);
    lines.push('');
  }
  
  // Meals before fast
  if (entry.mealsBeforeFast && entry.mealsBeforeFast.length > 0) {
    lines.push('🍽️ Meals Before Fast:');
    entry.mealsBeforeFast.forEach(meal => {
      lines.push(`  • ${meal}`);
    });
    lines.push('');
  }
  
  // Meals after fast
  if (entry.mealsAfterFast && entry.mealsAfterFast.length > 0) {
    lines.push('🥗 Meals After Fast:');
    entry.mealsAfterFast.forEach(meal => {
      lines.push(`  • ${meal}`);
    });
    lines.push('');
  }
  
  // Footer
  lines.push('---');
  lines.push('Shared from Fasting Tracker');
  
  return lines.join('\n');
}

/**
 * Generate share URL for social media
 */
function getShareUrl(entry, platform = 'facebook') {
  // Summary text for social media
  let durationMs = null;
  if (entry.fastingDuration) {
    durationMs = entry.fastingDuration * 60 * 1000; // Convert minutes to ms
  } else if (entry.duration) {
    durationMs = entry.duration;
  } else if (entry.startTime && entry.endTime) {
    durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
  }
  
  const duration = durationMs ? formatDuration(durationMs) : 'my fast';
  const goal = entry.fastingGoal ? `${entry.fastingGoal}h` : (entry.type || 'intermittent');
  
  // Create engaging share text with achievement
  let shareText = `🎉 Just completed a ${duration} ${goal} fast!\n\n`;
  
  const weight = entry.morningWeight || entry.weight;
  if (weight) {
    shareText += `⚖️ Current weight: ${weight} kg\n`;
  }
  
  if (entry.mood) {
    shareText += `😊 Feeling: ${entry.mood}\n`;
  }
  
  shareText += '\n#IntermittentFasting #HealthyLifestyle #FastingJourney';
  
  // Platform-specific URLs (no protected URL - just shareable text)
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    case 'twitter':
      // Twitter has character limit, so make it shorter
      const twitterText = `🎉 Just completed a ${duration} ${type} fast! ${entry.mood ? `Feeling ${entry.mood.toLowerCase()}! ` : ''}#IntermittentFasting #HealthyLifestyle`;
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?summary=${encodeURIComponent(shareText)}`;
    default:
      return '';
  }
}

export default function ShareEntryButton({ entry }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if Web Share API is available
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleNativeShare = async () => {
    try {
      const shareText = generateShareText(entry);
      
      // Share just the text content - no URL needed since it's protected
      await navigator.share({
        title: 'My Fasting Entry',
        text: shareText,
      });
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error);
      }
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const shareText = generateShareText(entry);
      await navigator.clipboard.writeText(shareText);
      
      // Show success feedback
      setCopied(true);
      setShowMenu(false);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleSocialShare = (platform) => {
    const shareUrl = getShareUrl(entry, platform);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const handleButtonClick = () => {
    if (canShare) {
      // Use native share API if available (mobile)
      handleNativeShare();
    } else {
      // Show share menu on desktop
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all min-h-[44px]"
        aria-label="Share entry"
        title="Share on social media or copy to clipboard"
      >
        {copied ? (
          <>
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>Share</span>
          </>
        )}
      </button>

      {/* Share Menu (Desktop only) */}
      {showMenu && !canShare && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              {/* Copy to Clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>

              <div className="border-t border-gray-100" />

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <svg className="w-4 h-4 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <svg className="w-4 h-4 mr-3 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Share on Twitter
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <svg className="w-4 h-4 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
