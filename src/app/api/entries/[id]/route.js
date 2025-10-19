/**
 * GET /api/entries/[id]
 * Retrieve a specific daily entry by its MongoDB ObjectId for the authenticated user
 * 
 * Authentication: Required
 */

import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { withErrorHandler, okResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';

export const GET = withErrorHandler(async (request, { params }) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  await connectDB();

  const entry = await Entry.findById(params.id);
  
  if (!entry) {
    return notFoundResponse('Entry');
  }

  // Verify the entry belongs to the authenticated user
  if (entry.userId.toString() !== session.user.id) {
    return forbiddenResponse('You do not have permission to access this entry');
  }

  return okResponse(entry);
});

/**
 * PUT /api/entries/[id]
 * Update an existing entry for the authenticated user
 * 
 * Recalculates fasting duration for this entry and the next day's entry
 * if meal times change
 * 
 * Authentication: Required
 */

import { validateEntry } from '@/lib/validation/entrySchema';
import { calculateFastingDuration } from '@/lib/utils/fastingCalculator';
import { getYesterday, getTomorrow, formatDate } from '@/lib/utils/dateUtils';
import { badRequestResponse } from '@/lib/api/errorHandler';

export const PUT = withErrorHandler(async (request, { params }) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  await connectDB();

  // Check if entry exists
  const existingEntry = await Entry.findById(params.id);
  if (!existingEntry) {
    return notFoundResponse('Entry');
  }

  // Verify the entry belongs to the authenticated user
  if (existingEntry.userId.toString() !== session.user.id) {
    return forbiddenResponse('You do not have permission to update this entry');
  }

  // Parse and validate request body
  const body = await request.json();
  const { error, value } = validateEntry(body);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return badRequestResponse('Validation failed', errors);
  }

  // Recalculate fasting duration if date or meal times changed
  let fastingDuration = existingEntry.fastingDuration;
  
  const dateChanged = formatDate(existingEntry.date) !== formatDate(value.date);
  const firstMealChanged = existingEntry.firstMealTime !== value.firstMealTime;
  const extendedFastChanged = existingEntry.extendedFastConfirmed !== value.extendedFastConfirmed;
  
  if (dateChanged || firstMealChanged || extendedFastChanged) {
    try {
      // If user confirmed extended fast, find the most recent previous entry for this user
      if (value.extendedFastConfirmed) {
        const previousEntry = await Entry.findOne({
          userId: session.user.id,
          date: { $lt: new Date(value.date) },
          _id: { $ne: params.id } // Exclude current entry
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
        } else {
          fastingDuration = null;
        }
      } else {
        // Standard behavior: only check previous day (yesterday) for this user
        const currentDate = new Date(value.date);
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateFormatted = formatDate(previousDate);
        
        const previousEntry = await Entry.findOne({
          userId: session.user.id,
          date: new Date(previousDateFormatted),
          _id: { $ne: params.id } // Exclude current entry
        });

        if (previousEntry && previousEntry.lastMealTime && value.firstMealTime) {
          const result = calculateFastingDuration(
            previousEntry.lastMealTime,
            value.firstMealTime,
            previousEntry.date,
            value.date
          );
          fastingDuration = result.totalMinutes;
        } else {
          fastingDuration = null; // No previous day to calculate from
        }
      }
    } catch (calcError) {
      console.warn('Could not calculate fasting duration:', calcError.message);
      fastingDuration = null;
    }
  }

  // Update entry
  const updatedEntry = await Entry.findByIdAndUpdate(
    params.id,
    { ...value, fastingDuration },
    { new: true, runValidators: true }
  );

  // Recalculate next day's fasting duration if last meal time changed (for this user only)
  const lastMealChanged = existingEntry.lastMealTime !== value.lastMealTime;
  
  if (dateChanged || lastMealChanged) {
    try {
      // Get the date for the day after this entry
      const currentDate = new Date(value.date);
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateFormatted = formatDate(nextDate);
      
      const nextEntry = await Entry.findOne({
        userId: session.user.id,
        date: new Date(nextDateFormatted)
      });

      if (nextEntry && value.lastMealTime && nextEntry.firstMealTime) {
        const result = calculateFastingDuration(
          value.lastMealTime,
          nextEntry.firstMealTime,
          value.date,
          nextEntry.date
        );
        
        await Entry.findByIdAndUpdate(
          nextEntry._id,
          { fastingDuration: result.totalMinutes }
        );
      }
    } catch (calcError) {
      console.warn('Could not update next day fasting duration:', calcError.message);
    }
  }

  return okResponse(updatedEntry);
});

/**
 * DELETE /api/entries/[id]
 * Delete an entry for the authenticated user
 * 
 * Recalculates fasting duration for the next day's entry if it exists
 * 
 * Authentication: Required
 */

export const DELETE = withErrorHandler(async (request, { params }) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  await connectDB();

  // Find entry
  const entry = await Entry.findById(params.id);
  
  if (!entry) {
    return notFoundResponse('Entry');
  }

  // Verify the entry belongs to the authenticated user
  if (entry.userId.toString() !== session.user.id) {
    return forbiddenResponse('You do not have permission to delete this entry');
  }

  // Delete the entry
  await Entry.findByIdAndDelete(params.id);

  // Recalculate next day's fasting duration for this user
  try {
    // Get the date for the day after the deleted entry
    const deletedDate = new Date(entry.date);
    const nextDate = new Date(deletedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateFormatted = formatDate(nextDate);
    
    const nextEntry = await Entry.findOne({
      userId: session.user.id,
      date: new Date(nextDateFormatted)
    });

    if (nextEntry) {
      // Try to find the new previous day (the day before the deleted entry) for this user
      const previousDate = new Date(deletedDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const previousDateFormatted = formatDate(previousDate);
      
      const newPreviousEntry = await Entry.findOne({
        userId: session.user.id,
        date: new Date(previousDateFormatted)
      });

      let newFastingDuration = null;
      if (newPreviousEntry && newPreviousEntry.lastMealTime && nextEntry.firstMealTime) {
        const result = calculateFastingDuration(
          newPreviousEntry.lastMealTime,
          nextEntry.firstMealTime,
          newPreviousEntry.date,
          nextEntry.date
        );
        newFastingDuration = result.totalMinutes;
      }

      await Entry.findByIdAndUpdate(
        nextEntry._id,
        { fastingDuration: newFastingDuration }
      );
    }
  } catch (calcError) {
    console.warn('Could not update next day fasting duration:', calcError.message);
  }

  return okResponse({
    message: 'Entry deleted successfully',
    deletedEntry: entry
  });
});
