/**
 * Hero Component (Organism)
 * 
 * Hero section for the homepage with headline, subheadline, and CTAs.
 * Eye-catching introduction to the fasting tracker application.
 * 
 * Features:
 * - Main headline with emphasis
 * - Supporting subheadline text
 * - Primary and secondary CTA buttons
 * - Centered layout with responsive design
 * - Gradient background for visual appeal
 */

import Link from '@/components/atoms/Link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Headline */}
          <h1 id="hero-heading" className={styles.headline}>
            Take Control of Your{' '}
            <span className={styles.headlineEmphasis}>Fasting Journey</span>
          </h1>

          {/* Subheadline */}
          <p className={styles.subheadline}>
            Track your fasting windows, monitor your progress, and achieve your health goals 
            with our intuitive fasting tracker. Start your transformation today.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaButtons}>
            <Link href="/signup" variant="primary" className={styles.primaryCta}>
              Get Started Free
            </Link>
            <Link href="/features" variant="secondary" className={styles.secondaryCta}>
              Learn More
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className={styles.highlights}>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>⏱️</span>
              <span className={styles.highlightText}>Easy Tracking</span>
            </div>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>📊</span>
              <span className={styles.highlightText}>Progress Insights</span>
            </div>
            <div className={styles.highlight}>
              <span className={styles.highlightIcon}>🎯</span>
              <span className={styles.highlightText}>Goal Setting</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
