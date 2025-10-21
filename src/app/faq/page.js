/**
 * FAQ Page - SEO Optimized with Server-Side Rendering
 */

import dbConnect from '@/lib/db';
import FAQItem from '@/lib/models/FAQItem';
import FAQList from '@/components/organisms/FAQList';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ - Frequently Asked Questions | Fasting Tracker',
  description: 'Find answers to common questions about intermittent fasting, using our fasting tracker app, account management, and technical support.',
  keywords: 'fasting FAQ, intermittent fasting questions, fasting tracker help',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Fasting Tracker',
    description: 'Find answers to questions about intermittent fasting and our app.',
    url: 'https://fastingtracker.app/faq',
    siteName: 'Fasting Tracker',
    images: [{url: '/og-image.png', width: 1200, height: 630}],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Fasting Tracker',
    description: 'Find answers about intermittent fasting and our app.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Fetch FAQ data server-side for SEO
async function getFAQData() {
  try {
    await dbConnect();
    const groupedFaqs = await FAQItem.getAllGrouped();
    
    // Convert Mongoose documents to plain objects
    return JSON.parse(JSON.stringify(groupedFaqs));
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    // Return fallback data if database is unavailable
    return [
      {
        category: 'Getting Started',
        questions: [
          {
            question: 'What is intermittent fasting?',
            answer: "Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It doesn't specify which foods you should eat but rather when you should eat them.",
          },
        ],
      },
    ];
  }
}

export default async function FAQPage() {
  const faqs = await getFAQData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about our fasting tracker
          </p>
        </div>

        {/* FAQ List with Search */}
        <FAQList faqs={faqs} />

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-soft">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Ready to start your fasting journey? Sign up now and join thousands of users achieving their health goals.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl shadow-soft-lg hover:shadow-soft-xl hover:scale-105 transition-all duration-300"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
