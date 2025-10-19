/**
 * GET /api/settings
 * Retrieve current user preferences for measurement system and time format
 * 
 * Returns default settings if none exist
 */

import { connectDB } from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { auth } from '@/lib/auth';
import { withErrorHandler, okResponse, unauthorizedResponse } from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to access settings');
  }

  await connectDB();

  // Find settings for authenticated user
  let settings = await Settings.findOne({ userId: session.user.id });

  if (!settings) {
    // Return default settings without saving
    settings = {
      userId: session.user.id,
      measurementSystem: 'metric',
      timeFormat: '24h'
    };
  }

  return okResponse(settings);
});

/**
 * PUT /api/settings
 * Update user preferences
 * 
 * Creates settings if they don't exist (first-time setup)
 */

import { validateSettings } from '@/lib/validation/settingsSchema';
import { badRequestResponse } from '@/lib/api/errorHandler';

export const PUT = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to update settings');
  }

  await connectDB();

  // Parse request body
  const body = await request.json();

  // Validate input data
  const { error, value } = validateSettings(body);
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return badRequestResponse('Validation failed', errors);
  }

  // Update or create settings for authenticated user (upsert)
  const settings = await Settings.findOneAndUpdate(
    { userId: session.user.id },
    { ...value, userId: session.user.id },
    { 
      new: true, 
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  return okResponse(settings);
});
