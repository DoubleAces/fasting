/**
 * Password Utility Tests
 * 
 * Tests for password hashing and comparison utilities.
 */

import {
  hashPassword,
  comparePassword,
  getBcryptRounds,
} from '@/lib/utils/password';

// ============================================================================
// HASH PASSWORD TESTS
// ============================================================================

describe('hashPassword', () => {
  test('should hash a valid password', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    expect(hash.length).toBe(60); // bcrypt hash length
  });

  test('should return bcrypt format hash', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);

    // Bcrypt format: $2a$, $2b$, or $2y$ followed by rounds and salt
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test('should generate different hashes for same password (salt)', async () => {
    const password = 'SecurePass123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });

  test('should use minimum 10 bcrypt rounds', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);

    // Bcrypt format: $2a$rounds$...
    const rounds = parseInt(hash.split('$')[2]);
    expect(rounds).toBe(10);
    expect(rounds).toBeGreaterThanOrEqual(10);
  });

  test('should verify bcrypt rounds configuration', () => {
    const rounds = getBcryptRounds();
    expect(rounds).toBe(10);
    expect(rounds).toBeGreaterThanOrEqual(10);
  });

  test('should hash long passwords', async () => {
    const longPassword = 'A'.repeat(100) + '123!';
    const hash = await hashPassword(longPassword);

    expect(hash).toBeDefined();
    expect(hash.length).toBe(60);
  });

  test('should hash passwords with special characters', async () => {
    const password = 'P@ssw0rd!#$%^&*()';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.length).toBe(60);
  });

  test('should hash passwords with unicode characters', async () => {
    const password = 'Pāsswørd123🔒';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.length).toBe(60);
  });

  test('should reject empty password', async () => {
    await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
  });

  test('should reject whitespace-only password', async () => {
    await expect(hashPassword('   ')).rejects.toThrow(
      'Password cannot be empty'
    );
  });

  test('should reject null password', async () => {
    await expect(hashPassword(null)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject undefined password', async () => {
    await expect(hashPassword(undefined)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject non-string password', async () => {
    await expect(hashPassword(12345)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject object password', async () => {
    await expect(hashPassword({ pass: '123' })).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject array password', async () => {
    await expect(hashPassword(['password'])).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });
});

// ============================================================================
// COMPARE PASSWORD TESTS
// ============================================================================

describe('comparePassword', () => {
  test('should return true for matching password and hash', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(password, hash);

    expect(isMatch).toBe(true);
  });

  test('should return false for non-matching password', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('WrongPassword', hash);

    expect(isMatch).toBe(false);
  });

  test('should be case-sensitive', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('securepass123', hash);

    expect(isMatch).toBe(false);
  });

  test('should handle special characters correctly', async () => {
    const password = 'P@ssw0rd!#$%';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('P@ssw0rd!#$%', hash);

    expect(isMatch).toBe(true);
  });

  test('should handle unicode characters correctly', async () => {
    const password = 'Pāsswørd123🔒';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('Pāsswørd123🔒', hash);

    expect(isMatch).toBe(true);
  });

  test('should return false for similar but different passwords', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);

    const similar1 = await comparePassword('SecurePass124', hash);
    const similar2 = await comparePassword('SecurePass12', hash);
    const similar3 = await comparePassword(' SecurePass123', hash);
    const similar4 = await comparePassword('SecurePass123 ', hash);

    expect(similar1).toBe(false);
    expect(similar2).toBe(false);
    expect(similar3).toBe(false);
    expect(similar4).toBe(false);
  });

  test('should work with different password lengths', async () => {
    const short = 'Pass1';
    const medium = 'SecurePassword123';
    const long = 'A'.repeat(100) + '123!';

    const hash1 = await hashPassword(short);
    const hash2 = await hashPassword(medium);
    const hash3 = await hashPassword(long);

    expect(await comparePassword(short, hash1)).toBe(true);
    expect(await comparePassword(medium, hash2)).toBe(true);
    expect(await comparePassword(long, hash3)).toBe(true);
  });

  test('should reject empty password for comparison', async () => {
    const hash = await hashPassword('SecurePass123');

    await expect(comparePassword('', hash)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject null password for comparison', async () => {
    const hash = await hashPassword('SecurePass123');

    await expect(comparePassword(null, hash)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject undefined password for comparison', async () => {
    const hash = await hashPassword('SecurePass123');

    await expect(comparePassword(undefined, hash)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject empty hash', async () => {
    await expect(comparePassword('SecurePass123', '')).rejects.toThrow(
      'Hash must be a non-empty string'
    );
  });

  test('should reject null hash', async () => {
    await expect(comparePassword('SecurePass123', null)).rejects.toThrow(
      'Hash must be a non-empty string'
    );
  });

  test('should reject undefined hash', async () => {
    await expect(comparePassword('SecurePass123', undefined)).rejects.toThrow(
      'Hash must be a non-empty string'
    );
  });

  test('should reject invalid hash format (too short)', async () => {
    await expect(comparePassword('SecurePass123', 'invalid')).rejects.toThrow(
      'Invalid bcrypt hash format'
    );
  });

  test('should reject invalid hash format (wrong prefix)', async () => {
    const invalidHash = '$1$' + 'a'.repeat(57); // Wrong prefix

    await expect(comparePassword('SecurePass123', invalidHash)).rejects.toThrow(
      'Invalid bcrypt hash format'
    );
  });

  test('should reject non-bcrypt hash', async () => {
    const nonBcryptHash = 'a'.repeat(60); // 60 chars but not bcrypt

    await expect(comparePassword('SecurePass123', nonBcryptHash)).rejects.toThrow(
      'Invalid bcrypt hash format'
    );
  });

  test('should reject non-string password for comparison', async () => {
    const hash = await hashPassword('SecurePass123');

    await expect(comparePassword(12345, hash)).rejects.toThrow(
      'Password must be a non-empty string'
    );
  });

  test('should reject non-string hash for comparison', async () => {
    await expect(comparePassword('SecurePass123', 12345)).rejects.toThrow(
      'Hash must be a non-empty string'
    );
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration: hashPassword and comparePassword', () => {
  test('should hash and verify multiple passwords', async () => {
    const passwords = [
      'Pass1',
      'SecurePassword123',
      'P@ssw0rd!',
      'Löng€rP@$$word123',
    ];

    for (const password of passwords) {
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    }
  });

  test('should create unique hashes for different passwords', async () => {
    const password1 = 'Password1';
    const password2 = 'Password2';

    const hash1 = await hashPassword(password1);
    const hash2 = await hashPassword(password2);

    expect(hash1).not.toBe(hash2);
    expect(await comparePassword(password1, hash1)).toBe(true);
    expect(await comparePassword(password2, hash2)).toBe(true);
    expect(await comparePassword(password1, hash2)).toBe(false);
    expect(await comparePassword(password2, hash1)).toBe(false);
  });

  test('should handle concurrent hashing', async () => {
    const passwords = ['Pass1', 'Pass2', 'Pass3', 'Pass4', 'Pass5'];
    const hashes = await Promise.all(passwords.map(hashPassword));

    expect(hashes).toHaveLength(5);
    expect(new Set(hashes).size).toBe(5); // All unique

    for (let i = 0; i < passwords.length; i++) {
      const isMatch = await comparePassword(passwords[i], hashes[i]);
      expect(isMatch).toBe(true);
    }
  });

  test('should maintain security over multiple hash/compare cycles', async () => {
    const password = 'SecurePass123';

    for (let i = 0; i < 5; i++) {
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    }
  });
});

// ============================================================================
// PERFORMANCE TESTS (INFORMATIONAL)
// ============================================================================

describe('Performance (informational)', () => {
  test('should hash password in reasonable time', async () => {
    const start = Date.now();
    await hashPassword('SecurePass123');
    const duration = Date.now() - start;

    // Bcrypt with 10 rounds typically takes 50-200ms
    // This is intentionally slow for security
    console.log(`Hashing took ${duration}ms (expected 50-200ms with 10 rounds)`);
    expect(duration).toBeLessThan(1000); // Should not take more than 1 second
  });

  test('should compare password in reasonable time', async () => {
    const password = 'SecurePass123';
    const hash = await hashPassword(password);

    const start = Date.now();
    await comparePassword(password, hash);
    const duration = Date.now() - start;

    // Comparison is typically fast (< 100ms)
    console.log(`Comparison took ${duration}ms (expected < 100ms)`);
    expect(duration).toBeLessThan(1000);
  });
});
