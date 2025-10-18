/**
 * GET /api/entries/[id]
 * Retrieve a specific daily entry by its MongoDB ObjectId
 */

import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { withErrorHandler, okResponse, notFoundResponse } from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (request, { params }) => {
  await connectDB();

  const entry = await Entry.findById(params.id);
  
  if (!entry) {
    return notFoundResponse('Entry');
  }

  return okResponse(entry);
});

/**
 * PUT /api/entries/[id]
 * Update an existing entry
 * 
 * Recalculates fasting duration for this entry and the next day's entry
 * if meal times change
 */

import { validateEntry } from '@/lib/validation/entrySchema';
import { calculateFastingDuration } from '@/lib/utils/fastingCalculator';
import { getYesterday, getTomorrow, formatDate } from '@/lib/utils/dateUtils';
import { badRequestResponse } from '@/lib/api/errorHandler';

export const PUT = withErrorHandler(async (request, { params }) => {
  await connectDB();

  // Check if entry exists
  const existingEntry = await Entry.findById(params.id);
  if (!existingEntry) {
    return notFoundResponse('Entry');
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
  
  if (dateChanged || firstMealChanged) {
    try {
      const yesterday = getYesterday(value.date);
      const yesterdayFormatted = formatDate(yesterday);
      
      const previousEntry = await Entry.findOne({
        date: {
          $gte: new Date(yesterdayFormatted),
          $lt: new Date(formatDate(value.date))
        },
        _id: { $ne: params.id } // Exclude current entry
      });

      if (previousEntry) {
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

  // Recalculate next day's fasting duration if last meal time changed
  const lastMealChanged = existingEntry.lastMealTime !== value.lastMealTime;
  
  if (dateChanged || lastMealChanged) {
    try {
      const tomorrow = getTomorrow(value.date);
      const tomorrowFormatted = formatDate(tomorrow);
      
      const nextEntry = await Entry.findOne({
        date: {
          $gte: new Date(tomorrowFormatted),
          $lt: new Date(formatDate(getTomorrow(tomorrow)))
        }
      });

      if (nextEntry) {
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
 * Delete an entry
 * 
 * Recalculates fasting duration for the next day's entry if it exists
 */

export const DELETE = withErrorHandler(async (request, { params }) => {
  await connectDB();

  // Find and delete entry
  const entry = await Entry.findByIdAndDelete(params.id);
  
  if (!entry) {
    return notFoundResponse('Entry');
  }

  // Recalculate next day's fasting duration
  try {
    const tomorrow = getTomorrow(entry.date);
    const tomorrowFormatted = formatDate(tomorrow);
    
    const nextEntry = await Entry.findOne({
      date: {
        $gte: new Date(tomorrowFormatted),
        $lt: new Date(formatDate(getTomorrow(tomorrow)))
      }
    });

    if (nextEntry) {
      // Try to find the new previous day
      const yesterday = getYesterday(nextEntry.date);
      const yesterdayFormatted = formatDate(yesterday);
      
      const newPreviousEntry = await Entry.findOne({
        date: {
          $gte: new Date(yesterdayFormatted),
          $lt: new Date(formatDate(nextEntry.date))
        }
      });

      let newFastingDuration = null;
      if (newPreviousEntry) {
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
