/**
 * FeaturesList Component (Organism)
 * 
 * Apple-inspired grid of features with glassmorphism cards.
 * Smooth animations and hover effects.
 */

const features = [
  {
    id: 'timer-tracking',
    icon: '⏱️',
    title: 'Timer Tracking',
    description: 'Start and stop your fasting timer with ease. Track your progress in real-time and stay motivated.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'progress-history',
    icon: '📊',
    title: 'Progress History',
    description: 'View your complete fasting history with detailed statistics and trends to understand your journey.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'custom-goals',
    icon: '🎯',
    title: 'Custom Goals',
    description: 'Set personalized fasting goals that match your lifestyle and health objectives.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ratings-notes',
    icon: '📝',
    title: 'Ratings & Notes',
    description: 'Rate your fasting experience and add notes to track how you feel during each session.',
    color: 'from-cyan-500 to-teal-500'
  },
  {
    id: 'user-preferences',
    icon: '⚙️',
    title: 'User Preferences',
    description: 'Customize your experience with personalized settings for timezone and fasting goals.',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    id: 'secure-private',
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. We prioritize your privacy with industry-standard security.',
    color: 'from-emerald-500 to-green-500'
  }
];

export default function FeaturesList() {
  return (
    <section 
      className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white" 
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 
            id="features-heading" 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Everything You Need to{' '}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you track, analyze, and achieve your fasting goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article 
              key={feature.id} 
              className="group card hover-lift animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-soft-lg group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl" role="img" aria-hidden="true">
                  {feature.icon}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-4 text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                Learn more 
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <a 
            href="/register" 
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl shadow-soft-lg hover:shadow-soft-xl hover:scale-105 transition-all duration-300"
          >
            Start Tracking for Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
