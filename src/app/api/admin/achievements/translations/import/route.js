import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import csvService from '@/lib/services/csvService';
import auditLogService from '@/lib/services/auditLogService';
import { rateLimit } from '@/lib/middleware/rateLimit';

/**
 * POST /api/admin/achievements/translations/import
 * Import achievement translations from CSV
 */
export async function POST(request) {
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return new Response(
        JSON.stringify({ error: 'File must be a CSV file' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const fileSize = file.size;

    // Validate CSV
    const validation = csvValidator.validate(fileContent, fileSize);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'CSV validation failed',
          validationErrors: validation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Import translations
    const result = await csvService.importTranslations(
      fileContent,
      session.user.id,
      ipAddress,
      userAgent
    );

    // Return result
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...(request.rateLimitHeaders || {})
    };

    const statusCode = result.errorCount > 0 ? 207 : 200; // 207 Multi-Status for partial success

    return new Response(
      JSON.stringify({
        message: result.errorCount === 0 
          ? `Successfully imported ${result.updatedCount} translations`
          : `Imported ${result.updatedCount} translations with ${result.errorCount} errors`,
        ...result
      }),
      { status: statusCode, headers: responseHeaders }
    );
  } catch (error) {
    console.error('POST /api/admin/achievements/translations/import error:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to import translations' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
