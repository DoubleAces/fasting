/**
 * Password Utility Functions
 * 
 * Provides secure password hashing and comparison using bcrypt.
 * 
 * Features:
 * - hashPassword: Hash passwords with bcrypt (minimum 10 rounds)
 * - comparePassword: Compare plain text password with hash
 * - Security: Uses bcrypt's salt generation and secure comparison
 * 
 * Usage:
 * ```javascript
 * import { hashPassword, comparePassword } from '@/lib/utils/password';
 * 
 * // Hash a password
 * const hash = await hashPassword('userPassword123');
 * 
 * // Compare password with hash
 * const isMatch = await comparePassword('userPassword123', hash);
 * ```
 */

import bcrypt from 'bcrypt';

/**
 * Minimum number of bcrypt rounds for password hashing
 * Higher rounds = more secure but slower
 * 10 rounds is a good balance for security and performance
 */
const BCRYPT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * 
 * Generates a salted hash of the provided password using bcrypt.
 * Uses a minimum of 10 rounds for security.
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Bcrypt hash (60 characters)
 * @throws {Error} If password is empty or invalid
 * 
 * @example
 * const hash = await hashPassword('SecurePass123');
 * // Returns: $2b$10$N9qo8uLOickgx2ZMRZoMye...
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

/**
 * Compare a plain text password with a bcrypt hash
 * 
 * Uses bcrypt's secure comparison to check if the provided password
 * matches the stored hash. Resistant to timing attacks.
 * 
 * @param {string} password - Plain text password to compare
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash, false otherwise
 * @throws {Error} If password or hash is invalid
 * 
 * @example
 * const isMatch = await comparePassword('SecurePass123', storedHash);
 * if (isMatch) {
 *   console.log('Password correct!');
 * }
 */
export async function comparePassword(password, hash) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hash || typeof hash !== 'string') {
    throw new Error('Hash must be a non-empty string');
  }

  // Validate hash format (bcrypt hashes are 60 characters)
  if (hash.length !== 60 || !hash.startsWith('$2')) {
    throw new Error('Invalid bcrypt hash format');
  }

  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error(`Failed to compare password: ${error.message}`);
  }
}

/**
 * Get the bcrypt rounds used for hashing
 * Exported for testing purposes
 * 
 * @returns {number} Number of bcrypt rounds
 */
export function getBcryptRounds() {
  return BCRYPT_ROUNDS;
}

export default {
  hashPassword,
  comparePassword,
  getBcryptRounds,
};
