# API Contracts

This directory contains API contract specifications for the Website Structure & Authentication feature.

## Contract Files

- **api-spec.json**: OpenAPI 3.0 specification for all API endpoints
- **examples/**: Request and response examples
- **schemas/**: JSON Schema definitions

## Endpoints Overview

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user with email/password |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/logout | Logout current user |
| GET | /api/auth/session | Get current session |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |

### FAQ Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/faq | Get all published FAQs (with optional search) |
| GET | /api/faq?category=Getting Started | Get FAQs by category |
| GET | /api/faq?q=fasting | Search FAQs |

### Updated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/entries | Get user's entries (now filtered by userId) |
| POST | /api/entries | Create entry (now requires auth) |
| GET | /api/settings | Get user's settings (now filtered by userId) |
| PUT | /api/settings | Update user's settings (now requires auth) |

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

**Session Cookie**: `next-auth.session-token` (httpOnly, secure, sameSite=strict)

**Unauthorized Response** (401):
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {} // Optional: validation errors or additional context
}
```

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation error or malformed request
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

Login endpoints have rate limiting:
- **Max Attempts**: 5 per 15 minutes per IP address
- **Response**: 429 Too Many Requests

```json
{
  "error": "TooManyRequests",
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfter": 900
}
```

## Validation

All endpoints validate input using Joi schemas. Validation errors return 400 with details:

```json
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

## See Also

- **api-spec.json**: Full OpenAPI specification
- **data-model.md**: Database schemas and relationships
- **quickstart.md**: Getting started guide for developers
