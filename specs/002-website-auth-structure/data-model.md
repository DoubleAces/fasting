# Data Model: Website Structure & Authentication

**Branch**: 002-website-auth-structure  
**Status**: Complete  
**Date**: 2025-01-XX

## Overview

This document defines the data models (Mongoose schemas) for implementing authentication, user management, FAQ functionality, and updates to existing models.

## New Entities

### User

**Purpose**: Store user account information, credentials, and profile data.

**Schema**:

```javascript
{
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  password: {
    type: String,
    required: function() {
      return this.authMethod === 'email';
    },
    minlength: 60 // bcrypt hash length
  },
  
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    required: true,
    default: 'email'
  },
  
  // OAuth Data (for Google OAuth)
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Profile
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  picture: {
    type: String, // URL to profile picture
    default: null
  },
  
  // Session Preferences
  rememberMe: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  registrationDate: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `email`: Unique index (enforced by schema)
- `googleId`: Sparse unique index (only for OAuth users)
- `authMethod`: For querying users by authentication method
- `isActive`: For filtering active users

**Validation Rules**:
- Email must be valid format (regex)
- Password required only for email authentication
- Password must be bcrypt hash (60 chars) - validated before save
- Name required (1-100 chars)
- authMethod must be 'email' or 'google'

**Methods**:
```javascript
// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.authMethod !== 'email') {
    throw new Error('Password comparison not available for OAuth users');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

userSchema.statics.hashPassword = async function(password) {
  return bcrypt.hash(password, 10);
};
```

**Hooks**:
```javascript
// Pre-save: hash password if modified
userSchema.pre('save', async function(next) {
  if (this.authMethod === 'email' && this.isModified('password')) {
    // Password should already be hashed, but verify
    if (this.password.length < 60) {
      throw new Error('Password must be hashed before saving');
    }
  }
  this.updatedAt = new Date();
  next();
});
```

---

### PasswordResetToken

**Purpose**: Store time-limited, one-time-use tokens for password reset functionality.

**Schema**:

```javascript
{
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  used: {
    type: Boolean,
    default: false
  },
  
  usedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    expires: 3600 // TTL index: auto-delete after 1 hour
  }
}
```

**Indexes**:
- `token`: Unique index for fast lookup
- `userId`: For finding user's reset tokens
- `expiresAt`: For querying valid tokens
- `createdAt`: TTL index (auto-delete after 1 hour)

**Validation Rules**:
- Token must be 64-character hex string (crypto.randomBytes(32))
- expiresAt must be in the future when created
- userId must reference valid User document

**Methods**:
```javascript
// Static methods
passwordResetTokenSchema.statics.generateToken = async function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  return this.create({
    token,
    userId,
    expiresAt
  });
};

passwordResetTokenSchema.statics.validateToken = async function(token) {
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
  
  if (!resetToken) {
    return null;
  }
  
  return resetToken;
};

// Instance methods
passwordResetTokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};
```

---

### FAQItem

**Purpose**: Store frequently asked questions with answers, categories, and search metadata.

**Schema**:

```javascript
{
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  category: {
    type: String,
    required: true,
    enum: ['Getting Started', 'Fasting', 'Account', 'Technical', 'General'],
    index: true
  },
  
  order: {
    type: Number,
    default: 0,
    index: true
  },
  
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes**:
- `category`: For filtering by category
- `order`: For sorting within categories
- `isPublished`: For filtering published items
- Text index on `question`, `answer`, `keywords` (for search)

**Validation Rules**:
- Question: 1-200 characters
- Answer: 1-2000 characters
- Category must be one of predefined values
- Keywords are optional, lowercase

**Methods**:
```javascript
// Static methods
faqItemSchema.statics.searchFAQs = function(query) {
  if (!query || query.trim() === '') {
    return this.find({ isPublished: true }).sort({ category: 1, order: 1 });
  }
  
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    isPublished: true,
    $or: [
      { question: searchRegex },
      { answer: searchRegex },
      { keywords: searchRegex }
    ]
  }).sort({ category: 1, order: 1 });
};

faqItemSchema.statics.getByCategory = function(category) {
  return this.find({ category, isPublished: true }).sort({ order: 1 });
};
```

**Hooks**:
```javascript
faqItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
```

---

## Updated Entities

### Entry (Updated)

**Changes**: Add user reference to associate entries with users.

**New Fields**:

```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}
```

**Updated Indexes**:
- Add compound index: `{ userId: 1, startTime: -1 }` for efficient user entry queries

**Migration**: Existing entries without userId will need to be handled (either assigned to a default user or marked as orphaned).

---

### Settings (Updated)

**Changes**: Add user reference to associate settings with users.

**New Fields**:

```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  }
}
```

**Updated Indexes**:
- `userId`: Unique index (one settings document per user)

**Migration**: Existing settings without userId will need to be assigned to users during migration.

---

## Relationships

### User → Entry (One-to-Many)
- One user can have many fasting entries
- Each entry belongs to exactly one user
- Cascade delete: When user deleted, entries should be soft-deleted or transferred

### User → Settings (One-to-One)
- One user has exactly one settings document
- Each settings document belongs to exactly one user
- Cascade delete: When user deleted, settings should be deleted

### User → PasswordResetToken (One-to-Many)
- One user can have multiple reset tokens (historical)
- Only one valid (unused, non-expired) token should exist at a time
- Cascade delete: When user deleted, reset tokens should be deleted
- Auto-cleanup: TTL index removes tokens after 1 hour

### FAQItem (Standalone)
- No direct relationships to User
- Managed by admins (out of scope for initial release)

---

## Data Integrity Rules

1. **User Email Uniqueness**: 
   - Email must be unique across all users
   - Case-insensitive comparison (stored as lowercase)

2. **OAuth ID Uniqueness**:
   - googleId must be unique if present (sparse index)
   - Only required for OAuth users

3. **Password Requirements**:
   - Only required for email authentication
   - Must be bcrypt hash (60 characters)
   - Never store plaintext passwords

4. **Session Isolation**:
   - Users can only access their own entries and settings
   - Enforced at API level (not database level)

5. **Reset Token Security**:
   - Tokens are cryptographically secure (32 bytes random)
   - One-time use only (marked as used)
   - 1-hour expiration (enforced by expiresAt + TTL index)

6. **FAQ Data Quality**:
   - Published FAQs must have valid question and answer
   - Categories are restricted to predefined values
   - Order determines display sequence within categories

---

## Migration Strategy

### Phase 1: Add User Model
1. Create User collection
2. Create indexes
3. Test authentication flow with new users

### Phase 2: Update Entry and Settings Models
1. Add userId field to schemas (not required initially)
2. Create migration script to:
   - Create default admin/system user
   - Assign all existing entries/settings to default user
3. Make userId required after migration
4. Add compound indexes

### Phase 3: Add Supporting Models
1. Create PasswordResetToken collection
2. Create FAQItem collection
3. Seed initial FAQ data

### Phase 4: Data Validation
1. Verify all users have valid email addresses
2. Verify all entries have valid userId references
3. Verify all settings have valid userId references
4. Check index performance

---

## Performance Considerations

1. **Indexing Strategy**:
   - Email lookups: Single-field unique index on `users.email`
   - User entries: Compound index on `entries.userId` + `entries.startTime`
   - FAQ search: Text index on `faqItems.question`, `answer`, `keywords`
   - Reset tokens: TTL index for automatic cleanup

2. **Query Optimization**:
   - Always query entries by userId (uses index)
   - Limit FAQ results to published items only
   - Use projection to exclude sensitive fields (password hash)

3. **Caching Opportunities**:
   - FAQ items (rarely change, can cache for 1 hour)
   - User settings (cache per user session)

4. **Scale Considerations**:
   - Users: Expected 100-1000 initially, plan for 10,000+
   - Entries: 10-100 per user, millions total
   - FAQ Items: <100 total
   - Reset Tokens: Auto-cleanup prevents unbounded growth

---

## Security Notes

1. **Password Storage**:
   - NEVER store plaintext passwords
   - Use bcrypt with minimum 10 rounds
   - Hash before saving to database

2. **Token Security**:
   - Use crypto.randomBytes(32) for reset tokens
   - 1-hour expiration strictly enforced
   - One-time use only

3. **User Enumeration Prevention**:
   - Don't reveal if email exists during password reset
   - Same response time for existing/non-existing emails

4. **Data Access Control**:
   - Users can only access their own data
   - Enforce userId filtering at API level
   - Never trust client-provided userId

---

## Next Steps

1. ✅ Data model defined
2. ⏭ Generate API contracts (contracts/)
3. ⏭ Generate quickstart guide (quickstart.md)
4. ⏭ Update agent context
5. ⏭ Proceed to implementation (after /speckit.tasks)
