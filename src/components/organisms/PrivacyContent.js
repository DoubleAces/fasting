/**
 * PrivacyContent Organism Component
 * 
 * Complete Privacy Policy content with all 10 required sections.
 * Includes GDPR/CCPA compliant disclosures for health information handling.
 * 
 * @returns {React.ReactElement} PrivacyContent component
 */

import PrivacySection from '../atoms/PrivacySection';

export default function PrivacyContent() {
  const effectiveDate = 'October 21, 2025';
  const lastUpdated = 'October 21, 2025';

  return (
    <article>
      {/* Header with dates */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Effective Date:</strong> {effectiveDate}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Last Updated:</strong> {lastUpdated}
        </p>
      </div>

      {/* Section 1: Information We Collect (FR-003a) */}
      <PrivacySection
        id="information-we-collect"
        title="Information We Collect"
      >
        <p className="mb-4">
          We collect information that you provide directly to us when you create an account, use our fasting tracking features, and interact with our service. This includes:
        </p>
        
        <p className="font-semibold mb-2">Personal Information:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Name and email address</li>
          <li>Authentication credentials (if using email/password registration)</li>
          <li>Profile information (optional)</li>
        </ul>

        <p className="font-semibold mb-2">Health and Fasting Data:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Fasting start and end times</li>
          <li>Fasting duration and goals</li>
          <li>Weight tracking (optional)</li>
          <li>Notes and journal entries related to fasting</li>
        </ul>

        <p className="font-semibold mb-2">Usage Information:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>App interactions and feature usage</li>
          <li>Device information (browser type, operating system)</li>
          <li>Log data (access times, pages viewed)</li>
        </ul>

        <p className="mb-4">
          <strong>Third-Party Authentication:</strong> If you sign in using Google OAuth, we receive your name, email address, and profile picture from Google. Please review Google's Privacy Policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a> for information about their data practices.
        </p>
      </PrivacySection>

      {/* Section 2: How We Use Your Information (FR-003b) */}
      <PrivacySection
        id="how-we-use-your-information"
        title="How We Use Your Information"
      >
        <p className="mb-4">We use the information we collect to:</p>
        
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Provide our service:</strong> Track your fasting periods, display your progress, and enable fasting goals</li>
          <li><strong>Communicate with you:</strong> Send account notifications, respond to your inquiries, and provide customer support</li>
          <li><strong>Improve our service:</strong> Analyze usage patterns to enhance features and user experience</li>
          <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
          <li><strong>Comply with legal obligations:</strong> Respond to legal requests and prevent harm</li>
        </ul>

        <p className="mb-4">
          We do not use your personal data or health information for advertising, marketing to third parties, or any purpose other than providing and improving the Fasting Tracker service.
        </p>
      </PrivacySection>

      {/* Section 3: Data Storage and Security (FR-003c) */}
      <PrivacySection
        id="data-storage-and-security"
        title="Data Storage and Security"
      >
        <p className="mb-4">
          We take the security of your personal and health information seriously and implement industry-standard security measures:
        </p>
        
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Encryption:</strong> Your data is encrypted at rest in our MongoDB database and in transit using TLS/SSL</li>
          <li><strong>Access controls:</strong> Only authorized personnel have access to user data, and access is logged</li>
          <li><strong>Authentication:</strong> Secure session management using Auth.js with secure cookies</li>
          <li><strong>Regular security audits:</strong> We review our security practices and update them as needed</li>
        </ul>

        <p className="mb-4">
          While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we continuously work to improve our security measures.
        </p>

        <p className="mb-4">
          <strong>Data Retention:</strong> We retain your account data and fasting logs until you delete your account, plus a 30-day grace period for potential account recovery. After this period, your data is permanently deleted.
        </p>
      </PrivacySection>

      {/* Section 4: Data Sharing and Disclosure (FR-003d) */}
      <PrivacySection
        id="data-sharing-and-disclosure"
        title="Data Sharing and Disclosure"
      >
        <p className="mb-4">
          <strong>We do not sell your personal data.</strong> We only share your information in the following limited circumstances:
        </p>
        
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Service providers:</strong> We may share data with trusted third-party service providers who help us operate our service (e.g., cloud hosting, email delivery). These providers are contractually obligated to protect your data and only use it for the purposes we specify.</li>
          <li><strong>Google OAuth:</strong> If you use Google sign-in, Google processes your authentication. Google does not receive your fasting data or app usage information.</li>
          <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government request, or to protect our rights and safety.</li>
          <li><strong>Business transfers:</strong> If Fasting Tracker is acquired or merged with another company, your information may be transferred as part of that transaction.</li>
        </ul>

        <p className="mb-4">
          We never share your health information (fasting data, weight, notes) with insurance companies, employers, or any third parties for marketing purposes.
        </p>
      </PrivacySection>

      {/* Section 5: Your Privacy Rights (FR-003e) */}
      <PrivacySection
        id="your-privacy-rights"
        title="Your Privacy Rights"
      >
        <p className="mb-4">
          You have the following rights regarding your personal data:
        </p>
        
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Right to access:</strong> You can request a copy of all personal data we hold about you</li>
          <li><strong>Right to correction:</strong> You can update or correct your account information at any time</li>
          <li><strong>Right to deletion:</strong> You can request that we delete your account and all associated data</li>
          <li><strong>Right to data portability:</strong> You can request an export of your data in a machine-readable format (JSON)</li>
          <li><strong>Right to object:</strong> You can object to certain processing of your data</li>
          <li><strong>Right to restrict processing:</strong> You can request that we limit how we use your data</li>
        </ul>

        <p className="mb-4">
          <strong>Exercising Your Rights:</strong> To exercise any of these rights, please email us at <a href="mailto:privacy@fastingtracker.app" className="text-blue-600 hover:underline">privacy@fastingtracker.app</a>. We will respond to your request within 30 days as required by GDPR and CCPA.
        </p>

        <p className="mb-4">
          <strong>EU Residents:</strong> If you are located in the European Union, you have the right to lodge a complaint with your local data protection authority.
        </p>

        <p className="mb-4">
          <strong>California Residents:</strong> Under CCPA, you have additional rights including the right to know what personal information is being collected and the right to opt-out of the sale of personal information (note: we do not sell personal information).
        </p>
      </PrivacySection>

      {/* Section 6: Cookies and Tracking (FR-003f) */}
      <PrivacySection
        id="cookies-and-tracking"
        title="Cookies and Tracking"
      >
        <p className="mb-4">
          We use cookies and similar technologies to maintain your session and ensure the security of our service. We use the following types of cookies:
        </p>
        
        <p className="font-semibold mb-2">Essential Cookies (Required):</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>authjs.session-token:</strong> Maintains your login session</li>
          <li><strong>authjs.csrf-token:</strong> Protects against cross-site request forgery attacks</li>
          <li><strong>authjs.callback-url:</strong> Manages authentication redirects</li>
        </ul>

        <p className="mb-4">
          <strong>We do not use:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Third-party advertising cookies</li>
          <li>Analytics cookies from external services (Google Analytics, etc.)</li>
          <li>Social media tracking pixels</li>
          <li>Cross-site tracking technologies</li>
        </ul>

        <p className="mb-4">
          <strong>Managing Cookies:</strong> You can control cookies through your browser settings. However, disabling essential cookies will prevent you from logging in and using Fasting Tracker. Please refer to your browser's help documentation for instructions on managing cookies.
        </p>
      </PrivacySection>

      {/* Section 7: Health Information (FR-003g) */}
      <PrivacySection
        id="health-information"
        title="Health Information"
      >
        <p className="mb-4">
          <strong>Important:</strong> Your fasting data (start/end times, duration, weight, notes) is considered health information and receives special protection.
        </p>
        
        <p className="mb-4">
          <strong>How We Handle Health Information:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Not shared:</strong> We never share your fasting data with insurance companies, employers, health providers, or third parties</li>
          <li><strong>Not for medical advice:</strong> Our service is a tracking tool only. We do not provide medical advice, diagnosis, or treatment recommendations</li>
          <li><strong>User control:</strong> You can export or delete your fasting data at any time</li>
          <li><strong>Retention:</strong> Your fasting data is retained until you delete your account, plus a 30-day recovery period</li>
        </ul>

        <p className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <strong>Medical Disclaimer:</strong> Fasting Tracker is not a medical device or service. You should consult with a qualified healthcare provider before beginning any fasting regimen. Do not rely on this app for medical advice or to make health decisions.
        </p>

        <p className="mb-4">
          <strong>Permitted Uses:</strong> Your health information is only used to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Display your fasting history and progress</li>
          <li>Calculate statistics (average fasting time, streaks, etc.)</li>
          <li>Provide the core functionality of the fasting tracking service</li>
        </ul>
      </PrivacySection>

      {/* Section 8: Children's Privacy (FR-003h) */}
      <PrivacySection
        id="childrens-privacy"
        title="Children's Privacy"
      >
        <p className="mb-4">
          Fasting Tracker is intended for users who are at least <strong>16 years of age</strong>. We do not knowingly collect personal information from children under 16.
        </p>
        
        <p className="mb-4">
          If you are under 16 years old, please do not use this service or provide any personal information. Fasting may not be appropriate for minors, and we strongly recommend that anyone under 18 consult with a healthcare provider and parent/guardian before considering any fasting practice.
        </p>

        <p className="mb-4">
          <strong>If We Learn We Have Collected Data from a Child:</strong> If we become aware that we have collected personal information from a child under 16, we will take steps to delete that information as quickly as possible.
        </p>

        <p className="mb-4">
          <strong>Parents and Guardians:</strong> If you believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@fastingtracker.app" className="text-blue-600 hover:underline">privacy@fastingtracker.app</a> and we will delete the information.
        </p>
      </PrivacySection>

      {/* Section 9: International Users (FR-003i) */}
      <PrivacySection
        id="international-users"
        title="International Users"
      >
        <p className="mb-4">
          Fasting Tracker is operated from the United States. Your information is stored on servers located in the United States (MongoDB Atlas).
        </p>
        
        <p className="mb-4">
          <strong>Data Transfers:</strong> If you are accessing our service from outside the United States, please be aware that your information may be transferred to, stored in, and processed in the United States, where data protection laws may differ from those in your country.
        </p>

        <p className="mb-4">
          <strong>GDPR Compliance (EU/EEA Users):</strong>
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>We use Standard Contractual Clauses for data transfers from the EU to the US</li>
          <li>You have the rights outlined in the "Your Privacy Rights" section above</li>
          <li>Our lawful basis for processing your data is your consent (by creating an account)</li>
          <li>You may withdraw consent and request deletion at any time</li>
        </ul>

        <p className="mb-4">
          <strong>CCPA Compliance (California Residents):</strong>
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>We do not sell your personal information</li>
          <li>You have the right to request disclosure of data collected and shared</li>
          <li>You have the right to request deletion of your personal information</li>
          <li>We will not discriminate against you for exercising your CCPA rights</li>
        </ul>

        <p className="mb-4">
          <strong>Other Jurisdictions:</strong> We strive to comply with privacy laws in all jurisdictions where we operate. If you have questions about how local laws apply to your data, please contact us at <a href="mailto:privacy@fastingtracker.app" className="text-blue-600 hover:underline">privacy@fastingtracker.app</a>.
        </p>
      </PrivacySection>

      {/* Section 10: Contact Information (FR-003j) */}
      <PrivacySection
        id="contact-information"
        title="Contact Information"
      >
        <p className="mb-4">
          If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        
        <p className="mb-4">
          <strong>Privacy Inquiries:</strong><br />
          Email: <a href="mailto:privacy@fastingtracker.app" className="text-blue-600 hover:underline">privacy@fastingtracker.app</a><br />
          Response Time: We will respond to privacy requests within 30 days
        </p>

        <p className="mb-4">
          <strong>General Support:</strong><br />
          Email: <a href="mailto:support@fastingtracker.app" className="text-blue-600 hover:underline">support@fastingtracker.app</a>
        </p>

        <p className="mb-4">
          <strong>Data Protection Officer:</strong><br />
          For GDPR-related inquiries, you may contact our Data Protection Officer at <a href="mailto:privacy@fastingtracker.app" className="text-blue-600 hover:underline">privacy@fastingtracker.app</a>
        </p>

        <p className="mb-4">
          <strong>Changes to This Privacy Policy:</strong><br />
          We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through a prominent notice in the application. Your continued use of Fasting Tracker after changes are posted constitutes your acceptance of the updated policy.
        </p>

        <p className="mb-4">
          <strong>Last Updated:</strong> {lastUpdated}
        </p>
      </PrivacySection>
    </article>
  );
}
