import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import achievementAdminService from '@/lib/services/achievementAdminService';
import auditLogService from '@/lib/services/auditLogService';
import { rateLimit } from '@/lib/middleware/rateLimit';

/**
 * GET /api/admin/achievements/[achievementId]
 * Get single achievement for editing
 */
export async function GET(request, context) {
  try {
    // Unwrap params for Next.js 15+
    const { achievementId } = await context.params;
    
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check admin permission
    if (!session.user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    request.session = session;
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) {
      return new Response(
        JSON.stringify(rateLimitResult.body),
        { 
          status: rateLimitResult.status,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitResult.headers
          }
        }
      );
    }

    await connectDB();

    // Get achievement
    const achievement = await achievementAdminService.getById(achievementId);

    // Log view action
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await auditLogService.log({
      userId: session.user.id,
      action: 'view-achievement',
      resource: 'achievement',
      resourceId: achievementId,
      ipAddress,
      userAgent
    });

    // Return achievement
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...(request.rateLimitHeaders || {})
    };

    return new Response(
      JSON.stringify({ achievement }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('GET /api/admin/achievements/[achievementId] error:', error);

    // Handle not found
    if (error.message.includes('not found')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT /api/admin/achievements/[achievementId]
 * Update existing achievement
 */
export async function PUT(request, context) {
  try {
    // Unwrap params for Next.js 15+
    const { achievementId } = await context.params;
    
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check admin permission
    if (!session.user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    request.session = session;
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) {
      return new Response(
        JSON.stringify(rateLimitResult.body),
        { 
          status: rateLimitResult.status,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitResult.headers
          }
        }
      );
    }

    await connectDB();

    // Parse request body
    let updates;
    try {
      updates = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate translations if provided
    if (updates.translations) {
      // If updating translations, at least English name is required
      if (!updates.translations.en?.name) {
        return new Response(
          JSON.stringify({ error: 'English name is required when updating translations' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Remove empty translations
      updates.translations = Object.fromEntries(
        Object.entries(updates.translations).filter(
          ([_, translation]) => translation.name || translation.description
        )
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Update achievement
    const updatedAchievement = await achievementAdminService.update(
      achievementId,
      updates,
      session.user.id,
      ipAddress,
      userAgent
    );

    // Return updated achievement
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...(request.rateLimitHeaders || {})
    };

    return new Response(
      JSON.stringify({
        message: 'Achievement updated successfully',
        achievement: updatedAchievement
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('PUT /api/admin/achievements/[achievementId] error:', error);

    // Handle service-level errors with statusCode
    if (error.statusCode) {
      return new Response(
        JSON.stringify({ error: error.message || 'Request failed' }),
        { status: error.statusCode, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle not found
    if (error.message?.includes('not found')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: error.message
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PATCH /api/admin/achievements/[achievementId]
 * Toggle achievement active status
 */
export async function PATCH(request, context) {
  try {
    // Unwrap params for Next.js 15+
    const { achievementId } = await context.params;
    
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check admin permission
    if (!session.user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    request.session = session;
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) {
      return new Response(
        JSON.stringify(rateLimitResult.body),
        { 
          status: rateLimitResult.status,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitResult.headers
          }
        }
      );
    }

    await connectDB();

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Toggle achievement
    const updatedAchievement = await achievementAdminService.toggleActive(
      achievementId,
      session.user.id,
      ipAddress,
      userAgent
    );

    // Return updated achievement
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...(request.rateLimitHeaders || {})
    };

    return new Response(
      JSON.stringify({
        message: `Achievement ${updatedAchievement.isActive ? 'activated' : 'deactivated'} successfully`,
        achievement: {
          achievementId: updatedAchievement.achievementId,
          isActive: updatedAchievement.isActive
        }
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('PATCH /api/admin/achievements/[achievementId] error:', error);

    // Handle not found
    if (error.message.includes('not found')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
