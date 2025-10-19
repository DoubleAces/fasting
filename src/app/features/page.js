/**
 * Features Page
 * 
 * Public page showcasing the key features of the Fasting Tracker application.
 * Accessible to both authenticated and unauthenticated users.
 */

import styles from './features.module.css';

export const metadata = {
  title: 'Features - Fasting Tracker',
  description: 'Discover the powerful features of our fasting tracker app. Track your fasting windows, monitor progress, and achieve your health goals.',
  openGraph: {
    title: 'Features - Fasting Tracker',
    description: 'Discover the powerful features of our fasting tracker app.',
  },
};

export default function FeaturesPage() {
  const features = [
    {
      title: 'Easy Fasting Tracking',
      description: 'Log your fasting start and end times with just a few clicks. Our intuitive interface makes tracking effortless.',
      icon: '⏱️',
    },
    {
      title: 'Automatic Duration Calculation',
      description: 'Never do the math yourself. We automatically calculate your fasting duration and display it in an easy-to-read format.',
      icon: '🧮',
    },
    {
      title: 'Personal Dashboard',
      description: 'View all your fasting entries in one place. See your progress, patterns, and achievements at a glance.',
      icon: '📊',
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and securely stored. Only you can access your fasting history and personal information.',
      icon: '🔒',
    },
    {
      title: 'Google Sign-In',
      description: 'Quick and easy authentication with your Google account. No need to remember another password.',
      icon: '🔐',
    },
    {
      title: 'Customizable Settings',
      description: 'Personalize your experience with custom measurement systems and time formats that work for you.',
      icon: '⚙️',
    },
    {
      title: 'Add Notes',
      description: 'Keep track of how you felt during your fast, what you learned, or any observations to help optimize your routine.',
      icon: '📝',
    },
    {
      title: 'Progress Insights',
      description: 'See your fasting patterns over time and understand your progress with clear visualizations.',
      icon: '📈',
    },
    {
      title: 'Multi-Device Sync',
      description: 'Access your data from any device. Your fasting entries sync automatically across all your devices.',
      icon: '🔄',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Powerful Features for Your Fasting Journey</h1>
        <p className={styles.subtitle}>
          Everything you need to track, monitor, and optimize your intermittent fasting routine.
        </p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h2 className={styles.featureTitle}>{feature.title}</h2>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to Start Your Fasting Journey?</h2>
        <p className={styles.ctaText}>
          Join thousands of users who are achieving their health goals with our fasting tracker.
        </p>
        <div className={styles.ctaButtons}>
          <a href="/register" className={styles.primaryButton}>
            Get Started Free
          </a>
          <a href="/faq" className={styles.secondaryButton}>
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
