/**
 * Email Utility Functions
 * 
 * Provides email sending functionality for authentication and notifications.
 * Uses Resend (https://resend.com) for reliable email delivery.
 * 
 * Features:
 * - sendWelcomeEmail: Send welcome email to new users
 * - sendPasswordResetEmail: Send password reset link to users
 * - Development mode: Console logging + dev URL display
 * - Production mode: Real emails via Resend
 * 
 * Environment Variables:
 * - RESEND_API_KEY: Resend API key (get from https://resend.com/api-keys)
 * - NODE_ENV: 'development' or 'production'
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

import { Resend } from 'resend';

// Initialize Resend client (only if API key is available)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
 * The link expires after 24 hours.
 * 
 * In development mode: Logs to console and returns devResetUrl for yellow box
 * In production mode: Sends real email via Resend
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

  // Determine if we should send real emails
  const shouldSendRealEmails = process.env.SEND_REAL_EMAILS === 'true';
  
  // Debug: Log environment
  console.log('\n� SENDING PASSWORD RESET EMAIL...');
  console.log('�🔍 Email Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    SEND_REAL_EMAILS: process.env.SEND_REAL_EMAILS,
    hasResendKey: !!resend,
    willSendEmail: shouldSendRealEmails && !!resend
  });

  // Development mode - console logging + dev URL
  if (!shouldSendRealEmails) {
    console.log('\n🔔 SENDING PASSWORD RESET EMAIL (DEV MODE)...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 To: ${email}`);
    console.log(`👤 Name: ${name || 'User'}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return { 
      success: true, 
      devResetUrl: resetUrl,
      messageId: `dev-${Date.now()}`,
      recipient: email
    };
  }

  // Production mode - send real email via Resend
  console.log('\n📧 SENDING REAL EMAIL via Resend...');
  
  if (!resend) {
    console.error('❌ RESEND_API_KEY not configured!');
    throw new Error('Email service not configured. Please add RESEND_API_KEY to environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fasting Tracker <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password - Fasting Tracker',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Password Reset Request</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; margin: 0 0 20px;">Hi ${name || 'there'},</p>
              
              <p style="font-size: 16px; margin: 0 0 20px;">
                We received a request to reset your password for your Fasting Tracker account.
              </p>
              
              <p style="font-size: 16px; margin: 0 0 30px;">
                Click the button below to reset your password:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin: 30px 0 10px;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="font-size: 13px; color: #4F46E5; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px; margin: 0 0 30px;">
                ${resetUrl}
              </p>
              
              <!-- Warning Box -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400E;">
                  <strong>⏰ This link will expire in 24 hours.</strong>
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin: 20px 0 0;">
                If you didn't request this password reset, you can safely ignore this email. 
                Your password will not be changed.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                This is an automated email from Fasting Tracker.
              </p>
              <p style="color: #999; font-size: 11px; margin: 0;">
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
Hi ${name || 'there'},

We received a request to reset your password for your Fasting Tracker account.

Reset your password by clicking this link:
${resetUrl}

This link will expire in 24 hours.

If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.

---
This is an automated email from Fasting Tracker. Please do not reply to this email.
      `.trim()
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully via Resend:', data.id);
    return { 
      success: true, 
      messageId: data.id,
      recipient: email
    };
    
  } catch (error) {
    console.error('❌ Email sending exception:', error);
    throw error;
  }
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
