/**
 * PasswordResetToken Model
 * 
 * Stores time-limited, one-time-use tokens for password reset functionality.
 * Tokens are automatically deleted 1 hour after creation via TTL index.
 * 
 * Schema Fields:
 * - token: Cryptographically secure random token (64-char hex string)
 * - userId: Reference to User model
 * - expiresAt: Expiration timestamp (1 hour from creation)
 * - used: Flag indicating if token has been used
 * - usedAt: Timestamp when token was used
 * - createdAt: Creation timestamp (TTL index for auto-deletion)
 * 
 * Features:
 * - Unique token index for fast lookups
 * - Foreign key reference to User model
 * - TTL index for automatic cleanup after 1 hour
 * - Static methods: generateToken, validateToken
 * - Instance method: markAsUsed
 * - One-time use enforcement
 * 
 * Security:
 * - Tokens are cryptographically secure (crypto.randomBytes(32))
 * - 1-hour expiration enforced at validation
 * - Cannot be reused after successful password reset
 * - Automatic cleanup prevents token accumulation
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    /**
     * Reset token (unique, secure random string)
     * - 64-character hexadecimal string
     * - Generated with crypto.randomBytes(32)
     * - Used in password reset email link
     * - Indexed via unique constraint and compound index (token + used + expiresAt)
     */
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-f0-9]{64}$/.test(v);
        },
        message: 'Token must be a 64-character hexadecimal string',
      },
    },

    /**
     * User ID reference
     * - Links token to specific user account
     * - Indexed for querying user's tokens
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    /**
     * Expiration timestamp
     * - Set to 1 hour from creation
     * - Validated when token is used
     * - Indexed via compound index (token + used + expiresAt)
     */
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: 'Expiration date must be in the future',
      },
    },

    /**
     * Used flag
     * - false: Token has not been used (can be used once)
     * - true: Token has been used (cannot be reused)
     * - Indexed via compound index (token + used + expiresAt)
     */
    used: {
      type: Boolean,
      default: false,
    },

    /**
     * Used at timestamp
     * - null: Token has not been used
     * - Date: When token was used for password reset
     */
    usedAt: {
      type: Date,
      default: null,
    },

    /**
     * Created at timestamp
     * - Set automatically on document creation
     * - Used for TTL index (auto-delete after 1 hour)
     * - Indexed via explicit TTL index below
     */
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      // Note: TTL index is defined explicitly below, not using expires option here
    },
  },
  {
    // Collection name
    collection: 'passwordResetTokens',
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// Compound index for validating tokens
passwordResetTokenSchema.index({ token: 1, used: 0, expiresAt: 1 });

// TTL index on createdAt (auto-delete after 1 hour)
passwordResetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Generate a new password reset token
 * 
 * Creates a secure random token and saves it to the database
 * with a 1-hour expiration time.
 * 
 * @param {string|ObjectId} userId - User ID for the token
 * @returns {Promise<PasswordResetToken>} Created token document
 * @throws {Error} If userId is invalid or creation fails
 * 
 * @example
 * const resetToken = await PasswordResetToken.generateToken(user._id);
 * console.log('Reset token:', resetToken.token);
 * console.log('Expires at:', resetToken.expiresAt);
 * 
 * // Send token to user via email
 * const resetLink = `https://example.com/reset-password?token=${resetToken.token}`;
 * await sendEmail(user.email, resetLink);
 */
passwordResetTokenSchema.statics.generateToken = async function (userId) {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  // Generate cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex'); // 64 hex characters

  // Set expiration to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Create and return token document
  return this.create({
    token,
    userId,
    expiresAt,
  });
};

/**
 * Validate a password reset token
 * 
 * Checks if token exists, hasn't been used, and hasn't expired.
 * Populates the user data if token is valid.
 * 
 * @param {string} token - Token string from reset email
 * @returns {Promise<PasswordResetToken|null>} Token document with user, or null if invalid
 * 
 * @example
 * const resetToken = await PasswordResetToken.validateToken(tokenFromEmail);
 * 
 * if (!resetToken) {
 *   return res.status(400).json({ error: 'Invalid or expired token' });
 * }
 * 
 * // Token is valid, proceed with password reset
 * const user = resetToken.userId;
 * user.password = await User.hashPassword(newPassword);
 * await user.save();
 * 
 * // Mark token as used
 * await resetToken.markAsUsed();
 */
passwordResetTokenSchema.statics.validateToken = async function (token) {
  if (!token || token.length !== 64) {
    return null; // Invalid token format
  }

  // Find token that:
  // - Matches the token string
  // - Has not been used
  // - Has not expired
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!resetToken) {
    return null; // Token not found, used, or expired
  }

  return resetToken;
};

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Mark token as used
 * 
 * Sets the used flag to true and records the usage timestamp.
 * Prevents token from being reused for security.
 * 
 * @returns {Promise<PasswordResetToken>} Updated token document
 * 
 * @example
 * const resetToken = await PasswordResetToken.validateToken(token);
 * 
 * if (resetToken) {
 *   // Reset password
 *   user.password = await User.hashPassword(newPassword);
 *   await user.save();
 *   
 *   // Mark token as used to prevent reuse
 *   await resetToken.markAsUsed();
 * }
 */
passwordResetTokenSchema.methods.markAsUsed = function () {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

// ============================================================================
// MODEL EXPORT
// ============================================================================

const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;
