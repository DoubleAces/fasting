/**
 * Privacy Policy Page
 * 
 * Publicly accessible privacy policy page at /privacy route.
 * Displays comprehensive GDPR/CCPA compliant privacy policy with 10 sections.
 * 
 * Features:
 * - Server Component for optimal performance and SEO
 * - Section anchor navigation support
 * - Mobile-responsive design
 * - Keyboard accessible
 */

import PrivacyPageClient from '@/components/molecules/PrivacyPageClient';
import PrivacyContent from '@/components/organisms/PrivacyContent';

// Metadata for SEO
export const metadata = {
  title: 'Privacy Policy | Fasting Tracker',
  description: 'Learn how Fasting Tracker collects, uses, and protects your personal data and health information. GDPR and CCPA compliant privacy policy.',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy | Fasting Tracker',
    description: 'Our commitment to protecting your privacy and health data.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 sm:p-12">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal and health information.
          </p>
        </header>

        {/* Main Content with Client-Side Anchor Handling */}
        <PrivacyPageClient>
          <PrivacyContent />
        </PrivacyPageClient>

        {/* Footer Note */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Questions about this privacy policy? Contact us at{' '}
            <a 
              href="mailto:privacy@fastingtracker.app" 
              className="text-blue-600 hover:underline"
            >
              privacy@fastingtracker.app
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
