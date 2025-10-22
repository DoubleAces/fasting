# Data Model: Admin User Management

**Feature**: 006-admin-user-management  
**Date**: October 22, 2025  
**Status**: Complete

## Entity Definitions

### 1. User (Existing - Modifications Required)

**Purpose**: Represents a registered user account with authentication and authorization information.

**Mongoose Schema**:
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true  // NEW: For filtering and sorting
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true  // Already exists
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    index: true  // NEW: For filtering by admin status
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true  // NEW: For sorting by registration date
  },
  lastLogin: {
    type: Date,
    default: null,
    index: true  // NEW: For sorting by last login
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Automatically manages createdAt/updatedAt
});

// Compound index for common filter+sort combination
userSchema.index({ isAdmin: 1, createdAt: -1 });

// Virtual for full name display (if needed)
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Method to safely return user data (exclude password)
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
```

**Fields**:
- `_id`: ObjectId (auto-generated, primary key)
- `name`: String (required, indexed for filtering/sorting)
- `email`: String (required, unique, indexed)
- `password`: String (required, hashed)
- `isAdmin`: Boolean (default: false, indexed for filtering)
- `createdAt`: Date (auto-managed, indexed for sorting)
- `lastLogin`: Date (nullable, indexed for sorting)
- `updatedAt`: Date (auto-managed)

**Indexes**:
- Primary: `_id`
- Unique: `email`
- Single: `name`, `isAdmin`, `createdAt`, `lastLogin`
- Compound: `{ isAdmin: 1, createdAt: -1 }`

**Relationships**:
- One-to-many with FastingEntry (one user has many entries)
- One-to-one with UserSettings
- One-to-many with PasswordResetToken
- One-to-many with SecurityLog
- Referenced in AuditLog (performedBy, targetUser)

**Validation Rules**:
- `name`: Required, non-empty after trim, max 100 characters
- `email`: Required, valid email format, unique
- `isAdmin`: Boolean only
- `lastLogin`: Date or null

---

### 2. FastingEntry (Existing - No Changes Required)

**Purpose**: Represents a fasting session tracked by a user.

**Cascade Delete**: When user is deleted, all their fasting entries must be deleted (FR-031).

**Reference Field**: `userId` (ObjectId referencing User collection)

**Mongoose Schema**:
```javascript
const fastingEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // For efficient cascade deletion query
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for cascade deletion
fastingEntrySchema.index({ userId: 1 });

const FastingEntry = mongoose.model('FastingEntry', fastingEntrySchema);
```

**Deletion Query**:
```javascript
await FastingEntry.deleteMany({ userId: deletedUserId }, { session });
```

---

### 3. UserSettings (Existing - No Changes Required)

**Purpose**: Stores user-specific preferences and configuration.

**Cascade Delete**: When user is deleted, their settings must be deleted (FR-031).

**Reference Field**: `userId` (ObjectId referencing User collection)

**Mongoose Schema**:
```javascript
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false }
  },
  timezone: String,
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
```

**Deletion Query**:
```javascript
await UserSettings.deleteMany({ userId: deletedUserId }, { session });
```

---

### 4. PasswordResetToken (Existing - No Changes Required)

**Purpose**: Temporary tokens for password reset functionality.

**Cascade Delete**: When user is deleted, all their tokens must be deleted (FR-031).

**Reference Field**: `userId` (ObjectId referencing User collection)

**Mongoose Schema**:
```javascript
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true  // For cleanup of expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  used: {
    type: Boolean,
    default: false
  }
});

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
```

**Deletion Query**:
```javascript
await PasswordResetToken.deleteMany({ userId: deletedUserId }, { session });
```

---

### 5. SecurityLog (Existing - No Changes Required)

**Purpose**: Records security-related events (login attempts, password changes, etc.).

**Cascade Delete**: When user is deleted, logs referencing that user must be deleted (FR-031).

**Note**: Spec mentions "deleted or anonymized" - implementing deletion for simplicity. Anonymization can be future enhancement.

**Reference Field**: `userId` (ObjectId referencing User collection)

**Mongoose Schema**:
```javascript
const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  event: {
    type: String,
    enum: ['login_success', 'login_failure', 'password_change', 'password_reset_request', 'account_locked'],
    required: true,
    index: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: mongoose.Schema.Types.Mixed
});

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
```

**Deletion Query**:
```javascript
await SecurityLog.deleteMany({ userId: deletedUserId }, { session });
```

---

### 6. AuditLog (New - Create for This Feature)

**Purpose**: Records administrative actions for compliance and investigation (FR-042, FR-043).

**Lifecycle**: Created when admin toggles user status or deletes user. Not deleted with user (preserves audit trail).

**Mongoose Schema**:
```javascript
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'TOGGLE_ADMIN',
      'DELETE_USER',
      'SELF_MODIFICATION_ATTEMPT',
      'SELF_DELETION_ATTEMPT'
    ],
    required: true,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    // For TOGGLE_ADMIN: { isAdmin: false }
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    // For TOGGLE_ADMIN: { isAdmin: true }
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    // For DELETE_USER: { fastingEntries: 47, settings: 1, tokens: 2, logs: 15 }
  },
  blocked: {
    type: Boolean,
    default: false,
    // true for SELF_MODIFICATION_ATTEMPT, SELF_DELETION_ATTEMPT
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: String,
  userAgent: String
});

// Compound indexes for common queries
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ targetUser: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
```

**Fields**:
- `_id`: ObjectId (auto-generated)
- `action`: String enum (required, indexed)
- `performedBy`: ObjectId reference to User (who did it)
- `targetUser`: ObjectId reference to User (affected user)
- `oldValue`: Mixed (previous state for toggles)
- `newValue`: Mixed (new state for toggles)
- `details`: Mixed (deletion counts, error details)
- `blocked`: Boolean (was action prevented by validation?)
- `timestamp`: Date (when action occurred)
- `ipAddress`: String (optional, for security context)
- `userAgent`: String (optional, for security context)

**Indexes**:
- Single: `action`, `performedBy`, `targetUser`, `timestamp`
- Compound: `{ performedBy: 1, timestamp: -1 }`, `{ targetUser: 1, timestamp: -1 }`, `{ action: 1, timestamp: -1 }`

**Not Cascade Deleted**: AuditLog entries persist after user deletion to maintain audit trail.

---

## Data Transfer Objects (DTOs)

### UserListItemDTO

**Purpose**: Serialized user data for table display (excludes sensitive fields).

**Source**: User model + computed fields

**TypeScript Interface**:
```typescript
interface UserListItemDTO {
  id: string;                    // User._id as string
  name: string;                  // User.name
  email: string;                 // User.email
  isAdmin: boolean;              // User.isAdmin
  registrationDate: string;      // User.createdAt (ISO 8601)
  lastLogin: string | null;      // User.lastLogin (ISO 8601) or null
  isSelf: boolean;               // Computed: user.id === session.user.id
}
```

**Transformation**:
```javascript
function toUserListItemDTO(user, currentUserId) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    registrationDate: user.createdAt.toISOString(),
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    isSelf: user._id.toString() === currentUserId
  };
}
```

---

### PaginatedUsersDTO

**Purpose**: API response for paginated user list with metadata.

**TypeScript Interface**:
```typescript
interface PaginatedUsersDTO {
  users: UserListItemDTO[];      // Array of user data
  pagination: {
    currentPage: number;         // 1-indexed page number
    pageSize: number;            // Users per page (10, 25, 50, 100)
    totalUsers: number;          // Total matching users
    totalPages: number;          // Calculated: ceil(totalUsers / pageSize)
    hasNextPage: boolean;        // currentPage < totalPages
    hasPreviousPage: boolean;    // currentPage > 1
  };
  filters: {
    name?: string;               // Current name filter
    email?: string;              // Current email filter
    adminStatus?: 'all' | 'admin' | 'non-admin';
  };
  sort: {
    field: 'name' | 'email' | 'registrationDate' | 'lastLogin' | 'isAdmin';
    order: 'asc' | 'desc';
  };
}
```

---

### ToggleAdminRequestDTO

**Purpose**: Request body for admin status toggle action.

**TypeScript Interface**:
```typescript
interface ToggleAdminRequestDTO {
  userId: string;                // Target user ID
}
```

**Validation**:
- `userId`: Required, valid ObjectId format

---

### ToggleAdminResponseDTO

**Purpose**: Response from admin status toggle action.

**TypeScript Interface**:
```typescript
interface ToggleAdminResponseDTO {
  success: boolean;
  userId: string;
  newAdminStatus: boolean;
  message: string;               // "Admin status updated successfully"
  auditLogId: string;            // Reference to created AuditLog entry
}
```

**Error Response**:
```typescript
interface ToggleAdminErrorDTO {
  success: false;
  error: string;                 // Error message
  code: string;                  // Error code: 'SELF_MODIFICATION' | 'NOT_FOUND' | 'UNAUTHORIZED'
  status: number;                // HTTP status code
}
```

---

### DeleteUserRequestDTO

**Purpose**: Request body for user deletion action.

**TypeScript Interface**:
```typescript
interface DeleteUserRequestDTO {
  userId: string;                // Target user ID
}
```

**Validation**:
- `userId`: Required, valid ObjectId format

---

### DeleteUserResponseDTO

**Purpose**: Response from user deletion action.

**TypeScript Interface**:
```typescript
interface DeleteUserResponseDTO {
  success: boolean;
  userId: string;
  deletedCounts: {
    fastingEntries: number;
    settings: number;
    tokens: number;
    logs: number;
  };
  message: string;               // Summary: "Deleted user and 47 fasting entries, 1 settings record, 2 tokens, 15 security logs"
  auditLogId: string;            // Reference to created AuditLog entry
}
```

**Error Response**:
```typescript
interface DeleteUserErrorDTO {
  success: false;
  error: string;                 // Error message
  code: string;                  // Error code: 'SELF_DELETION' | 'NOT_FOUND' | 'TRANSACTION_FAILED' | 'UNAUTHORIZED'
  status: number;                // HTTP status code
  retryable: boolean;            // Can user retry? (true for transient errors)
}
```

---

## State Diagrams

### User Admin Status Lifecycle

```
┌─────────────┐
│   Created   │ (isAdmin: false by default)
│  (Non-Admin)│
└──────┬──────┘
       │
       │ Admin toggles status
       │ (by another admin)
       ▼
┌─────────────┐
│    Admin    │ (isAdmin: true)
│  (Elevated) │
└──────┬──────┘
       │
       │ Admin toggles status
       │ (by another admin)
       ▼
┌─────────────┐
│  Non-Admin  │ (isAdmin: false)
│  (Revoked)  │
└──────┬──────┘
       │
       │ Can cycle back to Admin
       └──────┐
              │
              ▼
        (Cycle repeats)

Note: Self-modification blocked at server layer
      Audit log created for each transition
```

### User Deletion Lifecycle

```
┌─────────────┐
│    Active   │ (User exists in database)
│     User    │
└──────┬──────┘
       │
       │ Admin initiates deletion
       │ (not self)
       ▼
┌─────────────┐
│ Confirmation│ (Client-side dialog)
│   Pending   │
└──────┬──────┘
       │
       │ Confirmed
       │
       ▼
┌─────────────────────────────────────┐
│      Transaction Started            │
│  (MongoDB session with isolation)   │
└──────┬──────────────────────────────┘
       │
       ├─► Delete FastingEntry records
       │   (deleteMany with session)
       │
       ├─► Delete UserSettings record
       │   (deleteMany with session)
       │
       ├─► Delete PasswordResetToken records
       │   (deleteMany with session)
       │
       ├─► Delete SecurityLog records
       │   (deleteMany with session)
       │
       ├─► Delete User record
       │   (deleteOne with session)
       │
       ├─► Create AuditLog entry
       │   (create with session)
       │
       ▼
┌─────────────┐      ┌─────────────┐
│ Transaction │ YES  │   Deleted   │ (User permanently removed)
│  Success?   ├─────►│  (Complete) │
└──────┬──────┘      └─────────────┘
       │ NO
       │ (Any step fails)
       ▼
┌─────────────┐
│  Rollback   │ (All changes reverted)
│   (Active)  │ (User still exists)
└──────┬──────┘
       │
       │ User sees error + retry option
       │
       └─► Back to Confirmation Pending (if retry clicked)

Note: Transaction timeout = 60 seconds (MongoDB default)
      If timeout, rollback automatic
```

### Session Update Propagation (Admin Toggle)

```
Admin A toggles                 Target User's
Admin B's status                Session State
─────────────────              ─────────────

T=0s: Click toggle
      │
      ▼
T=0.5s: Server validates       │ (isAdmin: false - old value)
        & updates DB            │
      │                         │
      ▼                         │
T=1s: Success response          │
      Calls session.update()    │
      │                         │
      ├─────────────────────────┤
      │   NextAuth JWT refresh  │
      │                         │
T=2s: SWR poll interval         │
      │                         ▼
      │                    Fetches /api/auth/session
      │                         │
      │                         ▼
T=3s:                      Receives updated JWT
      │                    (isAdmin: true - new value)
      │                         │
      │                         ▼
T=4s:                      Re-renders with new status
      │                    Access to admin routes granted
      │                         │
      │                         ▼
T=5s: ✅ Propagation complete

Note: 2-second SWR polling ensures <5s propagation requirement
      If JWT refresh fails, user sees old status until manual refresh
```

---

## Query Patterns

### 1. Paginated User List with Filters and Sorting

```javascript
async function getPaginatedUsers({
  page = 1,
  pageSize = 25,
  nameFilter = '',
  emailFilter = '',
  adminFilter = 'all',
  sortField = 'createdAt',
  sortOrder = 'desc'
}) {
  // Build filter object
  const filter = {};
  if (nameFilter) filter.name = { $regex: nameFilter, $options: 'i' };
  if (emailFilter) filter.email = { $regex: emailFilter, $options: 'i' };
  if (adminFilter === 'admin') filter.isAdmin = true;
  if (adminFilter === 'non-admin') filter.isAdmin = false;
  
  // Build sort object
  const sort = {};
  sort[sortField] = sortOrder === 'asc' ? 1 : -1;
  
  // Calculate skip
  const skip = (page - 1) * pageSize;
  
  // Aggregation pipeline
  const pipeline = [
    { $match: filter },
    { $sort: sort },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: pageSize },
          {
            $project: {
              password: 0  // Exclude password field
            }
          }
        ],
        total: [
          { $count: 'count' }
        ]
      }
    }
  ];
  
  const [result] = await User.aggregate(pipeline);
  const users = result.data;
  const totalUsers = result.total[0]?.count || 0;
  
  return {
    users,
    pagination: {
      currentPage: page,
      pageSize,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      hasNextPage: page < Math.ceil(totalUsers / pageSize),
      hasPreviousPage: page > 1
    },
    filters: { name: nameFilter, email: emailFilter, adminStatus: adminFilter },
    sort: { field: sortField, order: sortOrder }
  };
}
```

### 2. Toggle Admin Status with Audit Log

```javascript
async function toggleAdminStatus(targetUserId, performedByUserId, ipAddress, userAgent) {
  // Validate not self
  if (targetUserId === performedByUserId) {
    // Log blocked attempt
    await AuditLog.create({
      action: 'SELF_MODIFICATION_ATTEMPT',
      performedBy: performedByUserId,
      targetUser: targetUserId,
      blocked: true,
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    throw new Error('Cannot modify own admin status');
  }
  
  // Find user
  const user = await User.findById(targetUserId);
  if (!user) throw new Error('User not found');
  
  const oldValue = { isAdmin: user.isAdmin };
  const newValue = { isAdmin: !user.isAdmin };
  
  // Update user
  user.isAdmin = !user.isAdmin;
  await user.save();
  
  // Create audit log
  const auditLog = await AuditLog.create({
    action: 'TOGGLE_ADMIN',
    performedBy: performedByUserId,
    targetUser: targetUserId,
    oldValue,
    newValue,
    blocked: false,
    timestamp: new Date(),
    ipAddress,
    userAgent
  });
  
  return {
    userId: user._id.toString(),
    newAdminStatus: user.isAdmin,
    auditLogId: auditLog._id.toString()
  };
}
```

### 3. Cascade Delete User with Transaction

```javascript
async function deleteUserWithCascade(targetUserId, performedByUserId, ipAddress, userAgent) {
  // Validate not self
  if (targetUserId === performedByUserId) {
    // Log blocked attempt
    await AuditLog.create({
      action: 'SELF_DELETION_ATTEMPT',
      performedBy: performedByUserId,
      targetUser: targetUserId,
      blocked: true,
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
    
    throw new Error('Cannot delete own account');
  }
  
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      // Delete related data
      const fastingResult = await FastingEntry.deleteMany({ userId: targetUserId }, { session });
      const settingsResult = await UserSettings.deleteMany({ userId: targetUserId }, { session });
      const tokensResult = await PasswordResetToken.deleteMany({ userId: targetUserId }, { session });
      const logsResult = await SecurityLog.deleteMany({ userId: targetUserId }, { session });
      
      // Delete user
      const userResult = await User.deleteOne({ _id: targetUserId }, { session });
      if (userResult.deletedCount === 0) {
        throw new Error('User not found');
      }
      
      // Create audit log
      const deletedCounts = {
        fastingEntries: fastingResult.deletedCount,
        settings: settingsResult.deletedCount,
        tokens: tokensResult.deletedCount,
        logs: logsResult.deletedCount
      };
      
      const auditLog = await AuditLog.create([{
        action: 'DELETE_USER',
        performedBy: performedByUserId,
        targetUser: targetUserId,
        details: deletedCounts,
        blocked: false,
        timestamp: new Date(),
        ipAddress,
        userAgent
      }], { session });
      
      return {
        userId: targetUserId,
        deletedCounts,
        auditLogId: auditLog[0]._id.toString()
      };
    });
    
    return result;
  } catch (error) {
    // Transaction automatically rolled back
    throw error;
  } finally {
    await session.endSession();
  }
}
```

---

## Database Migrations

### Migration 1: Add Indexes to User Collection

```javascript
// File: migrations/001-add-user-indexes.js

async function up() {
  const db = mongoose.connection.db;
  const users = db.collection('users');
  
  // Single field indexes
  await users.createIndex({ name: 1 });
  await users.createIndex({ isAdmin: 1 });
  await users.createIndex({ createdAt: 1 });
  await users.createIndex({ lastLogin: 1 });
  
  // Compound index for common query pattern
  await users.createIndex({ isAdmin: 1, createdAt: -1 });
  
  console.log('✅ User indexes created');
}

async function down() {
  const db = mongoose.connection.db;
  const users = db.collection('users');
  
  await users.dropIndex('name_1');
  await users.dropIndex('isAdmin_1');
  await users.dropIndex('createdAt_1');
  await users.dropIndex('lastLogin_1');
  await users.dropIndex('isAdmin_1_createdAt_-1');
  
  console.log('✅ User indexes dropped');
}
```

### Migration 2: Create AuditLog Collection with Indexes

```javascript
// File: migrations/002-create-auditlog-collection.js

async function up() {
  const db = mongoose.connection.db;
  
  // Create collection (implicit via first document insert in Mongoose)
  // Create indexes
  const auditLogs = db.collection('auditlogs');
  
  await auditLogs.createIndex({ action: 1 });
  await auditLogs.createIndex({ performedBy: 1 });
  await auditLogs.createIndex({ targetUser: 1 });
  await auditLogs.createIndex({ timestamp: 1 });
  
  // Compound indexes for common queries
  await auditLogs.createIndex({ performedBy: 1, timestamp: -1 });
  await auditLogs.createIndex({ targetUser: 1, timestamp: -1 });
  await auditLogs.createIndex({ action: 1, timestamp: -1 });
  
  console.log('✅ AuditLog collection and indexes created');
}

async function down() {
  const db = mongoose.connection.db;
  await db.dropCollection('auditlogs');
  
  console.log('✅ AuditLog collection dropped');
}
```

---

## Performance Considerations

### Index Usage

1. **User List Query**: Uses `{ isAdmin: 1, createdAt: -1 }` compound index for filtered admin users sorted by registration date (most common pattern)

2. **Name/Email Filtering**: Uses single-field indexes `{ name: 1 }` and `{ email: 1 }` for regex queries

3. **Sorting**: All sortable fields (name, email, createdAt, lastLogin, isAdmin) have indexes

4. **Cascade Deletion**: Foreign key fields (userId) indexed in related collections for efficient `deleteMany` operations

### Query Performance Targets

- User list query with filters/sort: <100ms (1000 users)
- Admin toggle: <200ms (single document update + audit log insert)
- Cascade delete: <2s (transaction with 5 collections, 1000+ related documents)
- Aggregation with $facet: <150ms (parallel data fetch + count)

### Scalability Considerations

- **10,000+ users**: Consider pagination cursor-based approach instead of offset
- **100,000+ audit logs**: Consider time-based partitioning or archival strategy
- **High write load**: Consider write concerns (w:1) for audit logs (async acceptable)

---

## Summary

**Entities**: 6 (1 new: AuditLog; 1 modified: User; 4 existing: FastingEntry, UserSettings, PasswordResetToken, SecurityLog)

**DTOs**: 8 (UserListItemDTO, PaginatedUsersDTO, ToggleAdminRequestDTO, ToggleAdminResponseDTO, ToggleAdminErrorDTO, DeleteUserRequestDTO, DeleteUserResponseDTO, DeleteUserErrorDTO)

**Migrations**: 2 (add User indexes, create AuditLog collection)

**Indexes Added**: 10 single-field, 4 compound

**Transaction Support**: Required (MongoDB replica set)

**Ready for Phase 1 (continued)**: API contract generation in `/contracts/` directory.
