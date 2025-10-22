# Admin User Management Scripts

This directory contains scripts for managing admin privileges in the fasting tracker application.

## Scripts

### `create-admin-user.js`

Manage admin privileges for users in the database.

## Usage

### Grant Admin Access

Grant admin privileges to a user:

```bash
node scripts/create-admin-user.js user@example.com
```

**Example Output:**
```
🔌 Connecting to database...
✅ Database connected
🔍 Looking for user: user@example.com
✅ Success: Admin access granted to "user@example.com"
📝 User details:
   - Name: John Doe
   - Auth Method: google
   - Account Active: true
   - Email Verified: true
   - Registered: 2025-01-15T10:30:00.000Z

⚠️  Note: User must log out and log back in for changes to take effect
```

### Revoke Admin Access

Remove admin privileges from a user:

```bash
node scripts/create-admin-user.js user@example.com --revoke
```

**Example Output:**
```
🔌 Connecting to database...
✅ Database connected
🔍 Looking for user: user@example.com
✅ Success: Admin access revoked from "user@example.com"
📝 User details:
   - Name: John Doe
   - Auth Method: google
   - Account Active: true

⚠️  Note: User will be logged out on next request (privilege revocation detected)
```

### List All Admins

View all users with admin privileges:

```bash
node scripts/create-admin-user.js --list
```

**Example Output:**
```
🔌 Connecting to database...
✅ Database connected
🔍 Fetching all admin users...

📋 Admin Users (2):

1. admin@example.com
   - Name: Admin User
   - Auth Method: google
   - Active: Yes
   - Registered: 2025-01-10T08:00:00.000Z
   - Last Login: 2025-01-20T14:30:00.000Z

2. super@example.com
   - Name: Super Admin
   - Auth Method: email
   - Active: Yes
   - Registered: 2025-01-05T12:00:00.000Z
   - Last Login: 2025-01-21T09:15:00.000Z
```

## Requirements

### Environment Variables

The script requires the following environment variable in `.env.local`:

- `MONGODB_URI` - MongoDB connection string

**Example `.env.local`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### User Must Exist

The user must already exist in the database before you can grant or revoke admin privileges. Users are created when they:
- Register with email/password
- Sign in with Google OAuth

## Security Considerations

### Production Access

⚠️ **WARNING**: Only run these scripts with secure access to the production database.

- Scripts should only be run by authorized system administrators
- Never commit `.env.local` with production credentials to version control
- Use environment-specific credentials (development, staging, production)
- Consider using database connection restrictions (IP whitelist)

### Audit Trail

All privilege changes are:
- Logged to console with timestamps
- Immediately reflected in the database
- Will cause active admin sessions to be invalidated on next request (for revocations)

### Privilege Revocation

When admin privileges are revoked:
1. Database is updated immediately
2. User's session remains valid until next request
3. Middleware detects privilege mismatch and denies access
4. User sees 404 page (security through obscurity)

## Common Issues

### Error: User not found

```
❌ Error: User with email "user@example.com" not found
```

**Solution**: Verify the email address is correct. User must sign in at least once to create an account.

### Error: MONGODB_URI not found

```
❌ Error: MONGODB_URI not found in environment variables
   Please create .env.local file with MONGODB_URI
```

**Solution**: Create `.env.local` file in the project root with your MongoDB connection string.

### Error: Invalid email format

```
❌ Error: Invalid email format "invalid-email"
```

**Solution**: Provide a valid email address in the format `user@example.com`.

## Testing

Run the integration tests to verify admin privilege management:

```bash
npm test -- tests/integration/admin-privilege-management.test.js
```

Expected: 8 tests passing
- 3 tests for granting admin access
- 3 tests for revoking admin access
- 2 tests for privilege revocation detection

## Workflow Examples

### Granting Admin to New User

1. User signs up or logs in with Google
2. System administrator runs grant command:
   ```bash
   node scripts/create-admin-user.js newadmin@example.com
   ```
3. User logs out and logs back in
4. User now sees admin dashboard at `/dashboard`

### Emergency Admin Revocation

1. System administrator runs revoke command:
   ```bash
   node scripts/create-admin-user.js compromised@example.com --revoke
   ```
2. User's admin access is immediately revoked in database
3. On next request, user is denied access (sees 404)
4. Security log entry is created for the denied access attempt

### Audit Admin Users

Periodically review all users with admin privileges:

```bash
node scripts/create-admin-user.js --list
```

Review the list for:
- Inactive accounts that should have privileges revoked
- Accounts with admin access that shouldn't have it
- Accounts that haven't logged in recently

## Related Documentation

- [Admin Area Access Spec](../specs/005-admin-area-access/spec.md)
- [Security Documentation](../docs/SECURITY.md)
- [Middleware Documentation](../src/lib/middleware/adminAuth.js)
