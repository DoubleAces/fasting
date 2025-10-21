/**
 * Forgot Password API Route
 * 
 * POST /api/auth/forgot-password
 * 
 * Handles password reset requests by generating a secure token and sending
 * a password reset email to the user.
 * 
 * Request Body:
 * - email: User's email address
 * 
 * Response:
 * - 200: Success message (generic to prevent user enumeration)
 * - 400: Invalid request data
 * - 429: Rate limit exceeded
 * - 500: Server error
 * 
 * Security Features:
 * - Generic success message (doesn't reveal if email exists)
 * - Rate limiting to prevent abuse
 * - Secure token generation
 * - 1-hour token expiration
 * - Email validation
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/utils/email';
import { forgotPasswordSchema } from '@/lib/validation/authSchema';

/**
 * Rate limiting storage (in-memory, replace with Redis in production)
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3; // 3 requests per 15 minutes

/**
 * Check if IP address has exceeded rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove expired entries
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  
  return true;
}

/**
 * POST /api/auth/forgot-password
 * 
 * Initiate password reset flow
 */
export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.validate(body);
    
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error.details[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.value;

    // Connect to database
    await dbConnect();

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    // Security: Always return success to prevent user enumeration
    // Don't reveal whether the email exists in the database
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user registered with Google OAuth (can't reset password)
    if (user.authMethod === 'google') {
      // Still return generic message for security
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Invalidate any existing tokens for this user
    await PasswordResetToken.updateMany(
      { userId: user._id, used: false },
      { used: true, usedAt: new Date() }
    );

    // Generate new password reset token
    const resetToken = await PasswordResetToken.generateToken(user._id);

    // Construct reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken.token}`;

    // Send password reset email
    console.log('\n🔔 SENDING PASSWORD RESET EMAIL...');
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken: resetToken.token,
      resetUrl: resetUrl,
    });
    console.log('✅ Email sent successfully:', emailResult);

    // Return generic success message
    const response = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    // In development, include the reset URL for easy testing
    if (process.env.NODE_ENV === 'development') {
      response.devResetUrl = resetUrl;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
