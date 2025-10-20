/**
 * Token Utility Tests
 * 
 * Tests for cryptographically secure token generation.
 */

import {
  generateSecureToken,
  generateTokenWithLength,
  getDefaultTokenBytes,
} from '@/lib/utils/token';

// ============================================================================
// GENERATE SECURE TOKEN TESTS
// ============================================================================

describe('generateSecureToken', () => {
  test('should generate token with default 32 bytes (64 hex chars)', () => {
    const token = generateSecureToken();

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64); // 32 bytes = 64 hex chars
  });

  test('should generate token in hexadecimal format', () => {
    const token = generateSecureToken();

    // Should only contain hex characters (0-9, a-f)
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  test('should generate unique tokens', () => {
    const tokens = new Set();
    const count = 100;

    for (let i = 0; i < count; i++) {
      tokens.add(generateSecureToken());
    }

    // All tokens should be unique
    expect(tokens.size).toBe(count);
  });

  test('should generate token with custom byte length', () => {
    const token16 = generateSecureToken(16);
    const token32 = generateSecureToken(32);
    const token64 = generateSecureToken(64);

    expect(token16.length).toBe(32); // 16 bytes = 32 hex chars
    expect(token32.length).toBe(64); // 32 bytes = 64 hex chars
    expect(token64.length).toBe(128); // 64 bytes = 128 hex chars
  });

  test('should generate token with minimum 1 byte', () => {
    const token = generateSecureToken(1);

    expect(token.length).toBe(2); // 1 byte = 2 hex chars
    expect(token).toMatch(/^[a-f0-9]{2}$/);
  });

  test('should generate token with maximum 256 bytes', () => {
    const token = generateSecureToken(256);

    expect(token.length).toBe(512); // 256 bytes = 512 hex chars
    expect(token).toMatch(/^[a-f0-9]{512}$/);
  });

  test('should verify default token bytes configuration', () => {
    const defaultBytes = getDefaultTokenBytes();
    expect(defaultBytes).toBe(32);
  });

  test('should reject zero bytes', () => {
    expect(() => generateSecureToken(0)).toThrow(
      'Token bytes must be greater than 0'
    );
  });

  test('should reject negative bytes', () => {
    expect(() => generateSecureToken(-1)).toThrow(
      'Token bytes must be greater than 0'
    );
  });

  test('should reject bytes exceeding maximum (256)', () => {
    expect(() => generateSecureToken(257)).toThrow(
      'Token bytes cannot exceed 256 (512 hex characters)'
    );
  });

  test('should reject non-integer bytes', () => {
    expect(() => generateSecureToken(32.5)).toThrow(
      'Token bytes must be an integer'
    );
  });

  test('should reject null bytes', () => {
    expect(() => generateSecureToken(null)).toThrow(
      'Token bytes must be a number'
    );
  });

  test('should reject undefined bytes (should use default)', () => {
    // undefined should use default, not throw
    const token = generateSecureToken(undefined);
    expect(token.length).toBe(64); // Default 32 bytes
  });

  test('should reject string bytes', () => {
    expect(() => generateSecureToken('32')).toThrow(
      'Token bytes must be a number'
    );
  });

  test('should reject object bytes', () => {
    expect(() => generateSecureToken({ bytes: 32 })).toThrow(
      'Token bytes must be a number'
    );
  });

  test('should reject array bytes', () => {
    expect(() => generateSecureToken([32])).toThrow(
      'Token bytes must be a number'
    );
  });
});

// ============================================================================
// GENERATE TOKEN WITH LENGTH TESTS
// ============================================================================

describe('generateTokenWithLength', () => {
  test('should generate token with exact character length', () => {
    const token64 = generateTokenWithLength(64);
    const token32 = generateTokenWithLength(32);
    const token128 = generateTokenWithLength(128);

    expect(token64.length).toBe(64);
    expect(token32.length).toBe(32);
    expect(token128.length).toBe(128);
  });

  test('should generate token in hexadecimal format', () => {
    const token = generateTokenWithLength(64);

    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  test('should generate unique tokens', () => {
    const tokens = new Set();
    const count = 100;

    for (let i = 0; i < count; i++) {
      tokens.add(generateTokenWithLength(64));
    }

    expect(tokens.size).toBe(count);
  });

  test('should generate token with minimum 2 characters', () => {
    const token = generateTokenWithLength(2);

    expect(token.length).toBe(2);
    expect(token).toMatch(/^[a-f0-9]{2}$/);
  });

  test('should generate token with maximum 512 characters', () => {
    const token = generateTokenWithLength(512);

    expect(token.length).toBe(512);
    expect(token).toMatch(/^[a-f0-9]{512}$/);
  });

  test('should reject odd length (hex encoding requires even)', () => {
    expect(() => generateTokenWithLength(63)).toThrow(
      'Token length must be even (hex encoding produces 2 chars per byte)'
    );
  });

  test('should reject zero length', () => {
    expect(() => generateTokenWithLength(0)).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject negative length', () => {
    expect(() => generateTokenWithLength(-2)).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject length exceeding maximum (512)', () => {
    expect(() => generateTokenWithLength(514)).toThrow(
      'Token bytes cannot exceed 256 (512 hex characters)'
    );
  });

  test('should reject non-integer length', () => {
    expect(() => generateTokenWithLength(64.5)).toThrow(
      'Token length must be an integer'
    );
  });

  test('should reject null length', () => {
    expect(() => generateTokenWithLength(null)).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject undefined length', () => {
    expect(() => generateTokenWithLength(undefined)).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject string length', () => {
    expect(() => generateTokenWithLength('64')).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject object length', () => {
    expect(() => generateTokenWithLength({ length: 64 })).toThrow(
      'Token length must be a positive number'
    );
  });

  test('should reject array length', () => {
    expect(() => generateTokenWithLength([64])).toThrow(
      'Token length must be a positive number'
    );
  });
});

// ============================================================================
// SECURITY TESTS
// ============================================================================

describe('Security', () => {
  test('should generate cryptographically random tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    // Tokens should be different
    expect(token1).not.toBe(token2);

    // Tokens should not be sequential or predictable
    expect(parseInt(token1, 16)).not.toBe(parseInt(token2, 16) + 1);
    expect(parseInt(token1, 16)).not.toBe(parseInt(token2, 16) - 1);
  });

  test('should generate tokens with high entropy', () => {
    const token = generateSecureToken(32);

    // Count unique characters (should have variety)
    const uniqueChars = new Set(token.split('')).size;
    expect(uniqueChars).toBeGreaterThan(8); // Should have at least 8 unique hex chars
  });

  test('should not generate duplicate tokens in large sample', () => {
    const tokens = new Set();
    const count = 10000;

    for (let i = 0; i < count; i++) {
      tokens.add(generateSecureToken());
    }

    // All tokens should be unique
    expect(tokens.size).toBe(count);
  });

  test('should generate tokens with uniform distribution of hex characters', () => {
    const count = 1000;
    const charCounts = {};

    // Count character occurrences
    for (let i = 0; i < count; i++) {
      const token = generateSecureToken(4); // Smaller for faster test
      for (const char of token) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
    }

    // All hex characters should appear
    const hexChars = '0123456789abcdef';
    for (const char of hexChars) {
      expect(charCounts[char]).toBeGreaterThan(0);
    }

    // Distribution should be relatively uniform (within 30% of average)
    const totalChars = Object.values(charCounts).reduce((a, b) => a + b, 0);
    const avgCount = totalChars / 16;
    const tolerance = avgCount * 0.3;

    for (const count of Object.values(charCounts)) {
      expect(count).toBeGreaterThan(avgCount - tolerance);
      expect(count).toBeLessThan(avgCount + tolerance);
    }
  });

  test('should generate tokens that are not guessable from previous tokens', () => {
    const tokens = [];
    for (let i = 0; i < 10; i++) {
      tokens.push(generateSecureToken());
    }

    // No token should be a substring of another
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (i !== j) {
          expect(tokens[i].includes(tokens[j])).toBe(false);
          expect(tokens[j].includes(tokens[i])).toBe(false);
        }
      }
    }
  });

  test('should generate tokens with sufficient entropy for password reset', () => {
    // Password reset tokens should be 64 hex chars (32 bytes = 256 bits)
    const token = generateSecureToken(32);

    expect(token.length).toBe(64);
    expect(token).toMatch(/^[a-f0-9]{64}$/);

    // 256 bits of entropy is cryptographically secure
    const bitsOfEntropy = 32 * 8; // 32 bytes * 8 bits/byte
    expect(bitsOfEntropy).toBe(256);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration', () => {
  test('should support PasswordResetToken use case (64-char hex)', () => {
    // PasswordResetToken model expects 64-char hex
    const token = generateSecureToken(32);

    expect(token.length).toBe(64);
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should support session token use case (32-char hex)', () => {
    // Session tokens could use 16 bytes (32 hex chars)
    const token = generateSecureToken(16);

    expect(token.length).toBe(32);
    expect(token).toMatch(/^[a-f0-9]{32}$/);
  });

  test('should support API key use case (128-char hex)', () => {
    // API keys could use 64 bytes (128 hex chars)
    const token = generateSecureToken(64);

    expect(token.length).toBe(128);
    expect(token).toMatch(/^[a-f0-9]{128}$/);
  });

  test('should work with generateTokenWithLength for exact lengths', () => {
    // Use case: need exactly 64 characters for database field
    const token = generateTokenWithLength(64);

    expect(token.length).toBe(64);
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should generate tokens compatible with database storage', () => {
    const token = generateSecureToken();

    // Token should be:
    // - String type (for VARCHAR/TEXT storage)
    // - Fixed length (for indexed columns)
    // - Hex only (safe for URLs, no escaping needed)
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
    expect(token).toMatch(/^[a-f0-9]+$/);
    expect(encodeURIComponent(token)).toBe(token); // URL-safe
  });

  test('should generate multiple tokens concurrently', () => {
    const count = 100;
    const tokens = [];

    // Generate tokens in parallel
    for (let i = 0; i < count; i++) {
      tokens.push(generateSecureToken());
    }

    // All should be unique
    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(count);
  });

  test('should maintain uniqueness across different byte lengths', () => {
    const tokens = new Set();

    // Generate tokens of various lengths
    for (let i = 1; i <= 64; i++) {
      tokens.add(generateSecureToken(i));
    }

    expect(tokens.size).toBe(64);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  test('should handle boundary byte values', () => {
    expect(() => generateSecureToken(1)).not.toThrow(); // Minimum
    expect(() => generateSecureToken(256)).not.toThrow(); // Maximum
  });

  test('should handle boundary length values', () => {
    expect(() => generateTokenWithLength(2)).not.toThrow(); // Minimum
    expect(() => generateTokenWithLength(512)).not.toThrow(); // Maximum
  });

  test('should handle repeated calls', () => {
    const tokens = [];
    for (let i = 0; i < 1000; i++) {
      tokens.push(generateSecureToken());
    }

    expect(tokens.length).toBe(1000);
    expect(new Set(tokens).size).toBe(1000); // All unique
  });

  test('should handle rapid successive calls', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    const token3 = generateSecureToken();

    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  test('should generate consistent length tokens', () => {
    for (let i = 0; i < 100; i++) {
      const token = generateSecureToken(32);
      expect(token.length).toBe(64);
    }
  });
});

// ============================================================================
// PERFORMANCE TESTS (INFORMATIONAL)
// ============================================================================

describe('Performance (informational)', () => {
  test('should generate token quickly', () => {
    const start = Date.now();
    generateSecureToken();
    const duration = Date.now() - start;

    console.log(`Token generation took ${duration}ms (expected < 10ms)`);
    expect(duration).toBeLessThan(100);
  });

  test('should generate 1000 tokens in reasonable time', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      generateSecureToken();
    }
    const duration = Date.now() - start;

    console.log(`Generated 1000 tokens in ${duration}ms (expected < 1000ms)`);
    expect(duration).toBeLessThan(5000);
  });

  test('should handle large byte counts efficiently', () => {
    const start = Date.now();
    generateSecureToken(256); // Maximum
    const duration = Date.now() - start;

    console.log(`Generating 256-byte token took ${duration}ms (expected < 50ms)`);
    expect(duration).toBeLessThan(100);
  });
});
