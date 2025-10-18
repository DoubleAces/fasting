/**
 * GET /api/settings
 * Retrieve current user preferences for measurement system and time format
 * 
 * Returns default settings if none exist
 */

import { connectDB } from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { withErrorHandler, okResponse } from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (request) => {
  await connectDB();

  // For now, use a default userId (will be replaced with auth in future)
  const userId = 'default';

  // Find or create default settings
  let settings = await Settings.findOne({ userId });

  if (!settings) {
    // Return default settings without saving
    settings = {
      userId,
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

  // For now, use a default userId (will be replaced with auth in future)
  const userId = value.userId || 'default';

  // Update or create settings (upsert)
  const settings = await Settings.findOneAndUpdate(
    { userId },
    { ...value, userId },
    { 
      new: true, 
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  return okResponse(settings);
});
