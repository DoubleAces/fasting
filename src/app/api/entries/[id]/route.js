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
import { validateEntry } from '@/lib/validation/entrySchema';
import { calculateFastingDuration } from '@/lib/utils/fastingCalculator';
import { getYesterday, getTomorrow, formatDate } from '@/lib/utils/dateUtils';
import { badRequestResponse } from '@/lib/api/errorHandler';
import { revalidatePath } from 'next/cache';
import { invalidateInsightsForEntry, invalidateInsightsForEntries } from '@/lib/services/entryInsightsService';

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

export const PUT = withErrorHandler(async (request, { params }) => {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  await connectDB();

  // Check if entry exists
  const existingEntry = await Entry.findById(id);
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
  const extendedFastDenied = value.extendedFastDenied;
  
  if (dateChanged || firstMealChanged || extendedFastChanged || extendedFastDenied) {
    try {
      // If user denied extended fast (clicked "No, I ate but didn't log"), set to null
      if (extendedFastDenied) {
        fastingDuration = null;
      }
      // If user confirmed extended fast, find the most recent previous entry for this user
      else if (value.extendedFastConfirmed) {
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
    id,
    { ...value, fastingDuration },
    { new: true, runValidators: true }
  );

  // Recalculate next entry's fasting duration if last meal time changed (for this user only)
  const lastMealChanged = existingEntry.lastMealTime !== value.lastMealTime;
  
  if (dateChanged || lastMealChanged) {
    try {
      const currentDate = new Date(value.date);
      
      // Find the next chronological entry (not just next day)
      const nextEntry = await Entry.findOne({
        userId: session.user.id,
        date: { $gt: currentDate }
      })
      .sort({ date: 1 })
      .limit(1);

      if (nextEntry && nextEntry.firstMealTime) {
        let newFastingDuration = null;
        
        // If current entry still has lastMealTime, calculate from current entry
        if (value.lastMealTime) {
          const result = calculateFastingDuration(
            value.lastMealTime,
            nextEntry.firstMealTime,
            value.date,
            nextEntry.date
          );
          newFastingDuration = result.totalMinutes;
        } else {
          // Current entry has no lastMealTime, find the previous entry with lastMealTime
          const previousEntryWithMeal = await Entry.findOne({
            userId: session.user.id,
            date: { $lt: currentDate },
            lastMealTime: { $exists: true, $ne: null }
          })
          .sort({ date: -1 })
          .limit(1);

          if (previousEntryWithMeal && previousEntryWithMeal.lastMealTime) {
            const result = calculateFastingDuration(
              previousEntryWithMeal.lastMealTime,
              nextEntry.firstMealTime,
              previousEntryWithMeal.date,
              nextEntry.date
            );
            newFastingDuration = result.totalMinutes;
          }
        }
        
        // Update next entry's fasting duration
        await Entry.findByIdAndUpdate(
          nextEntry._id,
          { fastingDuration: newFastingDuration }
        );
      }
    } catch (calcError) {
      console.warn('Could not update next entry fasting duration:', calcError.message);
    }
  }

  // Invalidate caches for the updated entry and any affected entries
  try {
    const affectedIds = [updatedEntry._id];
    
    // If we updated the next entry too, invalidate its cache
    if (dateChanged || lastMealChanged) {
      const nextEntry = await Entry.findOne({
        userId: session.user.id,
        date: { $gt: new Date(value.date) }
      })
      .sort({ date: 1 })
      .limit(1)
      .select('_id');
      
      if (nextEntry) {
        affectedIds.push(nextEntry._id);
      }
    }
    
    // Invalidate insights caches for all affected entries
    await invalidateInsightsForEntries(session.user.id, affectedIds);
    
    // Revalidate Next.js cache for entry pages and dashboard
    revalidatePath('/entries', 'layout');
    revalidatePath(`/entries/${id}`, 'page');
    revalidatePath('/dashboard', 'page');
    
    console.log('✅ Caches invalidated for updated entry');
  } catch (cacheError) {
    console.warn('Could not invalidate caches:', cacheError.message);
    // Continue - don't fail update if cache invalidation fails
  }

  // Trigger achievement evaluation for this user (async, non-blocking)
  try {
    const { evaluateAchievements } = await import('@/lib/services/achievementEvaluator');
    // Fire and forget - don't block entry update response
    evaluateAchievements(session.user.id).catch(evalError => {
      console.error('Achievement evaluation failed:', evalError);
    });
  } catch (importError) {
    console.warn('Could not trigger achievement evaluation:', importError.message);
    // Continue - don't fail entry update if evaluation fails
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
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  await connectDB();

  // Find entry
  const entry = await Entry.findById(id);
  
  if (!entry) {
    return notFoundResponse('Entry');
  }

  // Verify the entry belongs to the authenticated user
  if (entry.userId.toString() !== session.user.id) {
    return forbiddenResponse('You do not have permission to delete this entry');
  }

  // Get URL search params to check for confirmation
  const { searchParams } = new URL(request.url);
  const createExtendedFast = searchParams.get('createExtendedFast');
  const checkOnly = searchParams.get('checkOnly') === 'true';

  // Track if deletion creates an extended fast
  let extendedFastCreated = false;
  let extendedFastInfo = null;

  // Check for extended fast BEFORE deleting
  try {
    const deletedDate = new Date(entry.date);
    
    // Find the next chronological entry (not necessarily next day)
    const nextEntry = await Entry.findOne({
      userId: session.user.id,
      date: { $gt: deletedDate }
    })
    .sort({ date: 1 })
    .limit(1);

    if (nextEntry) {
      // Find the new previous entry (entry before the deleted one)
      const newPreviousEntry = await Entry.findOne({
        userId: session.user.id,
        date: { $lt: deletedDate }
      })
      .sort({ date: -1 })
      .limit(1);

      let newFastingDuration = null;
      
      if (newPreviousEntry && newPreviousEntry.lastMealTime && nextEntry.firstMealTime) {
        const result = calculateFastingDuration(
          newPreviousEntry.lastMealTime,
          nextEntry.firstMealTime,
          newPreviousEntry.date,
          nextEntry.date
        );
        newFastingDuration = result.totalMinutes;
        
        // Check if this creates an extended fast (>24 hours)
        if (newFastingDuration > 1440) {
          extendedFastCreated = true;
          extendedFastInfo = {
            nextEntryId: nextEntry._id,
            nextEntryDate: nextEntry.date,
            previousEntryDate: newPreviousEntry.date,
            previousLastMealTime: newPreviousEntry.lastMealTime,
            nextFirstMealTime: nextEntry.firstMealTime,
            fastingDuration: {
              totalMinutes: newFastingDuration,
              hours: result.hours,
              minutes: result.minutes,
              formatted: result.formatted
            }
          };
        }
      }

      // If checkOnly, return the extended fast info without deleting
      if (checkOnly) {
        return okResponse({
          extendedFastCreated,
          extendedFastInfo
        });
      }

      // If confirmed, proceed with deletion and update
      // Delete the entry
      await Entry.findByIdAndDelete(id);

      // Update next entry's fasting duration based on user choice
      if (createExtendedFast === 'false' && extendedFastCreated) {
        // User chose not to create extended fast - keep original fasting duration unchanged
        // Don't update the next entry at all, it will keep its existing fasting duration
      } else {
        // User confirmed extended fast or no extended fast detected - update normally
        await Entry.findByIdAndUpdate(
          nextEntry._id,
          { fastingDuration: newFastingDuration }
        );
      }
    } else {
      // No next entry
      
      // If checkOnly, return empty result
      if (checkOnly) {
        return okResponse({
          extendedFastCreated: false,
          extendedFastInfo: null
        });
      }
      
      // Just delete the entry
      await Entry.findByIdAndDelete(id);
    }
  } catch (calcError) {
    console.error('Error during delete operation:', calcError);
    return errorResponse('Failed to process deletion', 500);
  }

  // Invalidate caches for the deleted entry and any affected entries
  try {
    // Invalidate insights cache for the deleted entry
    await invalidateInsightsForEntry(session.user.id, id);
    
    // If we updated the next entry, invalidate its cache too
    const nextEntry = await Entry.findOne({
      userId: session.user.id,
      date: { $gt: entry.date }
    })
    .sort({ date: 1 })
    .limit(1)
    .select('_id');
    
    if (nextEntry) {
      await invalidateInsightsForEntry(session.user.id, nextEntry._id);
    }
    
    // Revalidate Next.js cache for entry pages and dashboard
    revalidatePath('/entries', 'layout');
    revalidatePath(`/entries/${id}`, 'page');
    revalidatePath('/dashboard', 'page');
    
    console.log('✅ Caches invalidated for deleted entry');
  } catch (cacheError) {
    console.warn('Could not invalidate caches:', cacheError.message);
    // Continue - don't fail delete if cache invalidation fails
  }

  return okResponse({
    message: 'Entry deleted successfully',
    deletedEntry: entry,
    extendedFastCreated,
    extendedFastInfo
  });
});
