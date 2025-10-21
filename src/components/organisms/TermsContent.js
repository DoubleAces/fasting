/**
 * TermsContent Organism Component
 * 
 * Complete Terms and Conditions content with all 10 sections.
 * Includes health-specific disclaimers for fasting tracking app.
 * 
 * @returns {React.ReactElement} TermsContent component
 */

import TermsSection from '../atoms/TermsSection';

export default function TermsContent() {
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

      {/* Section 1: Introduction */}
      <TermsSection
        id="introduction"
        title="Introduction"
        content={`Welcome to Fasting Tracker. By creating an account or using our service, you agree to be bound by these Terms and Conditions. Please read them carefully before using the application.

These terms govern your access to and use of the Fasting Tracker application, including any content, functionality, and services offered. If you do not agree to these terms, you must not access or use the application.`}
      />

      {/* Section 2: Account Terms */}
      <TermsSection
        id="account-terms"
        title="Account Terms"
        content={`You must create an account to use Fasting Tracker. When creating an account, you must provide accurate and complete information. You are responsible for maintaining the security of your account credentials.

You may not:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Share your account with others</li>
  <li>Create multiple accounts for yourself</li>
  <li>Use another person's account without permission</li>
  <li>Create an account using false or misleading information</li>
</ul>

We reserve the right to suspend or terminate accounts that violate these terms.`}
      />

      {/* Section 3: User Responsibilities */}
      <TermsSection
        id="user-responsibilities"
        title="User Responsibilities"
        content={`You are responsible for all activity that occurs under your account. You agree to:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Use the service for lawful purposes only</li>
  <li>Maintain accurate and current information</li>
  <li>Keep your login credentials confidential</li>
  <li>Notify us immediately of any unauthorized account access</li>
  <li>Use the fasting tracking features responsibly and in consultation with healthcare providers as needed</li>
</ul>

You must not attempt to interfere with, compromise, or disrupt the service or servers.`}
      />

      {/* Section 4: Health Disclaimer (HIGHLIGHTED) */}
      <TermsSection
        id="health-disclaimer"
        title="Health Disclaimer"
        highlighted={true}
        content={`<strong>IMPORTANT:</strong> Fasting Tracker is a tracking and informational tool only and is <strong>not medical advice</strong>. You should always consult with a qualified healthcare provider before beginning any fasting regimen or making changes to your diet or health practices.

<strong>Medical Consultation Required:</strong> Fasting may not be appropriate for everyone. You <strong>must</strong> consult with your healthcare provider if you:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Are pregnant or breastfeeding</li>
  <li>Have diabetes or blood sugar regulation issues</li>
  <li>Have a history of eating disorders</li>
  <li>Have any chronic medical conditions</li>
  <li>Are taking medications that require food</li>
  <li>Are under 18 years of age</li>
  <li>Have concerns about whether fasting is safe for you</li>
</ul>

<strong>No Liability:</strong> We are not responsible for any health consequences resulting from your use of this application. Any health data or recommendations provided are for informational purposes only and do not constitute medical advice. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding fasting or your health.`}
      />

      {/* Section 5: Privacy Notice */}
      <TermsSection
        id="privacy-notice"
        title="Privacy Notice"
        content={`Your privacy is important to us. We collect and process personal information in accordance with applicable data protection laws. The information you provide when creating an account and using our service is stored securely.

<strong>Data We Collect:</strong>
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Account information (email, name)</li>
  <li>Fasting tracking data you choose to record</li>
  <li>Usage information to improve our service</li>
</ul>

We do not sell your personal information to third parties. For complete details about how we handle your data, please review our Privacy Policy (if available separately).`}
      />

      {/* Section 6: Service Usage */}
      <TermsSection
        id="service-usage"
        title="Service Usage"
        content={`You agree to use Fasting Tracker in accordance with these terms and all applicable laws. The service is provided "as is" without warranties of any kind.

<strong>Acceptable Use:</strong> You may use the service to track your fasting periods, view your fasting history, and access related features for personal, non-commercial use.

<strong>Prohibited Use:</strong> You may not use the service to:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Violate any laws or regulations</li>
  <li>Infringe on intellectual property rights</li>
  <li>Transmit harmful code or malware</li>
  <li>Attempt to gain unauthorized access to our systems</li>
  <li>Use automated tools to access the service (without permission)</li>
</ul>

We reserve the right to modify or discontinue the service at any time.`}
      />

      {/* Section 7: Termination */}
      <TermsSection
        id="termination"
        title="Termination"
        content={`You may terminate your account at any time by contacting us or using the account deletion feature (if available).

We reserve the right to suspend or terminate your account if you:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Violate these Terms and Conditions</li>
  <li>Provide false or misleading information</li>
  <li>Engage in abusive or harmful behavior</li>
  <li>Use the service in a manner that harms our operations or other users</li>
</ul>

Upon termination, your access to the service will cease, and your data may be deleted in accordance with our data retention policies.`}
      />

      {/* Section 8: Liability Limitations */}
      <TermsSection
        id="liability-limitations"
        title="Liability Limitations"
        content={`To the maximum extent permitted by law, Fasting Tracker and its developers, operators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
<ul class="list-disc pl-6 mt-2 mb-4">
  <li>Loss of profits, data, or goodwill</li>
  <li>Service interruptions or errors</li>
  <li>Health consequences from fasting or use of this application</li>
  <li>Unauthorized access to your account</li>
  <li>Any other damages arising from use of the service</li>
</ul>

<strong>No Warranty:</strong> The service is provided "as is" and "as available" without any warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

Some jurisdictions do not allow the exclusion of certain warranties or liability limitations, so the above limitations may not apply to you.`}
      />

      {/* Section 9: Dispute Resolution */}
      <TermsSection
        id="dispute-resolution"
        title="Dispute Resolution"
        content={`Any disputes arising from these Terms and Conditions or your use of Fasting Tracker shall be governed by and construed in accordance with the laws of the jurisdiction where the service is operated, without regard to conflict of law principles.

<strong>Informal Resolution:</strong> Before filing any formal dispute, you agree to first contact us to attempt to resolve the issue informally.

<strong>Governing Law:</strong> These terms shall be governed by applicable laws. Any legal action or proceeding related to your access to or use of the service shall be instituted in the appropriate courts.

<strong>Class Action Waiver:</strong> To the extent permitted by law, you agree to resolve disputes on an individual basis and waive any right to bring claims as a class action.`}
      />

      {/* Section 10: Contact Information */}
      <TermsSection
        id="contact-information"
        title="Contact Information"
        content={`If you have any questions, concerns, or feedback regarding these Terms and Conditions or the Fasting Tracker service, please contact us:

<strong>Email:</strong> <a href="mailto:support@fastingtracker.app" class="text-primary-600 dark:text-primary-400 hover:underline">support@fastingtracker.app</a>

We will make reasonable efforts to respond to your inquiries in a timely manner.

<strong>Updates to Terms:</strong> We may update these Terms and Conditions from time to time. When we make changes, we will update the "Last Updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated terms.`}
      />
    </article>
  );
}
