/**
 * Mock for next-auth/providers/google module
 */

const GoogleProvider = jest.fn((config) => ({
  id: 'google',
  name: 'Google',
  type: 'oauth',
  clientId: config.clientId || 'mock-client-id',
  clientSecret: config.clientSecret || 'mock-client-secret',
}));

export default GoogleProvider;
