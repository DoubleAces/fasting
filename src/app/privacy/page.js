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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-[120px] opacity-25"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium">
              <span>Home</span>
              <span className="text-purple-300">/</span>
              <span>Privacy Policy</span>
            </span>
          </div>

          {/* Hero heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 pb-2">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Privacy
            </span>
            {' '}
            <span className="text-gray-900">Policy</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and protect your personal and health information.
          </p>

          {/* Last updated badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 text-sm text-gray-700">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last Updated: October 2025</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content with Client-Side Anchor Handling */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-sm">
            <PrivacyPageClient>
              <PrivacyContent />
            </PrivacyPageClient>
          </div>

          {/* Contact Footer */}
          <div className="mt-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border border-purple-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Questions About Our Privacy Policy?
            </h3>
            <p className="text-gray-600 mb-4">
              We're here to help clarify any concerns you may have.
            </p>
            <a 
              href="mailto:privacy@fastingtracker.app" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
            >
              Contact Privacy Team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
