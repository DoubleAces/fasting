# Achievement API Error Messages - Consistency Guide

## 📋 Error Message Standards

All achievement endpoints follow consistent error message patterns:

---

## Authentication Errors

### 401 Unauthorized
**Pattern**: "Authentication required [context]"

**Examples**:
```json
{ "error": "Authentication required to browse achievements" }
{ "error": "Authentication required to view achievement details" }
{ "error": "Authentication required to view personal achievements" }
{ "error": "Authentication required" }
```

**Usage**: When `session?.user?.id` is missing

---

## Authorization Errors

### 403 Forbidden
**Pattern**: "Admin access required [action]"

**Examples**:
```json
{ "error": "Admin access required to manually unlock achievements" }
{ "error": "Admin access required to create achievements" }
```

**Usage**: When `!session.user.isAdmin` for admin-only endpoints

---

## Validation Errors

### 400 Bad Request
**Pattern**: "[Field] is required" or "[Field] must be [constraint]"

**Examples**:
```json
{ "error": "Invalid JSON in request body" }
{ "error": "userId is required" }
{ "error": "achievementId is required" }
{ 
  "error": "Validation failed",
  "errors": [
    "achievementId is required",
    "translations.en.name is required"
  ]
}
{ 
  "error": "Invalid category. Must be one of: getting-started, duration, ...",
  "validCategories": ["getting-started", "duration", ...]
}
{ 
  "error": "Invalid sort. Must be one of: order, rarity, points, newest",
  "validSorts": ["order", "rarity", "points", "newest"]
}
```

**Usage**: Input validation failures

---

## Not Found Errors

### 404 Not Found
**Pattern**: "[Resource] '[identifier]' not found [additional context]"

**Examples**:
```json
{ "error": "Achievement not found" }
{ "error": "Achievement 'invalid-id' not found or inactive" }
{ "error": "User with ID '507f191e810c19729de860ea' not found" }
```

**Usage**: Resource doesn't exist or is inaccessible

**Special Case - Secret Achievements**:
- Return 404 for secret achievements that aren't unlocked
- Hides existence from users who haven't earned them

---

## Conflict Errors

### 409 Conflict
**Pattern**: "[Resource] '[identifier]' [conflict description]"

**Examples**:
```json
{
  "error": "Achievement 'week-warrior' is already unlocked for this user",
  "unlockedAt": "2025-11-04T10:30:00.000Z",
  "message": "Duplicate unlock prevented"
}
```

```json
{
  "error": "Achievement with ID 'test-achievement' already exists",
  "existingAchievementId": "507f191e810c19729de860ea",
  "message": "Use a different achievementId or update the existing achievement"
}
```

**Usage**: Duplicate prevention, unique constraint violations

---

## Server Errors

### 500 Internal Server Error
**Pattern**: "[Operation] failed: [technical details]"

**Examples**:
```json
{ "error": "Database connection failed" }
{ "error": "Failed to create achievement" }
```

**Usage**: Unexpected server errors (caught by withErrorHandler)

---

## Response Format Consistency

### Success Responses (200, 201)
Always include:
- `message`: Human-readable success message
- Data object(s) with relevant fields
- Context (who performed action, when, etc.)

**Example - Unlock Achievement**:
```json
{
  "message": "Achievement unlocked successfully",
  "achievement": { ... },
  "user": { ... },
  "unlockedBy": {
    "adminId": "...",
    "adminEmail": "...",
    "method": "manual"
  }
}
```

**Example - Create Achievement**:
```json
{
  "message": "Achievement created successfully",
  "achievement": { ... },
  "createdBy": {
    "adminId": "...",
    "adminEmail": "..."
  }
}
```

**Example - List Response**:
```json
{
  "achievements": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Example - Progress Response**:
```json
{
  "achievements": [...],
  "pagination": { ... },
  "summary": {
    "totalAchievements": 6,
    "unlockedCount": 3,
    "lockedCount": 3,
    "totalPoints": 30
  }
}
```

---

## Field Naming Conventions

### Consistent Field Names:
- `achievementId`: String slug (never `_id` in responses)
- `userId`: ObjectId or string
- `unlockedAt`: ISO timestamp
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp

### Translation Fields:
- `name`: Display title
- `description`: Full description
- `shortDescription`: Brief description

### User Context:
- `adminId`: Who performed admin action
- `adminEmail`: Admin's email
- `method`: How action was performed (manual, automatic)

---

## HTTP Status Code Guidelines

| Code | Usage | Examples |
|------|-------|----------|
| 200 | Success (read operations) | GET endpoints |
| 201 | Success (create operations) | POST endpoints |
| 400 | Invalid input | Validation errors |
| 401 | Not authenticated | Missing session |
| 403 | Not authorized | Not admin |
| 404 | Not found | Invalid ID |
| 409 | Conflict | Duplicate entry |
| 500 | Server error | Unexpected errors |

---

## Error Response Format

All errors follow this structure:

```typescript
{
  error: string;        // Human-readable error message
  details?: object;     // Optional additional context
  validValues?: array;  // For validation errors
  code?: number;        // HTTP status code
}
```

---

## Implementation Checklist

When adding new endpoints:

- [ ] Use `withErrorHandler` wrapper
- [ ] Use response helpers (okResponse, unauthorizedResponse, etc.)
- [ ] Check authentication with `auth()`
- [ ] Check authorization with `session.user.isAdmin`
- [ ] Validate required fields explicitly
- [ ] Return consistent error messages
- [ ] Include helpful context in responses
- [ ] Follow naming conventions
- [ ] Use appropriate HTTP status codes
- [ ] Test error cases

---

## Examples from Codebase

### Good Authentication Check
```javascript
const session = await auth();
if (!session?.user?.id) {
  return unauthorizedResponse('Authentication required to browse achievements');
}
```

### Good Authorization Check
```javascript
if (!session.user.isAdmin) {
  return forbiddenResponse('Admin access required to create achievements');
}
```

### Good Validation
```javascript
if (!userId) {
  return badRequestResponse('userId is required');
}

if (!VALID_CATEGORIES.includes(category)) {
  return badRequestResponse(
    `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    { validCategories: VALID_CATEGORIES }
  );
}
```

### Good Not Found
```javascript
if (!achievement) {
  return notFoundResponse(`Achievement '${achievementId}' not found or inactive`);
}
```

### Good Conflict
```javascript
if (existingUnlock) {
  return errorResponse(
    `Achievement '${achievementId}' is already unlocked for this user`,
    409,
    { 
      unlockedAt: existingUnlock.unlockedAt,
      message: 'Duplicate unlock prevented'
    }
  );
}
```

---

**Last Updated**: November 4, 2025  
**Feature**: 029-achievement-api-endpoints  
**Status**: Error handling standardized ✅
