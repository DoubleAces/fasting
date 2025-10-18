/**
 * API Error Handling Utilities
 * 
 * Provides standardized error responses and error handling middleware
 * for Next.js API routes.
 */

/**
 * Standard API error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors; // For validation errors with multiple fields
  }
}

/**
 * Format error response in consistent structure
 * 
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response with status, message, and optional errors
 */
export function formatErrorResponse(error) {
  // Handle ApiError with custom status codes
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        ...(error.errors && { errors: error.errors })
      }
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.keys(error.errors).map(field => ({
      field,
      message: error.errors[field].message
    }));
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        errors
      }
    };
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return {
      status: 400,
      body: {
        error: `Invalid ${error.path}: ${error.value}`
      }
    };
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: 409,
      body: {
        error: `An entry with this ${field} already exists`
      }
    };
  }

  // Default server error
  return {
    status: 500,
    body: {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { message: error.message })
    }
  };
}

/**
 * Wrap async API route handler with error handling
 * 
 * @param {Function} handler - Async route handler function
 * @returns {Function} Wrapped handler with error handling
 * 
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return Response.json(data);
 * });
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      const { status, body } = formatErrorResponse(error);
      return Response.json(body, { status });
    }
  };
}

/**
 * Create a 404 Not Found response
 * 
 * @param {string} resource - The resource that was not found
 * @returns {Response} Next.js Response object
 */
export function notFoundResponse(resource = 'Resource') {
  return Response.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

/**
 * Create a 400 Bad Request response
 * 
 * @param {string} message - Error message
 * @param {Array} errors - Optional array of validation errors
 * @returns {Response} Next.js Response object
 */
export function badRequestResponse(message, errors = null) {
  return Response.json(
    { error: message, ...(errors && { errors }) },
    { status: 400 }
  );
}

/**
 * Create a 201 Created response
 * 
 * @param {Object} data - Created resource data
 * @returns {Response} Next.js Response object
 */
export function createdResponse(data) {
  return Response.json(data, { status: 201 });
}

/**
 * Create a 200 OK response
 * 
 * @param {Object} data - Response data
 * @returns {Response} Next.js Response object
 */
export function okResponse(data) {
  return Response.json(data, { status: 200 });
}
