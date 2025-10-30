import TermsContent from '@/components/organisms/TermsContent';
import TermsPageClient from '@/components/molecules/TermsPageClient';

/**
 * Terms and Conditions Page
 * 
 * Server Component for displaying the complete Terms and Conditions.
 * Accessible to unauthenticated users (required for registration flow).
 * Includes SEO metadata for search engine indexing.
 * Supports anchor links to specific sections (e.g., /terms#health-disclaimer)
 */

export const metadata = {
  title: 'Terms and Conditions | Fasting Tracker',
  description: 'Read our terms and conditions for using the Fasting Tracker application. Includes important health disclaimers and usage guidelines.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <TermsPageClient>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-white">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-[120px] opacity-30"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400 to-indigo-400 rounded-full blur-[120px] opacity-25"></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium">
                <span>Home</span>
                <span className="text-purple-300">/</span>
                <span>Terms & Conditions</span>
              </span>
            </div>

            {/* Hero heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 pb-2">
              <span className="text-gray-900">Terms</span>
              {' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                & Conditions
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using our fasting tracker application.
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
            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-sm">
              <TermsContent />
            </div>

            {/* Important Notice */}
            <div className="mt-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Important Health Disclaimer
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    This application is for informational purposes only and is not a substitute for professional medical advice. 
                    Always consult with a qualified healthcare provider before starting any fasting regimen, especially if you 
                    have any pre-existing medical conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Questions about these terms?{' '}
                <a 
                  href="mailto:legal@fastingtracker.app" 
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  Contact our legal team
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </TermsPageClient>
  );
}
