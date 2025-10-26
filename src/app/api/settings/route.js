/**
 * GET /api/settings
 * Retrieve current user preferences for measurement system and time format
 * 
 * Returns default settings if none exist
 * Settings are cached with 1-hour TTL for performance
 */

import { connectDB } from '@/lib/db';
import { settingsService } from '@/lib/services/settingsService';
import { auth } from '@/lib/auth';
import { withErrorHandler, okResponse, unauthorizedResponse } from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to access settings');
  }

  await connectDB();

  // Find settings for authenticated user (cached)
  let settings = await settingsService.getSettings(session.user.id);

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
 * Automatically invalidates cache on update
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

  // Update or create settings using SettingsService (handles cache invalidation)
  const settings = await settingsService.updateSettings(
    session.user.id,
    value
  );

  return okResponse(settings);
});
