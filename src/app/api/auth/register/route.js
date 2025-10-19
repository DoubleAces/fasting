/**
 * Registration API Route
 * 
 * POST /api/auth/register
 * Creates a new user account with email/password authentication
 * 
 * Request Body:
 * - email: string (required, valid email format)
 * - password: string (required, min 8 chars, complexity requirements)
 * - confirmPassword: string (required, must match password)
 * - name: string (optional)
 * 
 * Responses:
 * - 201: User created successfully
 * - 400: Validation error or duplicate email
 * - 500: Server error
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/utils/password';
import { registerSchema } from '@/lib/validation/authSchema';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password, confirmPassword, name } = body;

    // Validate input
    const validation = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
      name,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Email already registered',
          details: [
            {
              field: 'email',
              message: 'An account with this email already exists',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      authMethod: 'email',
      name: name || null,
      isActive: true,
    });

    // Return success response (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      authMethod: user.authMethod,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: 'Email already registered',
          details: [
            {
              field: 'email',
              message: 'An account with this email already exists',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create account. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
