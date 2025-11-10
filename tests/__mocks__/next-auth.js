/**
 * Mock for next-auth module
 * 
 * This mock prevents ESM import issues in Jest tests
 * by providing a CommonJS-compatible mock of NextAuth
 */

// Mock getServerSession function
export const getServerSession = jest.fn();

// Mock NextAuth default export
const NextAuth = jest.fn(() => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

export default NextAuth;
