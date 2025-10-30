/**
 * Features Page - Apple-Inspired Design
 * 
 * Public page showcasing the key features of the Fasting Tracker application.
 * Accessible to both authenticated and unauthenticated users.
 */

import Link from 'next/link';
import { auth } from '@/lib/auth';

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

export default async function FeaturesPage() {
  const session = await auth();
  const isAuthenticated = !!session;

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-[120px] opacity-25"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Breadcrumb */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium">
              <span>Home</span>
              <span className="text-purple-300">/</span>
              <span>Features</span>
            </span>
          </div>

          {/* Hero heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 pb-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            {' '}
            <span className="text-gray-900">to Succeed</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Track, monitor, and optimize your intermittent fasting with powerful features designed for real results.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">9+</div>
              <div className="text-xs text-gray-600 mt-1">Core Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">10k+</div>
              <div className="text-xs text-gray-600 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">4.9★</div>
              <div className="text-xs text-gray-600 mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article 
                key={index} 
                className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient border effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/20 group-hover:to-pink-400/20 transition-all duration-300 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Benefit badge */}
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600">
                    <span className="text-purple-500">✓</span>
                    {feature.benefit}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 pb-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Why Choose Our Fasting Tracker?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with best practices and designed for real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Simple & Intuitive */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simple & Intuitive</h3>
              <p className="text-gray-600 leading-relaxed">
                No complicated features or overwhelming interfaces. Just simple, effective tracking that works.
              </p>
            </div>

            {/* Privacy First */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your health data is yours alone. End-to-end encryption and strict privacy policies protect your information.
              </p>
            </div>

            {/* Science-Backed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Science-Backed</h3>
              <p className="text-gray-600 leading-relaxed">
                Built on proven intermittent fasting principles and research-backed methodologies for optimal results.
              </p>
            </div>

            {/* Always Improving */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Always Improving</h3>
              <p className="text-gray-600 leading-relaxed">
                Regular updates, new features, and continuous improvements based on user feedback and latest research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Put These Features to Work
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Start tracking your fasts and see how these powerful features help you achieve your health goals.
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
                  href="/faq" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Start Your Fasting Journey?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 10,000+ users who are achieving their health goals with our powerful, easy-to-use fasting tracker.
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
                  href="/faq" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
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
