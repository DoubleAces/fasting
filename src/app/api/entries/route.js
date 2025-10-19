/**
 * GET /api/entries
 * Retrieve all daily fasting entries for the authenticated user in reverse chronological order
 * 
 * Query Parameters:
 * - limit: Maximum number of entries to return (default: 30)
 * - skip: Number of entries to skip for pagination (default: 0)
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
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);

  // Fetch entries for this user only with pagination
  const [entries, total] = await Promise.all([
    Entry.find({ userId: session.user.id })
      .sort({ date: -1 }) // Reverse chronological order
      .limit(limit)
      .skip(skip)
      .lean(), // Convert to plain JavaScript objects for better performance
    Entry.countDocuments({ userId: session.user.id })
  ]);

  return okResponse({
    entries,
    total,
    limit,
    skip
  });
});

/**
 * POST /api/entries
 * Create a new daily fasting entry for the authenticated user
 * 
 * Automatically calculates fasting duration if previous day's entry exists
 * Validates input using Joi schema before saving
 * 
 * Authentication: Required
 */

import { validateEntry } from '@/lib/validation/entrySchema';
import { calculateFastingDuration } from '@/lib/utils/fastingCalculator';
import { getYesterday, formatDate } from '@/lib/utils/dateUtils';
import { createdResponse, badRequestResponse, unauthorizedResponse, ApiError } from '@/lib/api/errorHandler';

export const POST = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // Connect to database
  await connectDB();

  // Parse request body
  const body = await request.json();

  // Validate input data
  const { error, value } = validateEntry(body);
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return badRequestResponse('Validation failed', errors);
  }

  // Check if entry for this date already exists for this user
  const existingEntry = await Entry.findOne({ 
    date: value.date,
    userId: session.user.id 
  });
  if (existingEntry) {
    throw new ApiError('An entry for this date already exists', 409);
  }

  // Calculate fasting duration if previous entry exists for this user
  let fastingDuration = null;
  try {
    // If user confirmed extended fast, find the most recent previous entry for this user
    if (value.extendedFastConfirmed) {
      const previousEntry = await Entry.findOne({
        userId: session.user.id,
        date: { $lt: new Date(value.date) }
      })
        .sort({ date: -1 })
        .limit(1);

      if (previousEntry && previousEntry.lastMealTime && value.firstMealTime) {
        const result = calculateFastingDuration(
          previousEntry.lastMealTime,
          value.firstMealTime,
          previousEntry.date,
          value.date
        );
        fastingDuration = result.totalMinutes;
      }
    } else {
      // Standard behavior: only check previous day (yesterday) for this user
      const currentDate = new Date(value.date);
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const previousDateFormatted = formatDate(previousDate);
      
      // Find entry for previous day for this user
      const previousEntry = await Entry.findOne({
        userId: session.user.id,
        date: new Date(previousDateFormatted)
      });

      if (previousEntry && previousEntry.lastMealTime && value.firstMealTime) {
        const result = calculateFastingDuration(
          previousEntry.lastMealTime,
          value.firstMealTime,
          previousEntry.date,
          value.date
        );
        fastingDuration = result.totalMinutes;
      }
    }
  } catch (calcError) {
    console.warn('Could not calculate fasting duration:', calcError.message);
    // Continue without fasting duration
  }

  // Create new entry with userId
  const entry = new Entry({
    ...value,
    userId: session.user.id,
    fastingDuration
  });

  await entry.save();

  return createdResponse(entry);
});
