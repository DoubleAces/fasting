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
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">
          Terms and Conditions
        </h1>
        
        <TermsContent />
      </div>
    </TermsPageClient>
  );
}
