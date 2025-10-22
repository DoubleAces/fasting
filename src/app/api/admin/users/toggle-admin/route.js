/**
 * Toggle Admin Status API Route
 * 
 * POST /api/admin/users/toggle-admin
 * 
 * Toggles admin status for a target user.
 * Requires authenticated admin session.
 * Blocks self-modification attempts (returns 403).
 * 
 * Request Body:
 * {
 *   "userId": "user-id-to-toggle"
 * }
 * 
 * Response Format (Success):
 * {
 *   "success": true,
 *   "user": {
 *     "_id": "user-id",
 *     "email": "user@example.com",
 *     "name": "User Name",
 *     "isAdmin": true
 *   },
 *   "message": "User granted admin privileges"
 * }
 * 
 * Response Format (Error):
 * {
 *   "success": false,
 *   "error": "Error message"
 * }
 * 
 * Status Codes:
 * - 200: Success
 * - 400: Bad Request (missing userId)
 * - 401: Unauthorized (not logged in or not admin)
 * - 403: Forbidden (self-modification attempt)
 * - 404: Not Found (user not found)
 * - 500: Internal Server Error
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { toggleAdminStatus } from '@/lib/services/userService';
import InvalidatedToken from '@/lib/models/InvalidatedToken';
import { connectDB } from '@/lib/db';

/**
 * POST handler for /api/admin/users/toggle-admin
 * 
 * Toggles admin status for a user with validation and audit logging.
 */
export async function POST(request) {
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
    // PARSE REQUEST BODY
    // ========================================================================

    const body = await request.json();
    const { userId } = body;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // TOGGLE ADMIN STATUS
    // ========================================================================

    const result = await toggleAdminStatus(userId, session.user.id);

    // ========================================================================
    // INVALIDATE TOKEN IF REVOKING ADMIN (Force logout)
    // ========================================================================

    // If we revoked admin privileges, invalidate their session token
    // This forces them to logout immediately on next request
    if (!result.user.isAdmin) {
      await connectDB();
      await InvalidatedToken.invalidateUser(userId, 'admin_revoked');
    }

    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error in POST /api/admin/users/toggle-admin:', error);

    // Handle specific error codes
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Failed to toggle admin status';

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: error.code,
      },
      { status: statusCode }
    );
  }
}
