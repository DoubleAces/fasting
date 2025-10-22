# Data Model: Admin Area Access

**Feature**: Admin Area Access  
**Date**: October 22, 2025  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data model changes required for admin area access. The implementation extends the existing User model with a single boolean flag and requires no new collections.

---

## Entity: User (Extended)

**Collection**: `users` (existing)  
**Changes**: Add `isAdmin` field

### Schema Definition

```javascript
{
  // ... existing fields (email, password, name, etc.) ...
  
  /**
   * Admin privilege flag
   * - Indicates whether user has access to admin area
   * - Default: false (secure by default)
   * - Indexed for fast privilege queries
   * - Can be toggled by system administrators via script/database
   */
  isAdmin: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // ... existing fields (timestamps, etc.) ...
}
```

### Field Details

| Field | Type | Required | Default | Indexed | Description |
|-------|------|----------|---------|---------|-------------|
| `isAdmin` | Boolean | No | `false` | Yes | Admin privilege flag indicating access to admin area |

### Validation Rules

- **Type**: Must be boolean (true/false)
- **Default**: `false` - users are NOT admin unless explicitly granted
- **Immutable by user**: Cannot be changed by the user themselves
- **Audit**: Changes should be logged (future enhancement)

### Relationships

- **User → Session**: Admin status included in NextAuth session
- **User → AdminLog**: Implicit relationship via userId in security logs

---

## Index Strategy

### Primary Indexes (Existing)

- `email` - unique index for authentication
- `googleId` - sparse unique index for OAuth

### New Indexes

- `isAdmin` - single field index for fast privilege queries

**Index Specification**:
```javascript
userSchema.index({ isAdmin: 1 });
```

**Query Performance**:
- Admin check query: `User.findOne({ _id: userId, isAdmin: true })`
- Expected performance: <50ms with index
- Index selectivity: High (most users not admin)

**Index Statistics** (estimated):
- Total users: 10,000
- Admin users: 5-10 (0.05-0.1%)
- Index size: ~1KB (very small)

---

## State Transitions

### Admin Flag Lifecycle

```
┌─────────────┐
│   false     │ ← Initial state (user created)
│ (Non-admin) │
└──────┬──────┘
       │
       │ Administrator grants access
       │ (via script or future admin UI)
       ▼
┌─────────────┐
│    true     │
│  (Admin)    │
└──────┬──────┘
       │
       │ Administrator revokes access
       │ (via script or future admin UI)
       ▼
┌─────────────┐
│   false     │
│ (Non-admin) │
└─────────────┘
```

### State Change Triggers

1. **Grant Admin Access**:
   - Trigger: System administrator executes script/database update
   - Action: Set `isAdmin = true`
   - Side effect: User gains access to /dashboard routes
   - Session: NextAuth session refreshed to include admin flag

2. **Revoke Admin Access**:
   - Trigger: System administrator executes script/database update
   - Action: Set `isAdmin = false`
   - Side effect: User loses access to /dashboard routes
   - Session: Active session invalidated (force logout on next request)

### State Validation

- **On Login**: Check `isAdmin` flag, include in session
- **On Admin Route Access**: Verify `isAdmin === true` in middleware
- **On Privilege Change**: Invalidate/refresh session

---

## Data Integrity

### Constraints

- **Type Safety**: Mongoose enforces boolean type
- **Default Value**: Automatically applied to new users
- **No Null Values**: Boolean must be true or false (not null/undefined)

### Migration Strategy

**Existing Users**:
- No migration needed - Mongoose default value (`false`) applies retroactively
- Existing users without `isAdmin` field are treated as `false`

**First Admin User**:
- Create script: `scripts/create-admin-user.js`
- Usage: `node scripts/create-admin-user.js <email>`
- Validates user exists, sets `isAdmin = true`

### Rollback Plan

If admin feature needs to be rolled back:
1. Drop index: `db.users.dropIndex({ isAdmin: 1 })`
2. Remove field (optional): `db.users.updateMany({}, { $unset: { isAdmin: "" } })`
3. Revert middleware changes

**Note**: Field can be left in database harmlessly if feature disabled.

---

## Query Patterns

### Common Queries

**1. Check if user is admin**:
```javascript
const user = await User.findOne({ _id: userId, isAdmin: true });
if (!user) {
  // Not admin or user doesn't exist
  return unauthorized();
}
```

**2. Get all admin users**:
```javascript
const admins = await User.find({ isAdmin: true }).select('email name');
```

**3. Grant admin access**:
```javascript
await User.findByIdAndUpdate(userId, { isAdmin: true });
```

**4. Revoke admin access**:
```javascript
await User.findByIdAndUpdate(userId, { isAdmin: false });
```

**5. Count admin users**:
```javascript
const adminCount = await User.countDocuments({ isAdmin: true });
```

### Query Performance

| Query | Index Used | Est. Time | Notes |
|-------|------------|-----------|-------|
| Check if user is admin | `_id` (primary) + `isAdmin` | <50ms | Most common query |
| Get all admins | `isAdmin` | <100ms | Rare query, small result set |
| Update admin flag | `_id` (primary) | <50ms | Rare operation |

---

## Security Considerations

### Access Control

- **Read Access**: Any authenticated user can read their own `isAdmin` status
- **Write Access**: Only system administrators (via script/database) can modify
- **API Exposure**: `isAdmin` field should NOT be writable via user-facing API

### Privacy

- **Non-sensitive**: Admin status is not personally identifiable information
- **Internal Use**: Not displayed publicly, only used for authorization
- **Logging**: Admin flag changes should be logged for audit trail (future)

### Attack Vectors

**1. Privilege Escalation**:
- **Risk**: User attempts to set their own `isAdmin = true`
- **Mitigation**: No API endpoint exposes `isAdmin` for update
- **Defense**: Mongoose schema validation, middleware checks

**2. Session Token Tampering**:
- **Risk**: User modifies session token to include `isAdmin = true`
- **Mitigation**: NextAuth signs session tokens (JWT or encrypted cookie)
- **Defense**: Signature validation prevents tampering

**3. Database Injection**:
- **Risk**: SQL/NoSQL injection to modify `isAdmin` field
- **Mitigation**: Mongoose query sanitization, parameterized queries
- **Defense**: Input validation, query builder (not raw queries)

---

## Testing Strategy

### Unit Tests

- ✅ User model validates `isAdmin` as boolean
- ✅ Default value is `false` for new users
- ✅ Index exists on `isAdmin` field
- ✅ Query for admin user returns correct results
- ✅ Non-admin user query returns null/false

### Integration Tests

- ✅ Create user → `isAdmin` defaults to `false`
- ✅ Update user → `isAdmin` can be changed
- ✅ Login with admin user → session includes `isAdmin: true`
- ✅ Login with non-admin → session includes `isAdmin: false`

### Data Integrity Tests

- ✅ Existing users without `isAdmin` field treated as `false`
- ✅ Index improves query performance (benchmark test)
- ✅ Database migration script creates first admin successfully

---

## Example Documents

### Non-Admin User (Default)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2b$10$...", 
  "name": "Regular User",
  "authMethod": "email",
  "isAdmin": false,
  "createdAt": "2025-10-22T10:00:00.000Z",
  "updatedAt": "2025-10-22T10:00:00.000Z"
}
```

### Admin User

```json
{
  "_id": "507f1f77bcf86cd799439022",
  "email": "admin@example.com",
  "password": "$2b$10$...",
  "name": "Admin User",
  "authMethod": "email",
  "isAdmin": true,
  "createdAt": "2025-10-22T10:00:00.000Z",
  "updatedAt": "2025-10-22T12:30:00.000Z"
}
```

---

## Future Enhancements

**Out of scope for MVP, but data model supports**:

1. **Role-Based Access Control (RBAC)**:
   - Add `role` field (enum: 'user', 'admin', 'superadmin')
   - Keep `isAdmin` as computed field: `role !== 'user'`
   - Backward compatible

2. **Admin Permissions**:
   - Add `permissions` array field
   - Granular control (e.g., ['users:read', 'settings:write'])
   - Enables fine-grained access control

3. **Admin Audit Trail**:
   - New collection: `admin_actions`
   - Track who changed what and when
   - Links to User via `userId`

4. **Multi-Tenant Support**:
   - Add `organizationId` field
   - Admin per organization (not global)
   - Compound index: `{ organizationId: 1, isAdmin: 1 }`

---

## Summary

**Changes Required**:
- ✅ Add single boolean field to User model
- ✅ Create index on `isAdmin` field
- ✅ No new collections needed
- ✅ Backward compatible (existing users default to `false`)
- ✅ Simple, secure, performant

**Migration Complexity**: **Low** (single field addition)  
**Performance Impact**: **Negligible** (small index, fast queries)  
**Maintenance Burden**: **Minimal** (standard boolean field)
