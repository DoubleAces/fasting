// Load environment variables BEFORE anything else
// This runs before jest.setup.js
import { config } from 'dotenv';
import { resolve } from 'path';

// Set NODE_ENV to 'test' for all test runs
process.env.NODE_ENV = 'test';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('✓ Environment variables loaded for integration tests');
console.log('✓ NODE_ENV:', process.env.NODE_ENV);
console.log('✓ MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('✓ MONGODB_TEST_URI:', process.env.MONGODB_TEST_URI ? 'SET' : 'NOT SET');
