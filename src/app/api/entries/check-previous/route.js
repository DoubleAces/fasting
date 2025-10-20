/**
 * GET /api/entries/check-previous?date=YYYY-MM-DD
 * Check for previous entry before the given date for the authenticated user
 * Returns information about the most recent entry and whether there's a gap >24h
 * 
 * Authentication: Required
 */

import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { withErrorHandler, okResponse, unauthorizedResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

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

  if (!dateStr) {
    return okResponse({
      hasPreviousEntry: false,
      hasGap: false,
      previousEntry: null,
      daysSinceLast: null,
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
      previousEntry: null,
      daysSinceLast: null,
    });
  }

  // Calculate days between entries
  const previousDate = new Date(previousEntry.date);
  const daysDifference = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

  // Check if there's a gap (more than 1 day difference)
  const hasGap = daysDifference > 1;

  return okResponse({
    hasPreviousEntry: true,
    hasGap,
    previousEntry: {
      _id: previousEntry._id,
      date: previousEntry.date,
      lastMealTime: previousEntry.lastMealTime,
    },
    daysSinceLast: daysDifference,
  });
});
