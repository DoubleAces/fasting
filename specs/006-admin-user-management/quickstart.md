# Implementation Quickstart: Admin User Management# Quickstart Guide: Admin User Management



**Feature**: 006-admin-user-management  **Feature**: Admin User Management  

**Date**: October 22, 2025  **Branch**: `006-admin-user-management`  

**Estimated Effort**: 16-20 hours (with TDD approach)**Date**: October 22, 2025



## Overview## Overview



This quickstart provides a phased implementation guide for the admin user management feature. Follow the phases sequentially, completing all tests before implementation in accordance with TDD principles.This quickstart guide provides step-by-step instructions for implementing the admin user management feature. Follow this guide sequentially to build a complete, tested feature.



## Prerequisites**Estimated Time**: 12-16 hours of development



- ✅ Node.js 18+ installed---

- ✅ MongoDB replica set running (required for transactions)

- ✅ Next.js 15.5.6 project with App Router## Prerequisites

- ✅ NextAuth.js v5 configured

- ✅ Mongoose ODM installedBefore starting implementation, ensure:

- ✅ Jest + React Testing Library + Playwright configured

- ✅ User model exists with `isAdmin` field- ✅ Branch `006-admin-user-management` is checked out

- ✅ Admin middleware/protection in place- ✅ All dependencies installed (`npm install`)

- ✅ MongoDB connection configured (`.env.local`)

## Implementation Phases- ✅ NextAuth.js authentication working

- ✅ At least one admin user exists in database

### Phase 0: Database Setup (1 hour)

**Verify Prerequisites**:

**Goal**: Prepare database schema and indexes for optimal performance.```powershell

# Check branch

**Tasks**:git branch --show-current

1. ✅ Review existing User model

2. ✅ Add indexes to User collection (name, isAdmin, createdAt, lastLogin, compound)# Verify MongoDB connection

3. ✅ Create AuditLog model with schemanode scripts/inspect-db.js

4. ✅ Add indexes to AuditLog collection

5. ✅ Verify MongoDB replica set for transaction support# List users and confirm admin exists

6. ✅ Create migration scriptsnode scripts/list-users.js

```

**Deliverables**:

- `src/lib/models/AuditLog.js` - New Mongoose model---

- `src/lib/models/User.js` - Updated with new indexes

- `migrations/001-add-user-indexes.js` - Migration script## Phase 1: Database Setup (30 mins)

- `migrations/002-create-auditlog-collection.js` - Migration script

### 1.1 Create Database Indexes

**Verification**:

```bashCreate a migration script to add indexes for sorting and filtering.

# Run migrations

node migrations/001-add-user-indexes.js**File**: `scripts/create-user-management-indexes.js`

node migrations/002-create-auditlog-collection.js

```javascript

# Verify indexes createdconst mongoose = require('mongoose');

mongoshrequire('dotenv').config({ path: '.env.local' });

> use fasting_db

> db.users.getIndexes()async function createIndexes() {

> db.auditlogs.getIndexes()  try {

```    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

**TDD Note**: No tests required for this phase (infrastructure setup).

    const db = mongoose.connection.db;

---    const usersCollection = db.collection('users');



### Phase 1: Toast Notification System (2-3 hours)    // Create indexes for user management

    await usersCollection.createIndex({ name: 1 });

**Goal**: Build custom toast notification system for user feedback.    console.log('✓ Created index: name_1');



**Why First**: Foundation component needed by all user interactions (toggle, delete).    await usersCollection.createIndex({ createdAt: -1 });

    console.log('✓ Created index: createdAt_-1');

**Tests First** (45 min):

1. Unit test: `tests/components/Toast.test.js`    await usersCollection.createIndex({ lastLogin: -1 });

   - Renders toast with message    console.log('✓ Created index: lastLogin_-1');

   - Shows success/error styling

   - Auto-dismisses success after 5s    await usersCollection.createIndex({ isAdmin: 1 });

   - Persists error until manually dismissed    console.log('✓ Created index: isAdmin_1');

   - Announces to screen readers (ARIA)

   - Dismisses on Escape key    // Verify indexes on related collections

   - Shows retry button for errors with retry callback    const collections = ['fastingentries', 'passwordresettokens', 'securitylogs'];

    for (const collName of collections) {

2. Unit test: `tests/components/ToastContainer.test.js`      const coll = db.collection(collName);

   - Renders multiple toasts stacked      const indexes = await coll.indexes();

   - Removes toast when dismissed      const hasUserIdIndex = indexes.some(idx => idx.key.userId);

   - Portal renders outside component tree      console.log(`${hasUserIdIndex ? '✓' : '✗'} ${collName}: userId index ${hasUserIdIndex ? 'exists' : 'MISSING'}`);

    }

3. Integration test: `tests/integration/toast-context.test.js`

   - Context provider manages toast state    console.log('\n✅ Index creation complete');

   - addToast creates new toast  } catch (error) {

   - removeToast deletes toast    console.error('❌ Error creating indexes:', error);

   - Auto-dismiss timer works  } finally {

    await mongoose.disconnect();

**Implementation** (1.5-2 hours):  }

1. Create `src/components/ui/Toast.js` - Single toast component}

2. Create `src/components/ui/ToastContainer.js` - Portal-based container

3. Create `src/contexts/ToastContext.js` - Context provider with statecreateIndexes();

4. Create `src/hooks/useToast.js` - Hook for consuming context```

5. Add ToastProvider to root layout (`src/app/layout.js`)

**Run**:

**Deliverables**:```powershell

- `src/components/ui/Toast.js`node scripts/create-user-management-indexes.js

- `src/components/ui/ToastContainer.js````

- `src/contexts/ToastContext.js`

- `src/hooks/useToast.js`### 1.2 Create Cascade Delete Utility

- All tests passing (8 tests)

**File**: `src/lib/utils/userCascadeDelete.js`

**Verification**:

```bash```javascript

npm test tests/components/Toast/**

npm test tests/components/ToastContainer * Cascade delete utility for user deletion

npm test tests/integration/toast-context * Deletes user and all related data in a single transaction

``` */



---import mongoose from 'mongoose';

import dbConnect from '@/lib/db';

### Phase 2: Date Formatting Utility (1 hour)import User from '@/models/User';

import FastingEntry from '@/models/FastingEntry';

**Goal**: Create utility for formatting dates to dd.mm.yyyy HH:ii with timezone support.// Import other models as needed



**Tests First** (20 min):export async function cascadeDeleteUser(userId) {

1. Unit test: `tests/unit/utils/dateFormatter.test.js`  await dbConnect();

   - Formats valid date correctly

   - Handles null dates (returns "Never")  const session = await mongoose.startSession();

   - Handles invalid dates (returns "Invalid date")  

   - Uses browser's local timezone  try {

   - Formats with zero-padding (01, 02, etc.)    session.startTransaction();



**Implementation** (30 min):    const deletedCounts = {};

1. Create `src/lib/utils/dateFormatter.js`

2. Use native `Intl.DateTimeFormat` API    // Delete fasting entries

3. Handle edge cases (null, invalid)    const fastingResult = await FastingEntry.deleteMany(

      { userId: new mongoose.Types.ObjectId(userId) },

**Deliverables**:      { session }

- `src/lib/utils/dateFormatter.js`    );

- All tests passing (5 tests)    deletedCounts['fasting entries'] = fastingResult.deletedCount;



**Verification**:    // Delete password reset tokens

```bash    const tokensResult = await mongoose.connection.db

npm test tests/unit/utils/dateFormatter      .collection('passwordresettokens')

```      .deleteMany({ userId: userId.toString() }, { session });

    deletedCounts['password reset tokens'] = tokensResult.deletedCount;

---

    // Delete security logs

### Phase 3: Backend Services (3-4 hours)    const logsResult = await mongoose.connection.db

      .collection('securitylogs')

**Goal**: Implement business logic for user operations with audit logging.      .deleteMany({ userId: userId.toString() }, { session });

    deletedCounts['security logs'] = logsResult.deletedCount;

**Tests First** (1.5 hours):

1. Unit test: `tests/unit/services/auditService.test.js`    // Delete user settings (if separate collection exists)

   - Creates audit log for toggle admin    // const settingsResult = await UserSettings.deleteMany({ userId }, { session });

   - Creates audit log for delete user    // deletedCounts['user settings'] = settingsResult.deletedCount;

   - Creates audit log for blocked attempts    deletedCounts['user settings'] = 0; // Placeholder

   - Captures IP address and user agent

    // Finally, delete the user

2. Unit test: `tests/unit/services/userService.test.js`    const userResult = await User.deleteOne({ _id: userId }, { session });

   - getPaginatedUsers with filters and sorting    

   - Builds correct MongoDB query    if (userResult.deletedCount === 0) {

   - Returns pagination metadata      throw new Error('User not found');

   - Marks current user as isSelf    }



3. Integration test: `tests/integration/services/toggleAdmin.test.js`    await session.commitTransaction();

   - Toggles admin status successfully

   - Throws error for self-modification    return {

   - Creates audit log entry      success: true,

   - Handles non-existent user      deletedCounts

    };

4. Integration test: `tests/integration/services/deleteUser.test.js`  } catch (error) {

   - Deletes user with cascade (all related data)    await session.abortTransaction();

   - Throws error for self-deletion    throw error;

   - Transaction rolls back on failure  } finally {

   - Creates audit log entry    session.endSession();

   - Returns deletion counts  }

}

**Implementation** (1.5-2 hours):```

1. Create `src/lib/services/auditService.js`

   - `createAuditLog(action, performedBy, targetUser, details)`**Test**:

   - `logBlockedAttempt(action, userId)````javascript

// scripts/test-cascade-delete.js

2. Create `src/lib/services/userService.js`const { cascadeDeleteUser } = require('../src/lib/utils/userCascadeDelete');

   - `getPaginatedUsers(filters, sort, pagination, currentUserId)`

   - `toggleAdminStatus(userId, performedBy, ipAddress, userAgent)`async function test() {

   - `deleteUserWithCascade(userId, performedBy, ipAddress, userAgent)`  // Create test user first, then delete

  const testUserId = '507f1f77bcf86cd799439011'; // Replace with test ID

3. Create `src/lib/services/sessionService.js`  const result = await cascadeDeleteUser(testUserId);

   - `refreshUserSession(userId)` (placeholder for now)  console.log('Deleted:', result);

}

**Deliverables**:

- `src/lib/services/auditService.js`test();

- `src/lib/services/userService.js````

- `src/lib/services/sessionService.js`

- All tests passing (15 tests)---



**Verification**:## Phase 2: API Routes (4-6 hours)

```bash

npm test tests/unit/services### 2.1 User List API

npm test tests/integration/services

```**File**: `src/app/api/admin/users/route.js`



---```javascript

import { NextResponse } from 'next/server';

### Phase 4: API Routes (2-3 hours)import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

**Goal**: Create API endpoints for paginated user list and mutations.import dbConnect from '@/lib/db';

import User from '@/models/User';

**Tests First** (1 hour):

1. Integration test: `tests/integration/api/admin-users.test.js`export async function GET(request) {

   - GET /api/admin/users returns paginated data  try {

   - Filters by name (case-insensitive)    // Authentication check

   - Filters by email (case-insensitive)    const session = await getServerSession(authOptions);

   - Filters by admin status    if (!session) {

   - Sorts by all sortable fields      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

   - Pagination works correctly    }

   - Requires admin authentication

   - Returns 403 for non-admin    // Authorization check

    if (!session.user.isAdmin) {

2. Integration test: `tests/integration/api/toggle-admin.test.js`      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

   - POST /api/admin/users/toggle-admin succeeds    }

   - Returns 403 for self-modification

   - Returns 404 for non-existent user    await dbConnect();

   - Requires admin authentication

    // Parse query parameters

3. Integration test: `tests/integration/api/delete-user.test.js`    const { searchParams } = new URL(request.url);

   - POST /api/admin/users/delete succeeds with cascade    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);

   - Returns 403 for self-deletion    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize')) || 25));

   - Returns 404 for non-existent user    const sortBy = searchParams.get('sortBy') || 'registrationDate';

   - Transaction rollback works    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

   - Requires admin authentication    const nameFilter = searchParams.get('nameFilter') || null;

    const emailFilter = searchParams.get('emailFilter') || null;

**Implementation** (1-1.5 hours):    const adminFilter = searchParams.get('adminFilter') || 'all';

1. Create `src/app/api/admin/users/route.js` - GET handler

   - Parse query parameters    // Build filters

   - Call userService.getPaginatedUsers()    const filters = {};

   - Return PaginatedUsersDTO    if (nameFilter) {

      filters.name = { $regex: nameFilter, $options: 'i' };

2. Create `src/app/api/admin/users/toggle-admin/route.js` - POST handler    }

   - Validate request body    if (emailFilter) {

   - Extract IP and user agent      filters.email = { $regex: emailFilter, $options: 'i' };

   - Call userService.toggleAdminStatus()    }

   - Return ToggleAdminResponseDTO    if (adminFilter === 'admin') {

      filters.isAdmin = true;

3. Create `src/app/api/admin/users/delete/route.js` - POST handler    } else if (adminFilter === 'non-admin') {

   - Validate request body      filters.isAdmin = false;

   - Extract IP and user agent    }

   - Call userService.deleteUserWithCascade()

   - Return DeleteUserResponseDTO    // Build sort criteria

    const fieldMap = {

**Deliverables**:      name: 'name',

- `src/app/api/admin/users/route.js`      email: 'email',

- `src/app/api/admin/users/toggle-admin/route.js`      registrationDate: 'createdAt',

- `src/app/api/admin/users/delete/route.js`      lastLogin: 'lastLogin',

- All tests passing (20 tests)      adminStatus: 'isAdmin'

    };

**Verification**:    const sortCriteria = {

```bash      [fieldMap[sortBy]]: sortOrder === 'asc' ? 1 : -1

npm test tests/integration/api    };

```

    // Execute query

---    const skip = (page - 1) * pageSize;

    const [users, totalRecords] = await Promise.all([

### Phase 5: Server Actions (Alternative to API Routes) (1.5 hours)      User.find(filters)

        .select('name email createdAt lastLogin isAdmin')

**Note**: Choose EITHER Phase 4 (API Routes) OR Phase 5 (Server Actions), not both. Server Actions recommended for better Next.js 15 integration.        .sort(sortCriteria)

        .skip(skip)

**Tests First** (30 min):        .limit(pageSize)

1. Integration test: `tests/integration/actions/toggleAdmin.test.js`        .lean(),

2. Integration test: `tests/integration/actions/deleteUser.test.js`      User.countDocuments(filters)

    ]);

**Implementation** (45 min):

1. Create `src/app/admin/users/actions.js`    // Format response

   - `toggleAdminAction(formData)` - Server Action    const formattedUsers = users.map(user => ({

   - `deleteUserAction(formData)` - Server Action      id: user._id.toString(),

   - Both call respective service methods      name: user.name,

      email: user.email,

**Deliverables**:      registrationDate: user.createdAt?.toISOString(),

- `src/app/admin/users/actions.js`      lastLogin: user.lastLogin?.toISOString() || null,

- All tests passing (10 tests)      isAdmin: user.isAdmin || false,

      isSelf: user._id.toString() === session.user.id

---    }));



### Phase 6: Frontend Components (4-5 hours)    const totalPages = Math.ceil(totalRecords / pageSize);



**Goal**: Build React components for user table, filters, pagination, and actions.    return NextResponse.json({

      users: formattedUsers,

**Tests First** (2 hours):      pagination: {

1. Component test: `tests/components/UserTable.test.js`        page,

   - Renders table with user data        pageSize,

   - Shows all columns (name, email, dates, admin status, actions)        totalPages,

   - Highlights current user row        totalRecords

   - Formats dates correctly      },

   - Disables toggle/delete for self      sort: {

   - Sorts on column header click        field: sortBy,

        order: sortOrder

2. Component test: `tests/components/FilterBar.test.js`      },

   - Renders all filter inputs      filters: {

   - Debounces text inputs (300ms)        name: nameFilter,

   - Calls onChange with correct filters        email: emailFilter,

   - Shows clear filters button        adminStatus: adminFilter

      }

3. Component test: `tests/components/PaginationControls.test.js`    });

   - Renders page numbers  } catch (error) {

   - Disables previous on first page    console.error('Error fetching users:', error);

   - Disables next on last page    return NextResponse.json(

   - Shows page size selector      { error: 'Failed to retrieve users' },

   - Calls onChange with correct page      { status: 500 }

    );

4. Component test: `tests/components/AdminToggle.test.js`  }

   - Renders toggle button}

   - Disabled when isSelf=true```

   - Calls onToggle with userId

   - Shows loading state during operation**Test**:

   - Shows toast on success/error```powershell

# Start dev server

5. Component test: `tests/components/DeleteUserButton.test.js`npm run dev

   - Renders delete button

   - Disabled when isSelf=true# Test in browser or with curl

   - Opens confirmation dialogcurl "http://localhost:3000/api/admin/users?page=1&pageSize=10"

   - Calls onDelete after confirmation```

   - Shows loading state

   - Shows toast with deletion summary### 2.2 Toggle Admin & Delete User API

   - Shows retry button on error

**File**: `src/app/api/admin/users/[userId]/route.js`

6. Component test: `tests/components/ConfirmDialog.test.js`

   - Renders with title and message```javascript

   - Calls onConfirm when confirmedimport { NextResponse } from 'next/server';

   - Calls onCancel when canceledimport { getServerSession } from 'next-auth';

   - Closes on Escape keyimport { authOptions } from '@/lib/auth';

   - Traps focus within dialogimport dbConnect from '@/lib/db';

import User from '@/models/User';

**Implementation** (2-2.5 hours):import { cascadeDeleteUser } from '@/lib/utils/userCascadeDelete';

1. Create `src/app/admin/users/components/UserTable.js` (Client Component)

2. Create `src/app/admin/users/components/UserRow.js` (Client Component)export async function PATCH(request, { params }) {

3. Create `src/app/admin/users/components/FilterBar.js` (Client Component)  try {

4. Create `src/app/admin/users/components/PaginationControls.js` (Client Component)    const session = await getServerSession(authOptions);

5. Create `src/app/admin/users/components/AdminToggle.js` (Client Component)    if (!session) {

6. Create `src/app/admin/users/components/DeleteUserButton.js` (Client Component)      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

7. Create `src/app/admin/users/components/ConfirmDialog.js` (Client Component using Radix UI)    }

8. Create `src/hooks/useDebounce.js` - Custom debounce hook

    if (!session.user.isAdmin) {

**Deliverables**:      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

- 7 component files    }

- `src/hooks/useDebounce.js`

- All tests passing (30 tests)    const { userId } = params;



**Verification**:    // Prevent self-modification

```bash    if (session.user.id === userId) {

npm test tests/components      return NextResponse.json({ error: 'Cannot modify your own admin status' }, { status: 403 });

```    }



---    await dbConnect();



### Phase 7: Main Page Integration (2 hours)    const user = await User.findById(userId);

    if (!user) {

**Goal**: Integrate all components into the admin user management page.      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    }

**Tests First** (45 min):

1. Integration test: `tests/integration/pages/admin-users-page.test.js`    // Toggle admin status

   - Fetches and displays users on load    user.isAdmin = !user.isAdmin;

   - Filters update URL query params    await user.save();

   - Sort updates URL query params

   - Pagination updates URL query params    return NextResponse.json({

   - Toggle admin updates table      success: true,

   - Delete user removes from table      user: {

   - Loads faster than 2 seconds (1000 users mock)        id: user._id.toString(),

        isAdmin: user.isAdmin

**Implementation** (1 hour):      },

1. Create `src/app/admin/users/page.js` (Server Component)      message: 'Admin status updated successfully'

   - Fetch initial data server-side    });

   - Pass to Client Component wrapper  } catch (error) {

   - Handle URL query params (page, filters, sort)    console.error('Error toggling admin:', error);

    return NextResponse.json({ error: 'Failed to update admin status' }, { status: 500 });

2. Create `src/app/admin/users/UserManagementPage.js` (Client Component)  }

   - Manage client state (filters, sort, pagination)}

   - Integrate all child components

   - Handle user actions (toggle, delete)export async function DELETE(request, { params }) {

   - Update URL params on filter/sort/page change  try {

    const session = await getServerSession(authOptions);

**Deliverables**:    if (!session) {

- `src/app/admin/users/page.js`      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

- `src/app/admin/users/UserManagementPage.js`    }

- All tests passing (10 tests)

    if (!session.user.isAdmin) {

**Verification**:      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

```bash    }

npm test tests/integration/pages

npm run dev    const { userId } = params;

# Navigate to http://localhost:3000/admin/users

```    // Prevent self-deletion

    if (session.user.id === userId) {

---      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });

    }

### Phase 8: End-to-End Tests (2-3 hours)

    await dbConnect();

**Goal**: Verify complete user flows with Playwright.

    // Cascade delete

**Tests** (2-3 hours):    const result = await cascadeDeleteUser(userId);

1. E2E test: `tests/e2e/admin-user-view.spec.js` (US1)

   - Admin navigates to user management page    const summary = Object.entries(result.deletedCounts)

   - Table displays all users with correct columns      .map(([key, count]) => `${count} ${key}`)

   - Filters users by name      .join(', ');

   - Filters users by email

   - Filters users by admin status    return NextResponse.json({

   - Sorts by each column (asc/desc)      success: true,

   - Changes page size (10, 25, 50, 100)      deleted: {

   - Navigates between pages        userId,

   - Current admin row highlighted        deletedCounts: result.deletedCounts

   - Dates formatted correctly (dd.mm.yyyy HH:ii)      },

   - Page loads under 2 seconds      message: `User and related data deleted successfully. Deleted: ${summary}`

    });

2. E2E test: `tests/e2e/admin-toggle.spec.js` (US2)  } catch (error) {

   - Admin toggles another user to admin    console.error('Error deleting user:', error);

   - Success toast appears    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });

   - Table updates immediately  }

   - Audit log entry created}

   - Admin toggle disabled for self```

   - Click own toggle shows no effect

   - Session updates within 5 seconds (verify with second browser tab)---



3. E2E test: `tests/e2e/admin-delete.spec.js` (US3)## Phase 3: UI Components (6-8 hours)

   - Admin clicks delete button

   - Confirmation dialog appears### 3.1 Toast Notification Context

   - Canceling closes dialog without deleting

   - Confirming deletes user**File**: `src/contexts/ToastContext.js`

   - Toast shows deletion summary with counts

   - User removed from table```javascript

   - Related data deleted (verify in database)'use client';

   - Delete button disabled for self

   - Transaction rollback on error (mock database failure)import { createContext, useContext, useState, useCallback } from 'react';

   - Retry button appears on error

const ToastContext = createContext();

4. E2E test: `tests/e2e/admin-accessibility.spec.js`

   - Keyboard navigation works (Tab, Enter, Space, Escape)export function ToastProvider({ children }) {

   - Screen reader announces toasts  const [toasts, setToasts] = useState([]);

   - All buttons have ARIA labels

   - Table has proper semantic HTML  const addToast = useCallback((message, type = 'info', options = {}) => {

   - Dialog traps focus    const id = Date.now();

   - Lighthouse accessibility score ≥90    const toast = {

      id,

**Deliverables**:      message,

- `tests/e2e/admin-user-view.spec.js`      type, // 'success' | 'error' | 'info' | 'warning'

- `tests/e2e/admin-toggle.spec.js`      autoDismiss: options.autoDismiss !== false,

- `tests/e2e/admin-delete.spec.js`      dismissAfter: options.dismissAfter || 5000,

- `tests/e2e/admin-accessibility.spec.js`      action: options.action || null // { label, onClick }

- All tests passing (50+ assertions)    };



**Verification**:    setToasts(prev => [...prev, toast]);

```bash

npx playwright test tests/e2e/admin-user-view.spec.js    if (toast.autoDismiss) {

npx playwright test tests/e2e/admin-toggle.spec.js      setTimeout(() => {

npx playwright test tests/e2e/admin-delete.spec.js        removeToast(id);

npx playwright test tests/e2e/admin-accessibility.spec.js      }, toast.dismissAfter);

```    }



---    return id;

  }, []);

### Phase 9: Session Update Integration (1-2 hours)

  const removeToast = useCallback((id) => {

**Goal**: Implement real-time session update propagation (<5s requirement).    setToasts(prev => prev.filter(toast => toast.id !== id));

  }, []);

**Tests First** (30 min):

1. Integration test: `tests/integration/session-update.test.js`  return (

   - Toggling admin status triggers session update    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>

   - NextAuth JWT callback refreshes user data      {children}

   - Client-side polling detects changes      <ToastContainer />

   - Changes propagate within 5 seconds    </ToastContext.Provider>

  );

**Implementation** (1 hour):}

1. Update NextAuth configuration (`src/auth.config.js`)

   - Add JWT callback to inject updated `isAdmin`export function useToast() {

   - Handle `update` trigger  const context = useContext(ToastContext);

  if (!context) {

2. Update UserManagementPage component    throw new Error('useToast must be used within ToastProvider');

   - Call `update()` from `useSession` after successful toggle  }

   - Set up SWR polling with 2s interval  return context;

   - Display updated session state}



**Deliverables**:function ToastContainer() {

- Updated `src/auth.config.js`  const { toasts, removeToast } = useToast();

- Updated `src/app/admin/users/UserManagementPage.js`

- All tests passing (5 tests)  return (

    <div className="fixed bottom-4 right-4 z-50 space-y-2">

**Verification**:      {toasts.map(toast => (

```bash        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />

npm test tests/integration/session-update      ))}

# Manual test: Toggle user status in browser A, verify browser B updates within 5s    </div>

```  );

}

---

function Toast({ toast, onDismiss }) {

### Phase 10: Polish & Performance (1-2 hours)  const bgColor = {

    success: 'bg-green-500',

**Goal**: Final optimizations and production readiness.    error: 'bg-red-500',

    warning: 'bg-yellow-500',

**Tasks**:    info: 'bg-blue-500'

1. ✅ Add loading states for all async operations  }[toast.type] || 'bg-gray-500';

2. ✅ Add error boundaries

3. ✅ Optimize bundle size (lazy load components if needed)  return (

4. ✅ Add request deduplication for filters    <div className={`${bgColor} text-white px-4 py-3 rounded shadow-lg max-w-sm`}>

5. ✅ Verify performance targets met:      <div className="flex items-start justify-between">

   - User list loads <2s (1000 users)        <p className="text-sm">{toast.message}</p>

   - Toggle completes <1s        <button

   - Session updates <5s          onClick={() => onDismiss(toast.id)}

   - Filter response <1s          className="ml-4 text-white hover:text-gray-200"

6. ✅ Run Lighthouse audit (score ≥90 accessibility)          aria-label="Dismiss"

7. ✅ Verify WCAG 2.1 AA compliance        >

8. ✅ Update documentation          ✕

        </button>

**Deliverables**:      </div>

- Performance benchmarks documented      {toast.action && (

- Lighthouse report        <button

- WCAG compliance checklist          onClick={toast.action.onClick}

          className="mt-2 text-sm underline hover:no-underline"

**Verification**:        >

```bash          {toast.action.label}

npm run build        </button>

npm run start      )}

# Open Chrome DevTools > Lighthouse > Run audit    </div>

```  );

}

---```



## Testing Summary### 3.2 User Management Page



### Total Test Count (Estimated)**File**: `src/app/dashboard/users/page.js`



- **Unit Tests**: 30```javascript

  - Toast: 8'use client';

  - DateFormatter: 5

  - Services: 17import { useState, useEffect, useCallback } from 'react';

import { useSession } from 'next-auth/react';

- **Integration Tests**: 40import { useRouter } from 'next/navigation';

  - API Routes: 20 (OR Server Actions: 10)import { useToast } from '@/contexts/ToastContext';

  - Components: 10import AdminCheck from '@/components/AdminCheck';

  - Pages: 10import UserManagementTable from '@/components/admin/UserManagementTable';

import UserTableFilters from '@/components/admin/UserTableFilters';

- **E2E Tests**: 50+import Pagination from '@/components/admin/Pagination';

  - User Stories: 45

  - Accessibility: 5export default function UserManagementPage() {

  const { data: session, status } = useSession();

**Total**: ~120 tests  const router = useRouter();

  const { addToast } = useToast();

### Test Execution Time (Estimated)

  const [users, setUsers] = useState([]);

- Unit: ~5 seconds  const [loading, setLoading] = useState(true);

- Integration: ~30 seconds  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, totalPages: 1, totalRecords: 0 });

- E2E: ~3 minutes  const [sort, setSort] = useState({ field: 'registrationDate', order: 'desc' });

  const [filters, setFilters] = useState({ name: null, email: null, adminStatus: 'all' });

**Total**: ~4 minutes

  const fetchUsers = useCallback(async () => {

---    setLoading(true);

    try {

## Development Timeline      const queryParams = new URLSearchParams({

        page: pagination.page,

### Minimum Viable Product (MVP)        pageSize: pagination.pageSize,

        sortBy: sort.field,

**Duration**: 16 hours (2 days full-time)        sortOrder: sort.order,

        ...(filters.name && { nameFilter: filters.name }),

**Phases**: 0, 1, 2, 3, 4 (or 5), 6, 7, 8        ...(filters.email && { emailFilter: filters.email }),

        adminFilter: filters.adminStatus

**Outcome**: Fully functional admin user management with all 48 requirements met      });



### Production Ready      const response = await fetch(`/api/admin/users?${queryParams}`);

      if (!response.ok) throw new Error('Failed to fetch users');

**Duration**: 20 hours (2.5 days full-time)

      const data = await response.json();

**Phases**: All phases including 9 (session updates) and 10 (polish)      setUsers(data.users);

      setPagination(data.pagination);

**Outcome**: Optimized, polished, production-ready feature    } catch (error) {

      addToast('Failed to load users', 'error');

---    } finally {

      setLoading(false);

## Success Criteria Checklist    }

  }, [pagination.page, pagination.pageSize, sort, filters, addToast]);

Use this checklist to verify all success criteria (SC-001 to SC-011) are met:

  useEffect(() => {

- [ ] SC-001: User list loads <2s (1000 users) ✅ Lighthouse performance report    if (status === 'authenticated' && session?.user?.isAdmin) {

- [ ] SC-002: Locate user within 3 actions ✅ E2E test verification      fetchUsers();

- [ ] SC-003: Toggle completes <1s ✅ Performance benchmark    }

- [ ] SC-004: Session updates <5s ✅ Manual test with 2 browsers  }, [status, session, fetchUsers]);

- [ ] SC-005: 100% transaction integrity ✅ Integration test with rollback

- [ ] SC-006: 100% deletion summaries correct ✅ E2E test verification  const handleToggleAdmin = async (userId) => {

- [ ] SC-007: Zero self-action incidents ✅ E2E tests for disabled buttons + 403    try {

- [ ] SC-008: Lighthouse accessibility ≥90 ✅ Lighthouse report      const response = await fetch(`/api/admin/users/${userId}`, {

- [ ] SC-009: Full keyboard navigation ✅ E2E accessibility test        method: 'PATCH',

- [ ] SC-010: Responsive 320px-1920px ✅ Manual testing + Playwright viewport tests        headers: { 'Content-Type': 'application/json' },

- [ ] SC-011: 100% audit log coverage ✅ Integration tests verify logs created        body: JSON.stringify({ action: 'toggleAdmin' })

      });

---

      if (!response.ok) {

## Troubleshooting        const error = await response.json();

        throw new Error(error.error || 'Failed to toggle admin');

### Common Issues      }



**Issue**: MongoDB transactions failing      addToast('Admin status updated successfully', 'success');

- **Solution**: Verify MongoDB replica set is running. Single-node replica set sufficient for development.      fetchUsers();

- **Setup**: `rs.initiate()` in mongosh    } catch (error) {

      addToast(error.message, 'error');

**Issue**: Tests timing out    }

- **Solution**: Increase Jest timeout for integration/E2E tests  };

- **Config**: `jest.setTimeout(10000)` in setup file

  const handleDeleteUser = async (userId) => {

**Issue**: NextAuth session not updating    if (!confirm('Are you sure? This will permanently delete the user and all their data.')) {

- **Solution**: Verify JWT callback is configured correctly      return;

- **Debug**: Check `next-auth.session-token` cookie refresh    }



**Issue**: Dates showing wrong timezone    try {

- **Solution**: Verify browser timezone detection is enabled      const response = await fetch(`/api/admin/users/${userId}`, {

- **Test**: `Intl.DateTimeFormat().resolvedOptions().timeZone`        method: 'DELETE'

      });

**Issue**: Toast notifications not announcing

- **Solution**: Verify `aria-live` region is present in DOM before toast renders      if (!response.ok) {

- **Fix**: Render ToastContainer portal early in app lifecycle        const error = await response.json();

        throw new Error(error.error || 'Failed to delete user');

---      }



## Next Steps After Completion      const result = await response.json();

      addToast(result.message, 'success');

1. ✅ Run full test suite: `npm test && npx playwright test`      fetchUsers();

2. ✅ Update documentation: Add user guide for admin user management    } catch (error) {

3. ✅ Deploy to staging environment      addToast(error.message, 'error', {

4. ✅ Conduct manual QA (all 3 user stories)        action: {

5. ✅ Get stakeholder approval          label: 'Retry',

6. ✅ Deploy to production          onClick: () => handleDeleteUser(userId)

7. ✅ Monitor audit logs for first week        }

8. ✅ Gather user feedback      });

9. ✅ Plan next iteration (e.g., bulk operations, user activity dashboard)    }

  };

---

  return (

## References    <AdminCheck>

      <div className="container mx-auto px-4 py-8">

- **Spec**: `specs/006-admin-user-management/spec.md`        <h1 className="text-3xl font-bold mb-6">User Management</h1>

- **Research**: `specs/006-admin-user-management/research.md`

- **Data Model**: `specs/006-admin-user-management/data-model.md`        <UserTableFilters

- **API Contracts**: `specs/006-admin-user-management/contracts/api-users.yaml`          filters={filters}

- **Constitution**: `.specify/memory/constitution.md`          onFiltersChange={setFilters}

        />

---

        <UserManagementTable

**Ready to begin**: Start with Phase 0 (Database Setup) and work through phases sequentially. Remember: **Tests first, implementation second** (TDD non-negotiable).          users={users}

          loading={loading}
          sort={sort}
          onSortChange={setSort}
          onToggleAdmin={handleToggleAdmin}
          onDeleteUser={handleDeleteUser}
        />

        <Pagination
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))}
        />
      </div>
    </AdminCheck>
  );
}
```

---

## Phase 4: Testing (2-3 hours)

### 4.1 API Route Tests

**File**: `tests/integration/api/admin/users.test.js`

```javascript
import { GET, PATCH, DELETE } from '@/app/api/admin/users/[userId]/route';

describe('Admin User Management API', () => {
  describe('GET /api/admin/users', () => {
    it('should return paginated users for admin', async () => {
      // Test implementation
    });

    it('should filter users by name', async () => {
      // Test implementation
    });

    it('should return 403 for non-admin users', async () => {
      // Test implementation
    });
  });

  describe('PATCH /api/admin/users/[userId]', () => {
    it('should toggle admin status', async () => {
      // Test implementation
    });

    it('should prevent self-modification', async () => {
      // Test implementation
    });
  });

  describe('DELETE /api/admin/users/[userId]', () => {
    it('should cascade delete user and related data', async () => {
      // Test implementation
    });

    it('should prevent self-deletion', async () => {
      // Test implementation
    });
  });
});
```

### 4.2 Component Tests

**File**: `tests/components/admin/UserManagementTable.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import UserManagementTable from '@/components/admin/UserManagementTable';

describe('UserManagementTable', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      registrationDate: '2024-01-15T10:30:00.000Z',
      lastLogin: '2024-03-20T14:22:10.000Z',
      isAdmin: true,
      isSelf: true
    }
  ];

  it('should render user list', () => {
    render(<UserManagementTable users={mockUsers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should disable admin toggle for current user', () => {
    render(<UserManagementTable users={mockUsers} />);
    const toggleButton = screen.getByRole('button', { name: /toggle admin/i });
    expect(toggleButton).toBeDisabled();
  });
});
```

### 4.3 E2E Tests

**File**: `tests/e2e/admin-user-management.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Admin User Management', () => {
  test('admin can view user list', async ({ page }) => {
    await page.goto('/auth/signin');
    // Login as admin
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard/users');
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();
  });

  test('admin can toggle user admin status', async ({ page }) => {
    // Navigate to user management
    await page.goto('/dashboard/users');
    
    // Click toggle button
    await page.click('[data-testid="toggle-admin-btn"]');
    
    // Verify toast notification
    await expect(page.locator('.toast')).toContainText('Admin status updated');
  });
});
```

---

## Phase 5: Deployment

### 5.1 Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] E2E tests passing (`npx playwright test`)
- [ ] Database indexes created in production MongoDB
- [ ] Environment variables set in Vercel
- [ ] Admin user exists in production database

### 5.2 Deployment Steps

```powershell
# Run full test suite
npm test

# Run E2E tests
npx playwright test

# Commit changes
git add .
git commit -m "feat: Complete admin user management feature"

# Merge to master
git checkout master
git merge 006-admin-user-management --no-ff

# Push to GitHub (triggers Vercel deployment)
git push origin master
```

### 5.3 Post-Deployment Verification

1. Navigate to `/dashboard/users` in production
2. Verify user list loads within 2 seconds
3. Test filtering by name and email
4. Test sorting by each column
5. Test admin toggle (non-self user)
6. Test user deletion (non-self user)
7. Verify cascade deletion completed
8. Check browser console for errors
9. Test on mobile device (responsive layout)

---

## Troubleshooting

### Issue: "Cannot modify your own admin status"

**Cause**: Attempting to toggle admin status for current user  
**Solution**: This is expected behavior per FR-013. Toggle another user's status instead.

### Issue: Session not updating after admin toggle

**Cause**: NextAuth session cache not refreshed  
**Solution**: Add `update()` call from useSession hook, or wait 5 seconds for automatic refresh.

### Issue: Cascade delete fails with transaction error

**Cause**: MongoDB not configured for transactions (requires replica set)  
**Solution**: For development, use MongoDB Atlas which supports transactions. For local dev, wrap deletes in try-catch without transaction.

### Issue: Page load time > 2 seconds

**Cause**: Missing indexes on User collection  
**Solution**: Run `scripts/create-user-management-indexes.js`

---

## Summary

**Phases**:
1. ✅ Database Setup (30 mins) - Indexes + cascade delete utility
2. ✅ API Routes (4-6 hours) - List, toggle, delete endpoints
3. ✅ UI Components (6-8 hours) - Page, table, filters, toasts
4. ✅ Testing (2-3 hours) - Unit, integration, E2E tests
5. ✅ Deployment - Merge, push, verify

**Total Time**: 12-16 hours

**Key Files Created**:
- `src/app/api/admin/users/route.js` (List API)
- `src/app/api/admin/users/[userId]/route.js` (Toggle & Delete API)
- `src/app/dashboard/users/page.js` (UI Page)
- `src/lib/utils/userCascadeDelete.js` (Cascade delete utility)
- `src/contexts/ToastContext.js` (Toast notifications)
- Component files (UserManagementTable, etc.)
- Test files (unit, integration, E2E)

**Next Steps**: Run `/speckit.tasks` to generate detailed task breakdown for implementation.
