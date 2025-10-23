/**
 * GET /api/entries/check-previous?date=YYYY-MM-DD&firstMealTime=HH:mm
 * Check for previous entry before the given date for the authenticated user
 * Returns information about the most recent entry and whether fasting duration >24h
 * 
 * Authentication: Required
 */

import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { withErrorHandler, okResponse, unauthorizedResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';
import { calculateFastingDuration } from '@/lib/utils/fastingCalculator';

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // Connect to database
  await connectDB();

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const firstMealTime = searchParams.get('firstMealTime');

  if (!dateStr) {
    return okResponse({
      hasPreviousEntry: false,
      hasGap: false,
      isExtendedFast: false,
      previousEntry: null,
      daysSinceLast: null,
      fastingDuration: null,
    });
  }

  const currentDate = new Date(dateStr);

  // Find the most recent entry before this date for this user
  const previousEntry = await Entry.findOne({
    userId: session.user.id,
    date: { $lt: currentDate }
  })
    .sort({ date: -1 })
    .limit(1)
    .lean();

  if (!previousEntry) {
    return okResponse({
      hasPreviousEntry: false,
      hasGap: false,
      isExtendedFast: false,
      previousEntry: null,
      daysSinceLast: null,
      fastingDuration: null,
    });
  }

  // Calculate days between entries
  const previousDate = new Date(previousEntry.date);
  const daysDifference = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

  // Check if there's a gap (more than 1 day difference)
  const hasGap = daysDifference > 1;

  // Calculate fasting duration if we have both meal times
  let fastingDuration = null;
  let isExtendedFast = false;
  
  if (previousEntry.lastMealTime && firstMealTime) {
    try {
      const result = calculateFastingDuration(
        previousEntry.lastMealTime,
        firstMealTime,
        previousEntry.date,
        currentDate
      );
      fastingDuration = {
        hours: result.hours,
        minutes: result.minutes,
        totalMinutes: result.totalMinutes,
        formatted: result.formattedDuration
      };
      
      // Check if fasting is more than 24 hours (1440 minutes)
      isExtendedFast = result.totalMinutes > 1440;
    } catch (error) {
      console.warn('Could not calculate fasting duration:', error.message);
    }
  }

  return okResponse({
    hasPreviousEntry: true,
    hasGap,
    isExtendedFast,
    previousEntry: {
      _id: previousEntry._id,
      date: previousEntry.date,
      lastMealTime: previousEntry.lastMealTime,
    },
    daysSinceLast: daysDifference,
    fastingDuration,
  });
});
