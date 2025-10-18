// Load environment variables BEFORE anything else
// This runs before jest.setup.js
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('✓ Environment variables loaded for integration tests');
console.log('✓ MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
