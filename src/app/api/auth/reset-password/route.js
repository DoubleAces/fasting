/**
 * Reset Password API Route
 * 
 * POST /api/auth/reset-password
 * 
 * Validates reset token and updates user's password.
 * 
 * Request Body:
 * - token: Password reset token from email link
 * - password: New password
 * - confirmPassword: Password confirmation
 * 
 * Response:
 * - 200: Password successfully reset
 * - 400: Invalid request data or token
 * - 401: Token expired or already used
 * - 500: Server error
 * 
 * Security Features:
 * - Token validation (existence, expiration, usage)
 * - Password hashing with bcrypt
 * - Token marked as used after successful reset
 * - Cannot reuse tokens
 * - Updates user's lastLogin timestamp
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { hashPassword } from '@/lib/utils/password';
import { resetPasswordSchema } from '@/lib/validation/authSchema';

/**
 * POST /api/auth/reset-password
 * 
 * Reset user password using valid token
 */
export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.validate(body);
    
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error.details[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.value;

    // Connect to database
    await dbConnect();

    // Validate token
    const resetToken = await PasswordResetToken.validateToken(token);
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(resetToken.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Check if user is using Google OAuth (shouldn't happen, but safety check)
    if (user.authMethod === 'google') {
      return NextResponse.json(
        { error: 'Cannot reset password for Google OAuth accounts.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    user.password = hashedPassword;
    user.lastLogin = new Date();
    await user.save();

    // Mark token as used
    await resetToken.markAsUsed();

    // Return success
    return NextResponse.json({
      message: 'Password successfully reset. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid password. Please ensure it meets the requirements.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
