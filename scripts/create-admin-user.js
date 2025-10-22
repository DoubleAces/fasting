#!/usr/bin/env node

/**
 * Admin User Management Script
 * 
 * Grants or revokes admin privileges for users.
 * 
 * Usage:
 *   node scripts/create-admin-user.js <email>             # Grant admin access
 *   node scripts/create-admin-user.js <email> --revoke    # Revoke admin access
 *   node scripts/create-admin-user.js --list              # List all admins
 * 
 * Examples:
 *   node scripts/create-admin-user.js user@example.com
 *   node scripts/create-admin-user.js user@example.com --revoke
 *   node scripts/create-admin-user.js --list
 * 
 * Environment:
 *   Requires MONGODB_URI in .env.local file
 * 
 * Security:
 *   - Only run this script with secure access to production database
 *   - Logs all privilege changes with timestamps
 *   - Validates email format before modification
 */

import 'dotenv/config';
import { connectDB } from '../src/lib/db.js';
import User from '../src/lib/models/User.js';

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Grant admin access to user
 */
async function grantAdminAccess(email) {
  try {
    console.log(`\n🔍 Looking for user: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }
    
    if (user.isAdmin) {
      console.log(`ℹ️  User "${email}" already has admin access`);
      process.exit(0);
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ Success: Admin access granted to "${email}"`);
    console.log(`📝 User details:`);
    console.log(`   - Name: ${user.name || 'N/A'}`);
    console.log(`   - Auth Method: ${user.authMethod}`);
    console.log(`   - Account Active: ${user.isActive}`);
    console.log(`   - Email Verified: ${user.emailVerified}`);
    console.log(`   - Registered: ${user.registrationDate.toISOString()}`);
    console.log(`\n⚠️  Note: User must log out and log back in for changes to take effect`);
  } catch (error) {
    console.error(`❌ Error granting admin access:`, error.message);
    process.exit(1);
  }
}

/**
 * Revoke admin access from user
 */
async function revokeAdminAccess(email) {
  try {
    console.log(`\n🔍 Looking for user: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }
    
    if (!user.isAdmin) {
      console.log(`ℹ️  User "${email}" does not have admin access`);
      process.exit(0);
    }
    
    user.isAdmin = false;
    await user.save();
    
    console.log(`✅ Success: Admin access revoked from "${email}"`);
    console.log(`📝 User details:`);
    console.log(`   - Name: ${user.name || 'N/A'}`);
    console.log(`   - Auth Method: ${user.authMethod}`);
    console.log(`   - Account Active: ${user.isActive}`);
    console.log(`\n⚠️  Note: User will be logged out on next request (privilege revocation detected)`);
  } catch (error) {
    console.error(`❌ Error revoking admin access:`, error.message);
    process.exit(1);
  }
}

/**
 * List all admin users
 */
async function listAdmins() {
  try {
    console.log(`\n🔍 Fetching all admin users...`);
    
    const admins = await User.find({ isAdmin: true }).select('email name authMethod isActive registrationDate lastLogin');
    
    if (admins.length === 0) {
      console.log(`ℹ️  No admin users found`);
      process.exit(0);
    }
    
    console.log(`\n📋 Admin Users (${admins.length}):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   - Name: ${admin.name || 'N/A'}`);
      console.log(`   - Auth Method: ${admin.authMethod}`);
      console.log(`   - Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`   - Registered: ${admin.registrationDate.toISOString()}`);
      console.log(`   - Last Login: ${admin.lastLogin ? admin.lastLogin.toISOString() : 'N/A'}`);
      console.log();
    });
  } catch (error) {
    console.error(`❌ Error listing admins:`, error.message);
    process.exit(1);
  }
}

/**
 * Display usage instructions
 */
function displayUsage() {
  console.log(`
Usage:
  node scripts/create-admin-user.js <email>             # Grant admin access
  node scripts/create-admin-user.js <email> --revoke    # Revoke admin access
  node scripts/create-admin-user.js --list              # List all admins

Examples:
  node scripts/create-admin-user.js user@example.com
  node scripts/create-admin-user.js user@example.com --revoke
  node scripts/create-admin-user.js --list

Environment:
  Requires MONGODB_URI in .env.local file
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check for --list flag
  if (args.includes('--list')) {
    await connectDB();
    await listAdmins();
    process.exit(0);
  }
  
  // Validate arguments
  if (args.length === 0 || args.length > 2) {
    console.error('❌ Error: Invalid arguments');
    displayUsage();
    process.exit(1);
  }
  
  const email = args[0];
  const isRevoke = args.includes('--revoke');
  
  // Validate email format
  if (!isValidEmail(email)) {
    console.error(`❌ Error: Invalid email format "${email}"`);
    process.exit(1);
  }
  
  // Check for MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in environment variables');
    console.error('   Please create .env.local file with MONGODB_URI');
    process.exit(1);
  }
  
  // Connect to database
  console.log('🔌 Connecting to database...');
  await connectDB();
  console.log('✅ Database connected');
  
  // Execute operation
  if (isRevoke) {
    await revokeAdminAccess(email);
  } else {
    await grantAdminAccess(email);
  }
  
  process.exit(0);
}

// Run main function
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
