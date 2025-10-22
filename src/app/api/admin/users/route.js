/**
 * Admin Users API Route
 * 
 * GET /api/admin/users
 * 
 * Returns paginated, filtered, and sorted list of users for admin panel.
 * Requires authenticated admin session.
 * 
 * Query Parameters:
 * - page: Page number (1-based, default: 1)
 * - limit: Items per page (10-100, default: 25)
 * - nameFilter: Case-insensitive partial name match
 * - emailFilter: Case-insensitive partial email match
 * - adminFilter: 'all' | 'admin' | 'non-admin' (default: 'all')
 * - sortBy: 'name' | 'email' | 'registrationDate' | 'lastLogin' | 'isAdmin' (default: 'registrationDate')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * 
 * Response Format:
 * {
 *   success: true,
 *   data: {
 *     users: [...],
 *     totalUsers: 150,
 *     totalPages: 6,
 *     currentPage: 1,
 *     pageSize: 25,
 *     hasNextPage: true,
 *     hasPrevPage: false
 *   }
 * }
 * 
 * Error Response:
 * {
 *   success: false,
 *   error: "Error message"
 * }
 * 
 * Status Codes:
 * - 200: Success
 * - 401: Unauthorized (not logged in or not admin)
 * - 400: Bad Request (invalid parameters)
 * - 500: Internal Server Error
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getPaginatedUsers } from '@/lib/services/userService';

/**
 * GET handler for /api/admin/users
 * 
 * Fetches paginated user list with filtering and sorting.
 * Validates admin session before processing request.
 */
export async function GET(request) {
  try {
    // ========================================================================
    // AUTHENTICATION & AUTHORIZATION
    // ========================================================================

    // Get session from NextAuth
    const session = await auth();

    // Check if user is logged in
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 401 }
      );
    }

    // ========================================================================
    // PARSE QUERY PARAMETERS
    // ========================================================================

    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '25';

    // Extract filter parameters
    const nameFilter = searchParams.get('nameFilter') || '';
    const emailFilter = searchParams.get('emailFilter') || '';
    const adminFilter = searchParams.get('adminFilter') || 'all';

    // Extract sort parameters
    const sortBy = searchParams.get('sortBy') || 'registrationDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // ========================================================================
    // PARAMETER VALIDATION
    // ========================================================================

    // Validate page number
    const pageNumber = parseInt(page);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page number. Must be a positive integer.',
        },
        { status: 400 }
      );
    }

    // Validate limit
    const pageSize = parseInt(limit);
    if (isNaN(pageSize) || pageSize < 10 || pageSize > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit. Must be between 10 and 100.',
        },
        { status: 400 }
      );
    }

    // Validate adminFilter
    const validAdminFilters = ['all', 'admin', 'non-admin'];
    if (!validAdminFilters.includes(adminFilter)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adminFilter. Must be: all, admin, or non-admin.',
        },
        { status: 400 }
      );
    }

    // Validate sortBy
    const validSortFields = ['name', 'email', 'registrationDate', 'lastLogin', 'isAdmin'];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid sortBy field. Must be: name, email, registrationDate, lastLogin, or isAdmin.',
        },
        { status: 400 }
      );
    }

    // Validate sortOrder
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid sortOrder. Must be: asc or desc.',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // FETCH DATA
    // ========================================================================

    // Call user service with validated parameters
    const result = await getPaginatedUsers({
      page: pageNumber,
      limit: pageSize,
      nameFilter,
      emailFilter,
      adminFilter,
      sortBy,
      sortOrder,
    });

    // ========================================================================
    // RETURN RESPONSE
    // ========================================================================

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error in GET /api/admin/users:', error);

    // Return generic error message to client
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users. Please try again later.',
      },
      { status: 500 }
    );
  }
}
