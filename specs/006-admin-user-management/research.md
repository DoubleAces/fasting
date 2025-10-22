# Research: Admin User Management

**Feature**: 006-admin-user-management  
**Date**: October 22, 2025  
**Status**: Complete

## Research Areas

### 1. Server-Side Pagination with MongoDB/Mongoose

**Decision**: Use MongoDB aggregation pipeline with `$skip` and `$limit` for server-side pagination

**Rationale**:
- Mongoose `find()` with `.skip()` and `.limit()` is simple but inefficient for large offsets
- Aggregation pipeline allows combining filtering, sorting, and pagination in a single query
- Can use `$facet` to get both paginated results and total count in one query
- Supports complex text search with `$match` for name/email filters
- Better performance with proper indexes on sort fields

**Alternatives Considered**:
- **Cursor-based pagination**: More scalable but breaks page number navigation required by spec
- **Offset-based with find()**: Simpler API but degrades with large offsets
- **MongoDB Atlas Search**: Overkill for simple text matching, adds dependency

**Implementation Pattern**:
```javascript
const pipeline = [
  { $match: { /* filters */ } },
  { $sort: { /* sort field */ } },
  { $facet: {
    data: [{ $skip: offset }, { $limit: pageSize }],
    total: [{ $count: 'count' }]
  }}
];
```

**Required Indexes**:
- `{ name: 1 }` - For name filtering and sorting
- `{ email: 1 }` - For email filtering and sorting (unique index already exists)
- `{ isAdmin: 1 }` - For admin status filtering
- `{ createdAt: 1 }` - For registration date sorting
- `{ lastLogin: 1 }` - For last login sorting
- Compound index: `{ isAdmin: 1, createdAt: -1 }` - Common filter+sort combination

---

### 2. Real-Time Session Updates (5-Second Propagation)

**Decision**: Use NextAuth.js session callback with JWT strategy + client-side polling with SWR

**Rationale**:
- NextAuth.js v5 uses JWT tokens by default - session updates require token refresh
- Session callback can inject updated `isAdmin` status into JWT on each request
- Client-side polling with SWR `refreshInterval: 2000` ensures <5s propagation
- No need for WebSocket infrastructure (simpler, meets requirement)
- SWR handles deduplication, caching, and error recovery

**Alternatives Considered**:
- **WebSockets**: Real-time but adds complexity, infrastructure overhead
- **Server-Sent Events (SSE)**: One-way communication sufficient but requires special server setup
- **Database session strategy**: Avoids JWT refresh issue but adds database load, slower performance

**Implementation Pattern**:
```javascript
// In NextAuth config
callbacks: {
  async jwt({ token, trigger }) {
    if (trigger === 'update') {
      const user = await User.findById(token.sub);
      token.isAdmin = user.isAdmin;
    }
    return token;
  }
}

// Client-side polling
const { data: session } = useSession({
  refetchInterval: 2000, // Poll every 2 seconds
  refetchOnWindowFocus: true
});
```

**Trigger Mechanism**: After admin toggle succeeds, call `update()` from `useSession()` hook to force JWT refresh

---

### 3. Custom Toast Notification System (No External Library)

**Decision**: Build React Context + Portal-based toast system with Tailwind CSS animations

**Rationale**:
- Spec requires no external library (assumption #12)
- React Context provides global notification state
- React Portal renders toasts outside component hierarchy (positioning)
- Tailwind CSS animations for enter/exit transitions
- Stack multiple notifications with fixed positioning
- Screen reader announcements via ARIA live regions

**Alternatives Considered**:
- **react-hot-toast**: Popular library but violates "no external library" requirement
- **react-toastify**: Same violation
- **Inline notifications**: Doesn't meet "non-blocking" requirement

**Implementation Pattern**:
```javascript
// Context
const ToastContext = createContext();

// Provider with state management
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type, options) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, ...options }]);
    if (type === 'success' && !options.persistent) {
      setTimeout(() => removeToast(id), 5000);
    }
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Portal-based container
function ToastContainer({ toasts, onRemove }) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2" role="region" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>,
    document.body
  );
}
```

**Accessibility Requirements**:
- `role="region" aria-live="polite"` for screen reader announcements
- `role="alert"` for error toasts (assertive)
- Keyboard dismissal with Escape key
- Focus management for retry buttons

---

### 4. Atomic Cascade Deletion with MongoDB Transactions

**Decision**: Use MongoDB sessions with multi-document transactions + Mongoose transaction helper

**Rationale**:
- MongoDB replica set required (already in tech stack per assumption #4)
- Mongoose provides `startSession()` and transaction helpers
- All-or-nothing guarantee prevents orphaned data
- Can delete from multiple collections in single transaction
- Automatic rollback on error preserves data integrity

**Alternatives Considered**:
- **Application-level rollback**: Complex error handling, race conditions, not truly atomic
- **Database triggers**: Not supported in MongoDB, would require different database
- **Soft deletes**: Doesn't meet requirement (permanent deletion specified)

**Implementation Pattern**:
```javascript
async function deleteUserWithCascade(userId, sessionUserId) {
  if (userId === sessionUserId) {
    throw new Error('Cannot delete own account');
  }
  
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Delete in specific order to handle references
      const fastingCount = await FastingEntry.deleteMany({ userId }, { session });
      const settingsCount = await UserSettings.deleteMany({ userId }, { session });
      const tokenCount = await PasswordResetToken.deleteMany({ userId }, { session });
      const logCount = await SecurityLog.deleteMany({ userId }, { session });
      const userResult = await User.deleteOne({ _id: userId }, { session });
      
      if (userResult.deletedCount === 0) {
        throw new Error('User not found');
      }
      
      // Create audit log within same transaction
      await AuditLog.create([{
        action: 'DELETE_USER',
        performedBy: sessionUserId,
        targetUser: userId,
        details: {
          fastingEntries: fastingCount.deletedCount,
          settings: settingsCount.deletedCount,
          tokens: tokenCount.deletedCount,
          logs: logCount.deletedCount
        }
      }], { session });
      
      return {
        userId,
        counts: {
          fastingEntries: fastingCount.deletedCount,
          settings: settingsCount.deletedCount,
          tokens: tokenCount.deletedCount,
          logs: logCount.deletedCount
        }
      };
    });
  } catch (error) {
    // Transaction automatically rolls back on error
    throw error;
  } finally {
    await session.endSession();
  }
}
```

**Transaction Timeout**: Default 60 seconds sufficient per spec edge case (30s mentioned as reasonable)

---

### 5. Server-Side Filtering with Text Search Performance

**Decision**: Use MongoDB regex with indexes + case-insensitive collation

**Rationale**:
- Spec requires partial text matching for name/email (FR-010, FR-011)
- Regex pattern `/searchTerm/i` provides case-insensitive partial match
- Indexes support regex queries starting with `^` but spec doesn't require this constraint
- Collation `{ locale: 'en', strength: 2 }` improves case-insensitive performance
- For 1000 users, regex performance acceptable without full-text search

**Alternatives Considered**:
- **MongoDB Full-Text Search**: Overkill for simple contains search, adds index overhead
- **MongoDB Atlas Search**: Cloud-only feature, not portable
- **Client-side filtering**: Violates server-side requirement (FR-013)

**Implementation Pattern**:
```javascript
const buildFilter = (nameSearch, emailSearch, adminFilter) => {
  const filter = {};
  
  if (nameSearch) {
    filter.name = { $regex: nameSearch, $options: 'i' };
  }
  
  if (emailSearch) {
    filter.email = { $regex: emailSearch, $options: 'i' };
  }
  
  if (adminFilter === 'admin') {
    filter.isAdmin = true;
  } else if (adminFilter === 'non-admin') {
    filter.isAdmin = false;
  }
  // 'all' = no filter
  
  return filter;
};
```

**Optimization**: Consider `$text` index if user base grows beyond 10,000 users

---

### 6. Debouncing Filter Inputs (300ms)

**Decision**: Use React custom hook with `useDebounce` + AbortController for request cancellation

**Rationale**:
- Spec requires 300ms debounce to reduce server load (assumption #11)
- Custom hook reusable across FilterBar inputs
- AbortController cancels in-flight requests when new input arrives
- Prevents race conditions (slower request returning after faster one)
- Maintains <1s filter response requirement (FR-015)

**Alternatives Considered**:
- **lodash.debounce**: External dependency (prefer built-in solution)
- **Throttling**: Doesn't eliminate requests, just limits frequency
- **No debouncing**: Excessive server load, poor UX with every keystroke

**Implementation Pattern**:
```javascript
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// In component
const [nameFilter, setNameFilter] = useState('');
const debouncedName = useDebounce(nameFilter, 300);

useEffect(() => {
  const controller = new AbortController();
  fetchUsers({ name: debouncedName, signal: controller.signal });
  return () => controller.abort();
}, [debouncedName]);
```

---

### 7. Accessibility: Keyboard Navigation and ARIA

**Decision**: Use semantic HTML + Radix UI primitives (headless) for complex components + custom focus management

**Rationale**:
- Semantic HTML (`<table>`, `<button>`, `<dialog>`) provides baseline accessibility
- Radix UI Dialog primitive handles focus trapping, Escape key, backdrop click
- Radix UI ToggleGroup for admin toggle provides keyboard support
- Custom focus management for toast dismiss (Escape key)
- ARIA live regions for toast announcements (FR-040)
- Keyboard shortcuts: Tab, Enter, Space, Escape (FR-046)

**Alternatives Considered**:
- **Full custom implementation**: High effort, easy to miss edge cases
- **Headless UI**: Good alternative but team may prefer Radix UI patterns
- **Material-UI**: Too opinionated for design, larger bundle size

**Implementation Pattern**:
```javascript
// Dialog with Radix UI
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger asChild>
    <button>Delete User</button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Dialog.Title>Confirm Deletion</Dialog.Title>
      <Dialog.Description>This action cannot be undone</Dialog.Description>
      {/* Action buttons */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Focus management for table
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && activeDialog) {
      closeDialog();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [activeDialog]);
```

**Testing Requirements**: Playwright tests must verify keyboard navigation for all user stories

---

### 8. Date Formatting (dd.mm.yyyy HH:ii) with Timezone Support

**Decision**: Use native JavaScript `Intl.DateTimeFormat` API for timezone-aware formatting

**Rationale**:
- Spec requires browser's local timezone (FR-002)
- `Intl.DateTimeFormat` respects user's system timezone automatically
- No external library needed (date-fns, moment would add bundle size)
- Supports custom format patterns
- Edge case: null dates handled gracefully (sort behavior defined in spec)

**Alternatives Considered**:
- **date-fns**: Popular but adds 2.9KB gzipped, not needed for simple formatting
- **moment.js**: Deprecated and large bundle size
- **dayjs**: Smaller alternative but still external dependency

**Implementation Pattern**:
```javascript
function formatDate(dateString) {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  
  // Format: dd.mm.yyyy HH:ii
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value;
  
  return `${get('day')}.${get('month')}.${get('year')} ${get('hour')}:${get('minute')}`;
}

// Usage
formatDate('2025-10-22T14:30:00Z') // "22.10.2025 14:30" (in user's timezone)
```

**Edge Cases**:
- Null/undefined dates: Display "Never" for last login
- Invalid dates: Display "Invalid date" with error logging
- Timezone abbreviations: Not shown (not required by spec)

---

### 9. Self-Modification Protection (UI + Server Validation)

**Decision**: Dual-layer protection with disabled UI controls + server-side 403 validation

**Rationale**:
- UI layer disables buttons when `user.id === session.user.id` (UX feedback)
- Server layer validates `userId !== session.user.id` before mutations (security)
- Returns HTTP 403 Forbidden with clear error message
- Prevents API manipulation bypassing UI
- Audit log records attempted violations

**Alternatives Considered**:
- **UI-only protection**: Insecure, easily bypassed
- **Server-only protection**: Poor UX, user sees error after action
- **Database constraint**: Not applicable (legitimate to have one admin)

**Implementation Pattern**:
```javascript
// Client: Disable UI
<button 
  disabled={user.id === session.user.id}
  onClick={() => toggleAdmin(user.id)}
  aria-label={user.id === session.user.id ? "Cannot modify own admin status" : "Toggle admin status"}
>
  Toggle Admin
</button>

// Server: Validate
export async function toggleAdminAction(userId) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  if (userId === session.user.id) {
    // Log attempted violation
    await AuditLog.create({
      action: 'SELF_MODIFICATION_ATTEMPT',
      performedBy: session.user.id,
      targetUser: userId,
      blocked: true
    });
    
    return { error: 'Cannot modify own admin status', status: 403 };
  }
  
  // Proceed with toggle...
}
```

---

### 10. Audit Logging Schema and Retention

**Decision**: New AuditLog model with structured fields + indefinite retention (deletable via separate admin tool)

**Rationale**:
- Spec requires audit logs for admin actions (FR-042, FR-043)
- Separate collection from SecurityLog (different purpose: admin actions vs security events)
- Structured schema for queryability (who, what, when, outcome)
- Includes blocked attempts (self-modification) for security analysis
- Retention policy deferred to separate admin tool (out of scope for this feature)

**Schema Design**:
```javascript
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['TOGGLE_ADMIN', 'DELETE_USER', 'SELF_MODIFICATION_ATTEMPT', 'SELF_DELETION_ATTEMPT'],
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
  oldValue: mongoose.Schema.Types.Mixed,  // For toggles: { isAdmin: false }
  newValue: mongoose.Schema.Types.Mixed,  // For toggles: { isAdmin: true }
  details: mongoose.Schema.Types.Mixed,   // For deletions: { fastingEntries: 47, ... }
  blocked: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: String,
  userAgent: String
});
```

**Future Enhancement**: Admin audit log viewer (separate feature)

---

## Summary

All research areas resolved. No NEEDS CLARIFICATION items remaining. Key technical decisions:

1. **Pagination**: MongoDB aggregation with `$facet` for data + count
2. **Session Updates**: NextAuth JWT refresh + SWR polling (2s interval)
3. **Toast System**: React Context + Portal with Tailwind animations
4. **Transactions**: Mongoose sessions for atomic cascade deletion
5. **Text Search**: MongoDB regex with case-insensitive collation
6. **Debouncing**: Custom hook with 300ms delay + AbortController
7. **Accessibility**: Semantic HTML + Radix UI primitives + ARIA live regions
8. **Date Formatting**: Native `Intl.DateTimeFormat` for timezone support
9. **Self-Protection**: Dual-layer (UI disabled + server 403 validation)
10. **Audit Logging**: New AuditLog model with structured schema

**Required Database Indexes**:
- User: `{ name: 1 }`, `{ email: 1 }` (unique), `{ isAdmin: 1 }`, `{ createdAt: 1 }`, `{ lastLogin: 1 }`, `{ isAdmin: 1, createdAt: -1 }` (compound)
- AuditLog: `{ action: 1 }`, `{ performedBy: 1 }`, `{ targetUser: 1 }`, `{ timestamp: 1 }`

**Ready for Phase 1**: Data model design and API contract generation.
