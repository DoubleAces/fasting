/**
 * User Model
 * 
 * Stores user account information, credentials, and profile data for authentication.
 * Supports both email/password authentication and OAuth (Google) authentication.
 * 
 * Schema Fields:
 * - email: Unique email address (lowercase, validated)
 * - password: Hashed password (bcrypt, required for email auth)
 * - authMethod: 'email' or 'google'
 * - googleId: Unique Google OAuth ID (sparse index)
 * - name: User's display name
 * - picture: Profile picture URL
 * - rememberMe: Session preference
 * - registrationDate: Account creation timestamp
 * - lastLogin: Last login timestamp
 * - isActive: Account active status
 * 
 * Features:
 * - Bcrypt password hashing (minimum 10 rounds)
 * - Email format validation with regex
 * - Conditional password requirement (only for email auth)
 * - Unique indexes on email and googleId
 * - Instance methods: comparePassword, updateLastLogin
 * - Static methods: findByEmail, hashPassword
 * - Automatic timestamp updates
 * 
 * Security:
 * - Passwords must be pre-hashed before saving (60 char bcrypt hash)
 * - OAuth users don't require passwords
 * - Sparse index on googleId (only for OAuth users)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================

    /**
     * Email address (unique, required)
     * - Stored in lowercase for case-insensitive matching
     * - Validated with regex pattern
     * - Indexed for fast lookups
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    /**
     * Password (bcrypt hash, 60 characters)
     * - Required only for email/password authentication
     * - Must be pre-hashed with bcrypt before saving
     * - Never store plaintext passwords
     */
    password: {
      type: String,
      required: function () {
        return this.authMethod === 'email';
      },
      minlength: [60, 'Password must be a bcrypt hash (60 characters)'],
      select: false, // Don't include in queries by default
    },

    /**
     * Authentication method
     * - 'email': Email/password authentication
     * - 'google': Google OAuth authentication
     */
    authMethod: {
      type: String,
      enum: {
        values: ['email', 'google'],
        message: 'Authentication method must be either email or google',
      },
      required: [true, 'Authentication method is required'],
      default: 'email',
    },

    /**
     * Google OAuth ID (unique, sparse index)
     * - Only set for Google OAuth users
     * - Sparse index: only users with googleId are indexed
     */
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },

    // ============================================================================
    // PROFILE
    // ============================================================================

    /**
     * User's display name
     * - Stored as provided (preserves capitalization)
     * - Whitespace trimmed
     * - Maximum 100 characters
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    /**
     * Profile picture URL
     * - Typically from OAuth provider (Google)
     * - Can be null for email/password users
     */
    picture: {
      type: String,
      default: null,
    },

    // ============================================================================
    // SESSION PREFERENCES
    // ============================================================================

    /**
     * Remember me preference
     * - true: Extended session (90 days)
     * - false: Standard session (30 days)
     */
    rememberMe: {
      type: Boolean,
      default: false,
    },

    // ============================================================================
    // METADATA
    // ============================================================================

    /**
     * Registration date (immutable)
     * - Set once on account creation
     * - Cannot be modified after creation
     */
    registrationDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    /**
     * Last login timestamp
     * - Updated each time user logs in
     * - Used for session tracking and analytics
     */
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    /**
     * Account active status
     * - true: Account is active and can log in
     * - false: Account is deactivated (soft delete)
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active users
    },

    /**
     * Created at timestamp (automatic)
     * - Set by Mongoose timestamps option
     * - Immutable after creation
     */
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    /**
     * Updated at timestamp (automatic)
     * - Updated by Mongoose timestamps option
     * - Updates on any document modification
     */
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatic timestamps
    timestamps: true,

    // Collection name
    collection: 'users',
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// Compound index for authentication queries
userSchema.index({ email: 1, isActive: 1 });

// Index for filtering by authentication method
userSchema.index({ authMethod: 1 });

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Compare password with hashed password
 * 
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * @throws {Error} If called on OAuth user (no password)
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' }).select('+password');
 * const isMatch = await user.comparePassword('plainPassword123');
 * if (isMatch) {
 *   console.log('Password is correct');
 * }
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.authMethod !== 'email') {
    throw new Error('Password comparison not available for OAuth users');
  }

  if (!this.password) {
    throw new Error('Password not loaded. Use .select("+password") in query');
  }

  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update last login timestamp
 * 
 * @returns {Promise<User>} Updated user document
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' });
 * await user.updateLastLogin();
 */
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find active user by email
 * 
 * @param {string} email - Email address (case-insensitive)
 * @returns {Promise<User|null>} User document or null if not found
 * 
 * @example
 * const user = await User.findByEmail('user@example.com');
 * if (user) {
 *   console.log('User found:', user.name);
 * }
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
};

/**
 * Hash password with bcrypt
 * 
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Bcrypt hash (60 characters)
 * @throws {Error} If password is empty or hashing fails
 * 
 * @example
 * const hashedPassword = await User.hashPassword('mySecurePassword123');
 * const user = await User.create({
 *   email: 'user@example.com',
 *   password: hashedPassword,
 *   name: 'John Doe',
 *   authMethod: 'email'
 * });
 */
userSchema.statics.hashPassword = async function (password) {
  if (!password || password.trim() === '') {
    throw new Error('Password cannot be empty');
  }

  const saltRounds = 10; // Minimum 10 rounds per security requirements
  return bcrypt.hash(password, saltRounds);
};

// ============================================================================
// PRE-SAVE HOOKS
// ============================================================================

/**
 * Pre-save hook: Validate password for email auth
 * 
 * Ensures:
 * - Email auth users have a password
 * - Password is already hashed (60 chars)
 * - updatedAt timestamp is set
 */
userSchema.pre('save', async function (next) {
  // Validate password for email authentication
  if (this.authMethod === 'email' && this.isModified('password')) {
    // Password should already be hashed
    if (!this.password || this.password.length < 60) {
      return next(
        new Error('Password must be hashed with bcrypt before saving')
      );
    }
  }

  // Update timestamp
  this.updatedAt = new Date();

  next();
});

// ============================================================================
// MODEL EXPORT
// ============================================================================

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
