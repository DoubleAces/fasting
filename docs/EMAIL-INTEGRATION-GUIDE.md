# Email Integration Guide

## Why Use an Email Service?

While you **can** send emails directly from a server, it's **not recommended** for production:

### Problems with Direct SMTP:
- 🚫 Poor deliverability (emails go to spam)
- 🚫 Cloud providers block port 25
- 🚫 Need to maintain SMTP infrastructure
- 🚫 No sending reputation
- 🚫 Complex DNS setup (SPF, DKIM, DMARC)
- 🚫 No retry logic or delivery tracking
- 🚫 Security risks (open relays, attacks)

### Benefits of Email Services:
- ✅ High deliverability (99%+ inbox rate)
- ✅ Free tiers available
- ✅ Simple API integration
- ✅ Automatic retries and error handling
- ✅ Email analytics
- ✅ Template management
- ✅ No infrastructure to maintain

## Recommended Email Services

### 1. Resend (Best for Modern Apps) ⭐
- **Free Tier:** 100 emails/day, 3,000/month
- **API:** Simple, modern REST API
- **Features:** React Email support, webhooks, analytics
- **Setup Time:** 5 minutes

```bash
npm install resend
```

```javascript
// src/lib/utils/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fasting Tracker <noreply@yourdomain.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${userName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, ignore this email.</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
```

**Environment Variable:**
```
RESEND_API_KEY=re_your_api_key_here
```

**Setup Steps:**
1. Sign up at https://resend.com
2. Verify your domain (or use resend.dev for testing)
3. Get API key from dashboard
4. Add to `.env.local`

---

### 2. SendGrid (Most Popular)
- **Free Tier:** 100 emails/day forever
- **API:** RESTful and SMTP options
- **Features:** Email templates, A/B testing, analytics
- **Setup Time:** 10 minutes

```bash
npm install @sendgrid/mail
```

```javascript
// src/lib/utils/email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  try {
    await sgMail.send({
      to: email,
      from: 'noreply@yourdomain.com', // Must be verified in SendGrid
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${userName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
}
```

**Environment Variable:**
```
SENDGRID_API_KEY=SG.your_api_key_here
```

**Setup Steps:**
1. Sign up at https://sendgrid.com
2. Create API key in Settings > API Keys
3. Verify sender identity (email or domain)
4. Add API key to `.env.local`

---

### 3. AWS SES (Best for AWS Users)
- **Free Tier:** 62,000 emails/month (if sending from EC2)
- **API:** AWS SDK
- **Features:** High volume, low cost, AWS integration
- **Setup Time:** 15 minutes

```bash
npm install @aws-sdk/client-ses
```

```javascript
// src/lib/utils/email.js
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  const params = {
    Source: 'noreply@yourdomain.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Reset Your Password' },
      Body: {
        Html: {
          Data: `
            <h1>Password Reset Request</h1>
            <p>Hi ${userName},</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 24 hours.</p>
          `
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error('SES error:', error);
    return { success: false, error: error.message };
  }
}
```

**Environment Variables:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

---

### 4. Nodemailer with Gmail (Quick Testing Only)
⚠️ **Not recommended for production** - Gmail has daily sending limits

```bash
npm install nodemailer
```

```javascript
// src/lib/utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
});

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  try {
    const info = await transporter.sendMail({
      from: `"Fasting Tracker" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${userName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Gmail error:', error);
    return { success: false, error: error.message };
  }
}
```

**Environment Variables:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

**Limitations:**
- Max 500 emails/day
- Poor deliverability
- Gmail may disable account for suspicious activity
- Not suitable for production

---

## Comparison Table

| Service | Free Tier | Setup Time | Deliverability | Best For |
|---------|-----------|------------|----------------|----------|
| **Resend** | 3,000/mo | 5 min | ⭐⭐⭐⭐⭐ | Modern apps, best DX |
| **SendGrid** | 3,000/mo | 10 min | ⭐⭐⭐⭐⭐ | Popular choice, proven |
| **AWS SES** | 62,000/mo* | 15 min | ⭐⭐⭐⭐⭐ | AWS users, high volume |
| **Mailgun** | 5,000/mo† | 10 min | ⭐⭐⭐⭐ | Transactional emails |
| **Postmark** | 100/mo | 10 min | ⭐⭐⭐⭐⭐ | Developer-focused |
| **Gmail** | 500/day | 5 min | ⭐⭐ | Testing only |

*Only if sending from EC2  
†First 3 months only

---

## Implementation Steps

### 1. Choose a Service
Recommended: **Resend** (modern, simple, great free tier)

### 2. Install Package
```bash
npm install resend
```

### 3. Add Environment Variable
```bash
# .env.local
RESEND_API_KEY=re_your_api_key_here
```

### 4. Update Email Utility

Replace the placeholder in `src/lib/utils/email.js`:

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email, resetUrl, userName) {
  // Development mode - return devResetUrl for yellow box
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔔 SENDING PASSWORD RESET EMAIL...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 To: ${email}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return { 
      success: true, 
      devResetUrl: resetUrl // Return URL for dev box
    };
  }

  // Production mode - send real email
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fasting Tracker <noreply@yourdomain.com>',
      to: email,
      subject: 'Reset Your Password - Fasting Tracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Password Reset Request</h1>
            <p>Hi ${userName || 'there'},</p>
            <p>We received a request to reset your password for your Fasting Tracker account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4F46E5; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this URL into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email. 
               Your password will not be changed.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from Fasting Tracker. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', data.id);
    return { success: true, messageId: data.id };
    
  } catch (error) {
    console.error('❌ Email sending exception:', error);
    return { success: false, error: error.message };
  }
}
```

### 5. Test in Development
The yellow dev box will still work in development mode.

### 6. Test in Production
Deploy to Vercel/production and test with a real email address.

---

## Email Template Best Practices

### 1. HTML Email Structure
- Use inline CSS (email clients strip `<style>` tags)
- Tables for layout (flexbox not supported)
- Simple, clean design
- Mobile-responsive

### 2. Content Guidelines
- Clear call-to-action (Reset Password button)
- Plain text fallback
- Expiration time stated clearly
- Contact information
- Unsubscribe link (for marketing emails)

### 3. Security Considerations
- Use HTTPS for all links
- Don't include sensitive data
- Make it obvious it's from your app
- Warn about phishing

---

## Advanced: React Email Templates

For professional email templates, use **React Email**:

```bash
npm install react-email @react-email/components
```

```javascript
// emails/password-reset.jsx
import { Html, Button, Container, Text } from '@react-email/components';

export default function PasswordResetEmail({ userName, resetUrl }) {
  return (
    <Html>
      <Container>
        <Text>Hi {userName},</Text>
        <Text>Click below to reset your password:</Text>
        <Button href={resetUrl}>Reset Password</Button>
        <Text>This link expires in 24 hours.</Text>
      </Container>
    </Html>
  );
}
```

---

## Monitoring and Analytics

### Track These Metrics:
- **Delivery Rate:** % of emails delivered
- **Bounce Rate:** % of emails bounced
- **Open Rate:** % of emails opened (if tracking enabled)
- **Click Rate:** % of reset links clicked
- **Spam Complaints:** Monitor and investigate

### Set Up Webhooks:
Most email services offer webhooks for:
- Delivery confirmation
- Bounces (hard/soft)
- Spam complaints
- Opens and clicks

---

## Cost Estimates

For 10,000 users receiving 1 password reset email each:

| Service | Cost |
|---------|------|
| Resend | Free (under 3,000/mo) or $20/mo |
| SendGrid | Free (under 3,000/mo) or $15/mo |
| AWS SES | $1 (10,000 emails at $0.10/1000) |
| Mailgun | Free (first 3 months) then $35/mo |

**Recommendation:** Start with Resend's free tier, upgrade as needed.

---

## Troubleshooting

### Emails Going to Spam
- Verify domain with SPF/DKIM/DMARC
- Use professional "from" address
- Avoid spam trigger words
- Include plain text version
- Monitor sender reputation

### Low Delivery Rate
- Check bounce logs
- Verify recipient addresses
- Monitor email service status
- Check DNS records

### High Costs
- Use transactional email service (not marketing)
- Implement email rate limiting
- Remove inactive/bounced addresses
- Monitor for abuse

---

## Conclusion

**For production, always use an email service.** The free tiers are generous enough for most applications, and the benefits (deliverability, reliability, analytics) far outweigh the minimal cost.

**Recommended for this project:** Resend (modern, simple, generous free tier)

**Setup time:** 5 minutes  
**Cost:** Free for first 3,000 emails/month
