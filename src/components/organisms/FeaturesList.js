/**
 * FeaturesList Component (Organism)
 * 
 * Grid of features showcasing the fasting tracker's key capabilities.
 * Displays features with icons, headings, and descriptions.
 * 
 * Features:
 * - Responsive grid layout (1-3 columns)
 * - Feature cards with icons, headings, descriptions
 * - Section heading and subheading
 * - Hover effects for interactivity
 * - Accessible semantic structure
 */

import styles from './FeaturesList.module.css';

const features = [
  {
    id: 'timer-tracking',
    icon: '⏱️',
    title: 'Timer Tracking',
    description: 'Start and stop your fasting timer with ease. Track your progress in real-time and stay motivated.'
  },
  {
    id: 'progress-history',
    icon: '📊',
    title: 'Progress History',
    description: 'View your complete fasting history with detailed statistics and trends to understand your journey.'
  },
  {
    id: 'custom-goals',
    icon: '🎯',
    title: 'Custom Goals',
    description: 'Set personalized fasting goals that match your lifestyle and health objectives.'
  },
  {
    id: 'ratings-notes',
    icon: '📝',
    title: 'Ratings & Notes',
    description: 'Rate your fasting experience and add notes to track how you feel during each session.'
  },
  {
    id: 'user-preferences',
    icon: '⚙️',
    title: 'User Preferences',
    description: 'Customize your experience with personalized settings for timezone and fasting goals.'
  },
  {
    id: 'secure-private',
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. We prioritize your privacy with industry-standard security.'
  }
];

export default function FeaturesList() {
  return (
    <section className={styles.featuresSection} aria-labelledby="features-heading">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 id="features-heading" className={styles.heading}>
            Everything You Need to Succeed
          </h2>
          <p className={styles.subheading}>
            Powerful features designed to help you track, analyze, and achieve your fasting goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.grid}>
          {features.map((feature) => (
            <article key={feature.id} className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon} role="img" aria-hidden="true">
                  {feature.icon}
                </span>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
