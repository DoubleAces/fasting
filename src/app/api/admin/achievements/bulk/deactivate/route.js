import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import achievementAdminService from '@/lib/services/achievementAdminService';
import { rateLimit } from '@/lib/middleware/rateLimit';

/**
 * POST /api/admin/achievements/bulk/deactivate
 * Bulk deactivate multiple achievements
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
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
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { achievementIds } = body;

    // Validate achievementIds
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'achievementIds array is required and must not be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Bulk deactivate
    const result = await achievementAdminService.bulkDeactivate(
      achievementIds,
      session.user.id,
      ipAddress,
      userAgent
    );

    // Return result
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...(request.rateLimitHeaders || {})
    };

    return new Response(
      JSON.stringify({
        message: `Successfully deactivated ${result.modifiedCount} of ${result.matchedCount} achievements`,
        ...result
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('POST /api/admin/achievements/bulk/deactivate error:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
