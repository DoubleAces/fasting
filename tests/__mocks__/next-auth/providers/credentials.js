/**
 * Mock for next-auth/providers/credentials module
 */

const CredentialsProvider = jest.fn((config) => ({
  id: config.id || 'credentials',
  name: config.name || 'Credentials',
  type: 'credentials',
  credentials: config.credentials || {},
  authorize: config.authorize || jest.fn(),
}));

export default CredentialsProvider;
