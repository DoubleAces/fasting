/**
 * Delete User API Route
 * 
 * POST /api/admin/users/delete
 * 
 * Permanently deletes a user and all related data using atomic transactions.
 * Requires authenticated admin session.
 * Blocks self-deletion attempts (returns 403).
 * 
 * Request Body:
 * {
 *   "userId": "user-id-to-delete"
 * }
 * 
 * Response Format (Success):
 * {
 *   "success": true,
 *   "deletedCounts": {
 *     "entries": 42,
 *     "settings": 1,
 *     "invalidatedTokens": 3,
 *     "passwordResetTokens": 1
 *   },
 *   "user": {
 *     "_id": "user-id",
 *     "email": "user@example.com",
 *     "name": "User Name",
 *     "isAdmin": false
 *   },
 *   "message": "User John Doe deleted successfully"
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
 * - 403: Forbidden (self-deletion attempt)
 * - 404: Not Found (user not found)
 * - 500: Internal Server Error (transaction failed, changes rolled back)
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { deleteUserWithCascade } from '@/lib/services/userService';

/**
 * POST handler for /api/admin/users/delete
 * 
 * Deletes user with cascade deletion using MongoDB transactions.
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
    // DELETE USER WITH CASCADE
    // ========================================================================

    const result = await deleteUserWithCascade(userId, session.user.id);

    // ========================================================================
    // RETURN SUCCESS
    // ========================================================================

    return NextResponse.json(
      {
        success: true,
        deletedCounts: result.deletedCounts,
        user: result.user,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error in POST /api/admin/users/delete:', error);

    // Handle specific error codes
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Failed to delete user';

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
