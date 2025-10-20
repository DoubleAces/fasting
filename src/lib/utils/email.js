/**
 * Email Utility Functions
 * 
 * Provides email sending functionality for authentication and notifications.
 * 
 * Features:
 * - sendWelcomeEmail: Send welcome email to new users
 * - sendPasswordResetEmail: Send password reset link to users
 * - Email template formatting and rendering
 * 
 * Note: These are placeholder implementations. In production, integrate with
 * an email service provider like SendGrid, AWS SES, Resend, or Nodemailer.
 * 
 * Usage:
 * ```javascript
 * import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/utils/email';
 * 
 * // Send welcome email
 * await sendWelcomeEmail({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * 
 * // Send password reset email
 * await sendPasswordResetEmail({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   resetToken: 'abc123...',
 *   resetUrl: 'https://example.com/reset-password?token=abc123'
 * });
 * ```
 */

/**
 * Send welcome email to newly registered user
 * 
 * Sends a welcome email with getting started information.
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email address
 * @param {string} [params.name] - Recipient name (optional)
 * @returns {Promise<Object>} Email send result
 * @throws {Error} If email sending fails
 * 
 * @example
 * await sendWelcomeEmail({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 */
export async function sendWelcomeEmail({ email, name }) {
  // Validate required parameters
  if (!email || typeof email !== 'string') {
    throw new Error('Email address is required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address format');
  }

  // TODO: Replace with actual email service integration
  // Example integrations:
  // - SendGrid: https://www.npmjs.com/package/@sendgrid/mail
  // - AWS SES: https://www.npmjs.com/package/@aws-sdk/client-ses
  // - Resend: https://www.npmjs.com/package/resend
  // - Nodemailer: https://www.npmjs.com/package/nodemailer

  console.log('📧 [EMAIL PLACEHOLDER] Sending welcome email...');
  console.log(`   To: ${email}`);
  console.log(`   Name: ${name || 'User'}`);
  console.log('   Subject: Welcome to Fasting Tracker!');
  console.log('   Template: welcome-email');

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock success response
  return {
    success: true,
    messageId: `mock-welcome-${Date.now()}`,
    recipient: email,
    template: 'welcome-email',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send password reset email with reset link
 * 
 * Sends an email containing a secure password reset link.
 * The link should expire after a set time (e.g., 1 hour).
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email address
 * @param {string} [params.name] - Recipient name (optional)
 * @param {string} params.resetToken - Password reset token
 * @param {string} params.resetUrl - Complete password reset URL
 * @returns {Promise<Object>} Email send result
 * @throws {Error} If email sending fails or parameters are invalid
 * 
 * @example
 * await sendPasswordResetEmail({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   resetToken: 'abc123def456...',
 *   resetUrl: 'https://example.com/reset-password?token=abc123def456'
 * });
 */
export async function sendPasswordResetEmail({
  email,
  name,
  resetToken,
  resetUrl,
}) {
  // Validate required parameters
  if (!email || typeof email !== 'string') {
    throw new Error('Email address is required');
  }

  if (!resetToken || typeof resetToken !== 'string') {
    throw new Error('Reset token is required');
  }

  if (!resetUrl || typeof resetUrl !== 'string') {
    throw new Error('Reset URL is required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address format');
  }

  // URL format validation
  try {
    new URL(resetUrl);
  } catch {
    throw new Error('Invalid reset URL format');
  }

  // Token format validation (should be 64-char hex for password reset)
  if (resetToken.length !== 64 || !/^[a-f0-9]{64}$/.test(resetToken)) {
    throw new Error('Invalid reset token format (expected 64-char hex)');
  }

  // TODO: Replace with actual email service integration
  console.log('📧 [EMAIL PLACEHOLDER] Sending password reset email...');
  console.log(`   To: ${email}`);
  console.log(`   Name: ${name || 'User'}`);
  console.log('   Subject: Reset Your Password - Fasting Tracker');
  console.log(`   Reset URL: ${resetUrl}`);
  console.log(`   Token: ${resetToken.substring(0, 10)}...`);
  console.log('   Template: password-reset-email');
  console.log('   Expires: 1 hour');

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock success response
  return {
    success: true,
    messageId: `mock-reset-${Date.now()}`,
    recipient: email,
    template: 'password-reset-email',
    resetToken: resetToken.substring(0, 10) + '...', // Don't expose full token in logs
    timestamp: new Date().toISOString(),
    expiresIn: '1 hour',
  };
}

/**
 * Format email template with dynamic data
 * 
 * Helper function to render email templates with user data.
 * In production, use a template engine like Handlebars or React Email.
 * 
 * @param {string} templateName - Name of the email template
 * @param {Object} data - Template data
 * @returns {Object} Formatted email with subject and body
 * 
 * @example
 * const email = formatEmailTemplate('welcome', { name: 'John' });
 */
export function formatEmailTemplate(templateName, data = {}) {
  // Ensure data is an object (handle null/undefined)
  const templateData = data || {};

  const templates = {
    welcome: {
      subject: 'Welcome to Fasting Tracker!',
      body: `Hi ${templateData.name || 'there'},\n\nWelcome to Fasting Tracker! We're excited to help you on your intermittent fasting journey.\n\nGet started by logging your first entry and tracking your progress.\n\nBest regards,\nThe Fasting Tracker Team`,
    },
    'password-reset': {
      subject: 'Reset Your Password - Fasting Tracker',
      body: `Hi ${templateData.name || 'there'},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n${templateData.resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe Fasting Tracker Team`,
    },
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  return template;
}

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  formatEmailTemplate,
};
