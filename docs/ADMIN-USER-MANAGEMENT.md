# Admin User Management

**Version**: 1.0.0  
**Feature**: User Story 1, 2, 3 - View, Toggle Admin, Delete Users  
**Last Updated**: October 22, 2025

---

## Overview

The Admin User Management feature provides a comprehensive interface for administrators to view, manage, and delete user accounts. This feature is built with Next.js 15, MongoDB, and NextAuth.js.

### Key Features

1. **View Users** - Paginated table with filtering and sorting
2. **Toggle Admin Status** - Grant or revoke admin privileges
3. **Delete Users** - Remove users with complete cascade deletion
4. **Audit Logging** - Track all admin actions
5. **Session Management** - Force logout on privilege changes

---

## User Guide

### Accessing the Feature

1. Log in with an admin account
2. Navigate to **Dashboard** → **Users** (`/dashboard/users`)
3. Only users with `isAdmin: true` can access this page

### Viewing Users

The user table displays:
- **Name** - User's display name
- **Email** - User's email address
- **Registration Date** - When the user signed up (dd.mm.yyyy HH:mm format)
- **Last Login** - Last authentication timestamp
- **Admin Status** - Badge showing if user is an admin
- **Actions** - Toggle admin and delete buttons

#### Filtering Users

Use the filter bar to find specific users:

- **Name Filter** - Search by user name (case-insensitive, partial match)
- **Email Filter** - Search by email address (case-insensitive, partial match)
- **Admin Status** - Filter by admin status:
  - **All** - Show all users
  - **Admin** - Show only admins
  - **Non-Admin** - Show only regular users
- **Clear Filters** - Reset all filters to default

**Note**: Filters are debounced (300ms) to reduce API calls while typing.

#### Sorting

Click any column header to sort:
- First click: Ascending order
- Second click: Descending order
- Third click: Reset to default sort

Available sort columns:
- Name
- Email
- Registration Date (default)
- Last Login
- Admin Status

#### Pagination

- **Page Size**: Choose 10, 25, 50, or 100 users per page
- **Navigation**: Use Previous/Next buttons or page numbers
- **Total Count**: Displayed at the bottom ("Showing X-Y of Z users")

### Toggle Admin Status

#### How to Toggle

1. Locate the user in the table
2. Click the **Toggle Admin** button in the Actions column
3. Button shows current status:
   - **Make Admin** (blue) - Grant admin privileges
   - **Remove Admin** (gray) - Revoke admin privileges
4. Confirm the action (no additional prompt)
5. Success toast notification appears
6. Table updates immediately

#### Self-Protection

- **Cannot toggle your own admin status**
- Your row shows "Cannot Toggle Self" badge (disabled)
- API blocks self-modification with 403 error

#### Session Effects

When admin status is toggled:
- Target user's session is **invalidated**
- User is **forced to log out** on next request
- InvalidatedToken entry created in database
- User must log in again to continue

#### Audit Logging

Every toggle action creates an audit log entry:
```json
{
  "action": "toggle_admin_status",
  "performedBy": "<admin-user-id>",
  "targetUser": "<target-user-id>",
  "changes": {
    "isAdmin": { "from": false, "to": true }
  },
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

### Delete Users

#### How to Delete

1. Locate the user in the table
2. Click the **Delete** button (trash icon, red border)
3. Confirmation dialog appears with:
   - User's name
   - List of what will be deleted (account, entries, settings, tokens)
   - Warning: "This action cannot be undone"
4. Click **Delete User** to confirm (or Cancel to abort)
5. Loading state shows "Processing..."
6. Success toast shows deletion counts
7. Table refreshes automatically

#### Self-Protection

- **Cannot delete your own account**
- Your row shows "Cannot Delete Self" badge (disabled)
- API blocks self-deletion with 403 error

#### Cascade Deletion

When a user is deleted, the following data is **permanently removed**:

1. **Fasting Entries** - All user's fasting logs
2. **User Settings** - User preferences and configurations
3. **Invalidated Tokens** - Session invalidation records
4. **Password Reset Tokens** - Any pending password reset requests
5. **User Document** - The user account itself
6. **Audit Log Entry** - Final deletion record (created after successful deletion)

**Transaction Safety**:
- All deletions occur in a **MongoDB transaction**
- If any deletion fails, **all changes are rolled back**
- No partial deletions - it's all-or-nothing

#### Deletion Summary

Success toast shows exact counts:
```
User deleted successfully. 
Removed 123 records (user + 122 related).
```

Breakdown:
- `user`: 1 (the user document)
- `related`: entries + settings + tokens

#### Error Handling

If deletion fails:
- Error toast appears with retry button
- Confirmation dialog stays open
- No data is deleted (transaction rolled back)
- Common errors:
  - Network failure
  - Database connection lost
  - Permission denied

---

## Technical Details

### Architecture

**Frontend**:
- **Server Component**: `page.js` - Fetches initial data
- **Client Component**: `UserManagementPage.js` - State management
- **Subcomponents**: FilterBar, UserTable, PaginationControls, AdminToggle, DeleteUserButton, ConfirmDialog

**Backend**:
- **Service Layer**: `userService.js` - Business logic
- **API Routes**: `/api/admin/users` (GET, PATCH, DELETE)
- **Database**: MongoDB with transactions
- **Models**: User, Entry, Settings, InvalidatedToken, PasswordResetToken, AuditLog

### API Endpoints

#### GET /api/admin/users

Fetch paginated users with filtering and sorting.

**Query Params**:
```
page=1
limit=25
nameFilter=john
emailFilter=@example.com
adminFilter=all|admin|non-admin
sortBy=registrationDate|name|email|lastLogin|isAdmin
sortOrder=asc|desc
```

**Response**:
```json
{
  "users": [...],
  "totalUsers": 150,
  "totalPages": 6,
  "currentPage": 1,
  "pageSize": 25,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

#### PATCH /api/admin/users/[userId]

Toggle admin status for a user.

**Body**:
```json
{
  "isAdmin": true
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "isAdmin": true
  }
}
```

**Error Responses**:
- `401` - Not authenticated or not admin
- `403` - Attempting to modify own admin status
- `404` - User not found
- `500` - Server error

#### POST /api/admin/users/delete

Delete user with cascade deletion.

**Body**:
```json
{
  "userId": "user-id-here"
}
```

**Response**:
```json
{
  "success": true,
  "deletedCounts": {
    "entries": 45,
    "settings": 1,
    "invalidatedTokens": 2,
    "passwordResetTokens": 0
  },
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "message": "User and related data deleted successfully"
}
```

**Error Responses**:
- `400` - Missing userId
- `401` - Not authenticated or not admin
- `403` - Attempting to delete own account
- `404` - User not found
- `500` - Transaction failed (rolled back)

### Database Transactions

Cascade deletion uses MongoDB transactions:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Delete in order
  await Entry.deleteMany({ userId }, { session });
  await Settings.deleteMany({ userId }, { session });
  await InvalidatedToken.deleteMany({ userId }, { session });
  await PasswordResetToken.deleteMany({ userId }, { session });
  await User.findByIdAndDelete(userId, { session });
  
  // Commit transaction
  await session.commitTransaction();
  
  // Create audit log (after commit)
  await AuditLog.logDeleteUser(...);
} catch (error) {
  // Rollback on any error
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Session Invalidation

When admin status is toggled:

1. **Create InvalidatedToken**:
   ```javascript
   await InvalidatedToken.create({
     userId: targetUserId,
     invalidatedAt: new Date(),
     reason: 'admin_status_changed'
   });
   ```

2. **Middleware Check** (`middleware.js`):
   - On every request, checks for InvalidatedToken
   - If found, forces logout and redirects to login
   - Token is deleted after use

3. **User Experience**:
   - User continues current request
   - Next navigation/action triggers middleware
   - Session cleared, redirect to login
   - Must re-authenticate

### Audit Logging

All admin actions are logged to `AuditLog` collection:

**Toggle Admin**:
```javascript
{
  action: 'toggle_admin_status',
  performedBy: adminUserId,
  targetUser: targetUserId,
  changes: {
    isAdmin: { from: false, to: true }
  },
  timestamp: new Date()
}
```

**Delete User**:
```javascript
{
  action: 'delete_user',
  performedBy: adminUserId,
  targetUser: {
    _id: userId,
    email: 'user@example.com',
    name: 'John Doe'
  },
  deletedCounts: {
    entries: 45,
    settings: 1,
    tokens: 2
  },
  timestamp: new Date()
}
```

### Error Boundaries

The UI is wrapped with React Error Boundaries:

- **Page-level**: Catches errors in entire user management page
- **Component-level**: Separate boundaries for FilterBar, UserTable, PaginationControls
- **Fallback UI**: Shows error message with retry button
- **Development**: Displays stack trace in dev mode

### Performance Optimizations

1. **Debounced Filters** - 300ms delay on text inputs
2. **Server-Side Pagination** - Only fetch current page
3. **MongoDB Indexes** - Optimized queries on name, email, isAdmin, createdAt, lastLogin
4. **Transaction Batching** - Cascade deletion in single transaction
5. **URL State** - Browser back/forward works without refetch

---

## Troubleshooting

### Common Issues

#### 1. "Not authorized to access this page"

**Symptoms**:
- Redirect to dashboard or login
- Error: 401 or 403

**Causes**:
- User is not an admin
- Session expired
- Not logged in

**Solutions**:
- Verify `isAdmin: true` in database
- Log out and log back in
- Check session configuration

#### 2. "Failed to toggle admin status"

**Symptoms**:
- Toast error message
- User status unchanged

**Causes**:
- Network error
- Database connection lost
- Attempting to modify self
- User not found

**Solutions**:
- Retry the operation
- Check network connection
- Verify target user exists
- Confirm you're not targeting yourself

#### 3. "Failed to delete user"

**Symptoms**:
- Toast error message
- Dialog stays open
- User still in table

**Causes**:
- Network error
- Transaction failed
- Database connection lost
- Attempting to delete self

**Solutions**:
- Retry from dialog
- Check database connection
- Verify MongoDB replica set (required for transactions)
- Confirm you're not deleting yourself

#### 4. Table shows "No users found"

**Symptoms**:
- Empty table with no data
- Filter bar shows active filters

**Causes**:
- Active filters exclude all users
- Database connection issue
- No users in database

**Solutions**:
- Click "Clear Filters" button
- Check filter values
- Verify database has users
- Check browser console for errors

#### 5. Pagination not working

**Symptoms**:
- Click next/previous has no effect
- Page numbers don't change

**Causes**:
- JavaScript error
- State update failed
- API error

**Solutions**:
- Check browser console for errors
- Refresh the page
- Clear browser cache
- Try different page size

#### 6. Forced logout after toggle admin

**Symptoms**:
- User logged out unexpectedly
- "Session invalidated" message

**Expected Behavior**:
- This is intentional when admin status changes
- User must log in again to get new session with updated permissions

**Solution**:
- This is not a bug - it's a security feature
- Log back in to continue

---

## Security Considerations

### Access Control

1. **Middleware Protection**:
   - `/dashboard/users` requires authentication
   - Requires `isAdmin: true`
   - Redirects non-admins to dashboard

2. **API Validation**:
   - All endpoints check session
   - Verify admin status on every request
   - Self-modification blocked (403 error)

3. **Self-Protection**:
   - Cannot toggle own admin status
   - Cannot delete own account
   - UI disables buttons for self
   - API blocks with 403 error

### Data Protection

1. **Transaction Safety**:
   - Cascade deletion uses transactions
   - All-or-nothing deletion
   - No partial deletions

2. **Audit Trail**:
   - All actions logged
   - Includes timestamp, actor, target, changes
   - Immutable audit log

3. **Session Security**:
   - Forced logout on privilege change
   - Invalid sessions cleared
   - Must re-authenticate

### Best Practices

1. **Admin Account Management**:
   - Limit number of admin accounts
   - Review admin users regularly
   - Revoke admin access when no longer needed

2. **Deletion Caution**:
   - Double-check before deleting users
   - Deletions are permanent and cannot be undone
   - Consider data export before deletion

3. **Audit Log Review**:
   - Regularly review audit logs
   - Monitor for suspicious activity
   - Track who made what changes

---

## Development Notes

### Testing

**Manual Testing**:
1. Test with multiple browser tabs
2. Test filter combinations
3. Test pagination edge cases (first page, last page, single page)
4. Test sort on all columns
5. Test delete with cascade verification
6. Test toggle admin with forced logout

**Automated Testing** (TODO):
- Unit tests for services
- Integration tests for API routes
- Component tests for UI
- E2E tests for user flows

### Future Enhancements

Potential improvements:
- [ ] Bulk operations (select multiple users)
- [ ] Export user list to CSV
- [ ] User activity history
- [ ] Email notifications on admin changes
- [ ] Soft delete with restore capability
- [ ] Advanced search (date ranges, registration method)
- [ ] Role-based access control (not just admin/non-admin)
- [ ] User impersonation for debugging

### Known Limitations

1. **MongoDB Replica Set Required**:
   - Transactions require MongoDB replica set
   - Single-node MongoDB won't work for delete cascade
   - Development: Use MongoDB Atlas or local replica set

2. **Session Update Delay**:
   - Forced logout may not happen immediately
   - Depends on next request to trigger middleware
   - Can take 1-2 seconds

3. **No Undo**:
   - Deletions are permanent
   - No trash/recovery mechanism
   - Must restore from database backup if needed

4. **Performance at Scale**:
   - Current implementation tested up to 10,000 users
   - May need optimization for 100,000+ users
   - Consider implementing search indexes or Elasticsearch

---

## Support

### Getting Help

1. Check this documentation first
2. Review browser console errors
3. Check server logs (console output)
4. Review audit logs in database
5. Contact support with:
   - Error message
   - Steps to reproduce
   - Browser/OS version
   - Screenshot if applicable

### Useful MongoDB Queries

Check admin users:
```javascript
db.users.find({ isAdmin: true })
```

Check audit logs:
```javascript
db.auditlogs.find({}).sort({ timestamp: -1 }).limit(10)
```

Check invalidated tokens:
```javascript
db.invalidatedtokens.find({})
```

Count users:
```javascript
db.users.countDocuments()
```

---

## Changelog

### Version 1.0.0 (October 22, 2025)

**Initial Release**:
- ✅ User Story 1: View Users (Phase 3)
  - Paginated table
  - Filtering by name, email, admin status
  - Sorting by all columns
  - Server-side pagination
  - Responsive design

- ✅ User Story 2: Toggle Admin (Phase 4)
  - Toggle admin status button
  - Self-protection (cannot toggle self)
  - Forced logout via InvalidatedToken
  - Success/error toast notifications
  - Audit logging

- ✅ User Story 3: Delete Users (Phase 5)
  - Delete button with confirmation dialog
  - Self-protection (cannot delete self)
  - Cascade deletion with MongoDB transactions
  - Deletion summary in toast
  - Retry on errors
  - Audit logging

- ✅ Phase 6: Polish & Accessibility
  - Loading states on all async operations
  - Error boundaries
  - User documentation
  - Accessibility improvements

**Technical Stack**:
- Next.js 15.5.6 (App Router)
- MongoDB with Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- React hooks for state management

---

## License

This feature is part of the Fasting Tracker application.
© 2025 All rights reserved.
