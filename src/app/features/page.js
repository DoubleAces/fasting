/**
 * Features Page - Apple-Inspired Design
 * 
 * Public page showcasing the key features of the Fasting Tracker application.
 * Accessible to both authenticated and unauthenticated users.
 */

import Link from 'next/link';

export const metadata = {
  title: 'Features - Fasting Tracker',
  description: 'Discover the powerful features of our fasting tracker app. Track your fasting windows, monitor progress, and achieve your health goals with our secure, easy-to-use platform.',
  keywords: 'fasting tracker features, intermittent fasting app, fasting tools, health tracking, weight loss tracker, fasting timer features',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features - Fasting Tracker',
    description: 'Discover the powerful features of our fasting tracker app. Track your fasting windows, monitor progress, and achieve your health goals.',
    url: 'https://fastingtracker.app/features',
    siteName: 'Fasting Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fasting Tracker Features',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features - Fasting Tracker',
    description: 'Discover the powerful features of our fasting tracker app.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FeaturesPage() {
  const features = [
    {
      title: 'Timer Tracking',
      description: 'Start and stop your fasting timer with ease. Track your progress in real-time and stay motivated.',
      icon: '⏱️',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Progress History',
      description: 'View your complete fasting history with detailed statistics and trends to understand your journey.',
      icon: '📊',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Custom Goals',
      description: 'Set personalized fasting goals that match your lifestyle and health objectives.',
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Ratings & Notes',
      description: 'Rate your fasting experience and add notes to track how you feel during each session.',
      icon: '�',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      title: 'User Preferences',
      description: 'Customize your experience with personalized settings for timezone and fasting goals.',
      icon: '⚙️',
      color: 'from-teal-500 to-emerald-500'
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We prioritize your privacy with industry-standard security.',
      icon: '🔒',
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Google Sign-In',
      description: 'Quick and easy authentication with your Google account. No need to remember another password.',
      icon: '�',
      color: 'from-green-500 to-lime-500'
    },
    {
      title: 'Progress Insights',
      description: 'See your fasting patterns over time and understand your progress with clear visualizations.',
      icon: '📈',
      color: 'from-lime-500 to-yellow-500'
    },
    {
      title: 'Multi-Device Sync',
      description: 'Access your data from any device. Your fasting entries sync automatically across all your devices.',
      icon: '🔄',
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-300 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-300 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Powerful Features for Your{' '}
            <span className="gradient-text">Fasting Journey</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to track, monitor, and optimize your intermittent fasting routine.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article 
                key={index} 
                className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} shadow-soft mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                {/* Content */}
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-12 shadow-soft-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Fasting Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are achieving their health goals with our fasting tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl shadow-soft-lg hover:shadow-soft-xl hover:scale-105 transition-all duration-300"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/faq" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-300 hover:bg-gray-50 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
