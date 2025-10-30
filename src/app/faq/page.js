/**
 * FAQ Page - SEO Optimized with Server-Side Rendering
 */

import dbConnect from '@/lib/db';
import FAQItem from '@/lib/models/FAQItem';
import FAQList from '@/components/organisms/FAQList';
import Link from 'next/link';
import { auth } from '@/lib/auth';

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
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-[120px] opacity-25"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium">
              <span>Home</span>
              <span className="text-purple-300">/</span>
              <span>FAQ</span>
            </span>
          </div>

          {/* Hero heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 pb-2">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Questions?
            </span>
            {' '}
            <span className="text-gray-900">We've Got Answers</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about intermittent fasting and our tracker app
          </p>
        </div>
      </section>

      {/* FAQ Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* FAQ List with Search */}
          <FAQList faqs={faqs} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Still Need Help?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Check out your fasting entries or reach out to support for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/entries"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  View Your Fasts
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Explore Features
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 10,000+ users who are achieving their health goals with our easy-to-use fasting tracker.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  View Features
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
