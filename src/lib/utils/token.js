/**
 * Token Utility Functions
 * 
 * Provides cryptographically secure random token generation.
 * 
 * Features:
 * - generateSecureToken: Generate random hex tokens using crypto.randomBytes
 * - Configurable token length
 * - Suitable for password reset tokens, session tokens, etc.
 * 
 * Usage:
 * ```javascript
 * import { generateSecureToken } from '@/lib/utils/token';
 * 
 * // Generate 64-character hex token (32 bytes)
 * const token = generateSecureToken();
 * 
 * // Generate custom length token
 * const shortToken = generateSecureToken(16); // 32-char hex
 * ```
 */

import crypto from 'crypto';

/**
 * Default token length in bytes
 * 32 bytes = 64 hexadecimal characters
 * Provides 256 bits of entropy (very secure)
 */
const DEFAULT_TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure random token
 * 
 * Uses Node.js crypto.randomBytes to generate a random token
 * suitable for security-sensitive operations like password resets.
 * 
 * @param {number} [bytes=32] - Number of random bytes to generate
 * @returns {string} Hexadecimal token string (bytes * 2 characters)
 * @throws {Error} If bytes parameter is invalid
 * 
 * @example
 * // Generate 64-character hex token (default)
 * const token = generateSecureToken();
 * // Returns: 'a1b2c3d4e5f6...' (64 chars)
 * 
 * @example
 * // Generate 32-character hex token
 * const shortToken = generateSecureToken(16);
 * // Returns: 'a1b2c3d4...' (32 chars)
 */
export function generateSecureToken(bytes = DEFAULT_TOKEN_BYTES) {
  // Validate bytes parameter
  if (typeof bytes !== 'number') {
    throw new Error('Token bytes must be a number');
  }

  if (bytes <= 0) {
    throw new Error('Token bytes must be greater than 0');
  }

  if (!Number.isInteger(bytes)) {
    throw new Error('Token bytes must be an integer');
  }

  if (bytes > 256) {
    throw new Error('Token bytes cannot exceed 256 (512 hex characters)');
  }

  try {
    // Generate random bytes and convert to hexadecimal
    const token = crypto.randomBytes(bytes).toString('hex');
    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Generate a token with specific character length
 * 
 * Convenience function to generate a token with exact character count.
 * Useful when you need a specific string length rather than byte count.
 * 
 * @param {number} length - Desired token length in characters (must be even)
 * @returns {string} Hexadecimal token string
 * @throws {Error} If length is odd or invalid
 * 
 * @example
 * const token = generateTokenWithLength(64);
 * console.log(token.length); // 64
 */
export function generateTokenWithLength(length) {
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Token length must be a positive number');
  }

  if (!Number.isInteger(length)) {
    throw new Error('Token length must be an integer');
  }

  if (length % 2 !== 0) {
    throw new Error('Token length must be even (hex encoding produces 2 chars per byte)');
  }

  const bytes = length / 2;
  return generateSecureToken(bytes);
}

/**
 * Get the default token byte length
 * Exported for testing purposes
 * 
 * @returns {number} Default number of bytes for token generation
 */
export function getDefaultTokenBytes() {
  return DEFAULT_TOKEN_BYTES;
}

export default {
  generateSecureToken,
  generateTokenWithLength,
  getDefaultTokenBytes,
};
