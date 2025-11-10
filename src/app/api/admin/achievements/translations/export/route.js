import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import csvService from '@/lib/services/csvService';
import auditLogService from '@/lib/services/auditLogService';
import { rateLimit } from '@/lib/middleware/rateLimit';

/**
 * GET /api/admin/achievements/translations/export
 * Export all achievement translations as CSV
 */
export async function GET(request) {
  try {
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

    // Generate CSV
    const csvContent = await csvService.exportTranslations();

    // Log export action
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await auditLogService.log({
      userId: session.user.id,
      action: 'csv-export',
      resource: 'achievement',
      changes: {
        rowCount: csvContent.split('\n').length - 1 // Exclude header
      },
      ipAddress,
      userAgent
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `achievement-translations-${timestamp}.csv`;

    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        ...(request.rateLimitHeaders || {})
      }
    });
  } catch (error) {
    console.error('GET /api/admin/achievements/translations/export error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to export translations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
